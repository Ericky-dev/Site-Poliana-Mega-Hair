/**
 * Instagram Basic Display API Service
 * Fetches public feed from Instagram
 */

const https = require('https');

/**
 * Fetch Instagram feed using Basic Display API
 * @param {number} limit - Number of posts to fetch
 * @returns {Promise<Array>} Array of media objects
 */
async function fetchInstagramFeed(limit = 6) {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!accessToken) {
    console.log('Instagram access token not configured');
    return [];
  }

  const url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${accessToken}&limit=${limit}`;

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);

          if (response.error) {
            console.error('Instagram API error:', response.error);
            resolve([]);
            return;
          }

          const feed = response.data || [];

          // Format the feed data
          const formattedFeed = feed.map(post => ({
            id: post.id,
            caption: post.caption || '',
            type: post.media_type,
            url: post.media_url,
            thumbnail: post.thumbnail_url || post.media_url,
            link: post.permalink,
            timestamp: post.timestamp
          }));

          resolve(formattedFeed);
        } catch (error) {
          console.error('Error parsing Instagram response:', error);
          resolve([]);
        }
      });
    }).on('error', (error) => {
      console.error('Error fetching Instagram feed:', error);
      resolve([]);
    });
  });
}

/**
 * Refresh Instagram access token
 * Long-lived tokens need to be refreshed every 60 days
 * @returns {Promise<string|null>} New access token or null on error
 */
async function refreshAccessToken() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!accessToken) {
    return null;
  }

  const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`;

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);

          if (response.error) {
            console.error('Token refresh error:', response.error);
            resolve(null);
            return;
          }

          console.log('Instagram token refreshed. New expiry:', response.expires_in, 'seconds');
          resolve(response.access_token);
        } catch (error) {
          console.error('Error parsing token refresh response:', error);
          resolve(null);
        }
      });
    }).on('error', (error) => {
      console.error('Error refreshing token:', error);
      resolve(null);
    });
  });
}

module.exports = {
  fetchInstagramFeed,
  refreshAccessToken
};

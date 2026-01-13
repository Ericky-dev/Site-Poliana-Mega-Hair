const express = require('express');
const { fetchInstagramFeed } = require('../services/instagram');

const router = express.Router();

// Get Instagram feed
router.get('/instagram', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const feed = await fetchInstagramFeed(parseInt(limit));
    res.json({ feed });
  } catch (error) {
    console.error('Instagram feed error:', error);
    res.status(500).json({
      error: { message: 'Error fetching Instagram feed' },
      feed: []
    });
  }
});

// Get social links configuration
router.get('/links', (req, res) => {
  res.json({
    links: {
      instagram: process.env.INSTAGRAM_URL || 'https://instagram.com/beautysalon',
      facebook: process.env.FACEBOOK_URL || 'https://facebook.com/beautysalon',
      tiktok: process.env.TIKTOK_URL || 'https://tiktok.com/@beautysalon'
    }
  });
});

module.exports = router;

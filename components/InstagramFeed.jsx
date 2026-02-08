import React, { useEffect, useState } from 'react';
import { FaInstagram } from 'react-icons/fa';
import { socialAPI } from '../services/api';
import './InstagramFeed.css';

function InstagramFeed() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    socialAPI.getInstagramFeed(6)
      .then(response => {
        setFeed(response.data.feed || []);
      })
      .catch(() => {
        setFeed([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="instagram-feed">
        <div className="instagram-header">
          <FaInstagram className="instagram-icon" />
          <h3>Siga-nos no Instagram</h3>
        </div>
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (feed.length === 0) {
    return null;
  }

  return (
    <section className="instagram-feed">
      <div className="instagram-header">
        <FaInstagram className="instagram-icon" />
        <h3>Siga-nos no Instagram</h3>
      </div>

      <div className="instagram-grid">
        {feed.map((post) => (
          <a
            key={post.id}
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="instagram-post"
          >
            <img
              src={post.type === 'VIDEO' ? post.thumbnail : post.url}
              alt={post.caption?.substring(0, 50) || 'Instagram post'}
            />
            <div className="instagram-overlay">
              <FaInstagram />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export default InstagramFeed;

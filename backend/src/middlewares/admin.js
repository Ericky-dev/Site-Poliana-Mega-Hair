const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: { message: 'Authentication required' } });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: { message: 'Admin access required' } });
  }

  next();
};

module.exports = adminMiddleware;

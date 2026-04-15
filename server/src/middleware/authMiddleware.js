const { verifyToken } = require('../config/jwt');

module.exports = function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ error: 'Authentication required.' });

  try {
    req.user = verifyToken(header.split(' ')[1]);
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Token expired. Please log in again.' : 'Invalid token.';
    return res.status(401).json({ error: msg });
  }
};

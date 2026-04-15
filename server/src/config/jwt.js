const jwt = require('jsonwebtoken');

const JWT_SECRET  = process.env.JWT_SECRET  || 'ipl-default-secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '8h';

const generateToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
const verifyToken   = (token)   => jwt.verify(token, JWT_SECRET);

module.exports = { generateToken, verifyToken };

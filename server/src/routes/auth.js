const express = require('express');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../config/jwt');
const { getTeams } = require('../services/storeService');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Too many login attempts. Try again in 1 minute.' },
});

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'Username and password are required.' });

    const lowerUser = username.toLowerCase();
    
    // 1. Check Admin Account
    if (lowerUser === ADMIN_USERNAME) {
      let valid = false;
      if (process.env.ADMIN_PASSWORD_HASH) {
        valid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
      } else {
        valid = password === ADMIN_PASSWORD;
      }

      if (valid) {
        const token = generateToken({ username: lowerUser, role: 'admin' });
        return res.json({ token, expiresIn: '8h', username: lowerUser, role: 'admin' });
      }
    }

    // 2. Check Team Accounts
    const teams = getTeams();
    const team = teams[lowerUser]; // Check if username is a valid team ID (rcb, csk, etc.)
    
    if (team) {
       // Requirement: Password is [teamname]123
       const expectedPassword = `${lowerUser}123`;
       if (password === expectedPassword) {
         const token = generateToken({ 
           username: lowerUser, 
           role: 'team', 
           teamId: lowerUser,
           shortName: team.shortName 
         });
         return res.json({ 
           token, 
           expiresIn: '12h', 
           username: lowerUser, 
           role: 'team', 
           teamId: lowerUser,
           shortName: team.shortName
         });
       }
    }

    return res.status(401).json({ error: 'Invalid username or password.' });
  } catch (err) {
    console.error('[Auth]', err);
    return res.status(500).json({ error: 'Server error. Please retry.' });
  }
});

module.exports = router;

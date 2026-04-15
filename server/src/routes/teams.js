const express = require('express');
const { getTeams } = require('../services/storeService');
const router = express.Router();

router.get('/teams', (_req, res) => {
  try {
    return res.json(Object.values(getTeams()));
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;

const express = require('express');
const auth = require('../middleware/authMiddleware');
const { resetTeam, resetAllTeams } = require('../services/storeService');
const router = express.Router();

router.post('/reset', auth, (req, res) => {
  try {
    const { teamId, resetAll } = req.body;
    const io = req.app.get('io');

    if (resetAll) {
      const teams = resetAllTeams();
      io.emit('purse_reset', { teams });
      return res.json({ success: true, message: 'All teams reset', teams });
    }

    if (!teamId) return res.status(400).json({ error: 'teamId or resetAll required.' });

    const team = resetTeam(teamId);
    io.emit('purse_reset', { teams: [team] });
    return res.json({ success: true, message: `${team.name} purse reset`, teams: [team] });
  } catch (err) {
    if (err.message === 'Team not found')
      return res.status(404).json({ error: 'Team not found.' });
    return res.status(500).json({ error: 'Server error. Please retry.' });
  }
});

module.exports = router;

const express = require('express');
const auth = require('../middleware/authMiddleware');
const { deductPurse, removePlayer, getTeam, getLog } = require('../services/storeService');
const router = express.Router();

router.post('/deduct', auth, (req, res) => {
  try {
    const { teamId, amount, playerName, playerType, playerRole, basePrice } = req.body;

    if (!teamId) return res.status(400).json({ error: 'Team ID is required.' });

    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0)
      return res.status(400).json({ error: 'Amount must be a positive number.' });

    const playerInfo = {
      name:      playerName || req.body.name || '',
      type:      playerType  || 'indian',
      role:      playerRole  || 'Batsman',
      basePrice: parseFloat(basePrice) || parsed,
    };

    const result = deductPurse(teamId, parsed, playerInfo);
    req.app.get('io').emit('purse_update', result);
    return res.json(result);

  } catch (err) {
    console.error('[Deduct]', err.message);
    const team = getTeam(req.body?.teamId);

    if (err.message === 'Insufficient balance')
      return res.status(400).json({ error: 'Insufficient balance', available: team?.purse ?? 0, message: `Insufficient balance. Max: ₹${fmt(team?.purse)}` });
    if (err.message === 'Amount must be greater than 0')
      return res.status(400).json({ error: 'Amount must be greater than 0.' });
    if (err.message === 'Team not found')
      return res.status(404).json({ error: 'Team not found.' });
    if (err.message.startsWith('Squad Full:'))
      return res.status(400).json({ error: err.message });
    if (err.message.startsWith('Overseas Limit:'))
      return res.status(400).json({ error: err.message });
    if (err.message.startsWith('Duplicate Player:'))
      return res.status(400).json({ error: err.message });

    if (err.message.startsWith('⚠️'))
      return res.status(400).json({ error: err.message });

    return res.status(500).json({ error: 'Server error. Please retry.' });
  }
});

// Delete / Refund Player Endpoint
router.delete('/teams/:teamId/players/:playerName', auth, (req, res) => {
  try {
    const { teamId, playerName } = req.params;
    if (!teamId || !playerName) return res.status(400).json({ error: 'Team ID and Player Name are required.' });

    const result = removePlayer(teamId, decodeURIComponent(playerName));
    
    // Broadcast exactly identical to deduct using the isRemoval flag built in
    req.app.get('io').emit('purse_update', result);
    return res.json(result);
  } catch (err) {
    if (err.message === 'Team not found') return res.status(404).json({ error: 'Team not found.' });
    if (err.message === 'Player not found in team roster') return res.status(404).json({ error: 'Player not found in roster.' });
    return res.status(500).json({ error: 'Server error during refund.' });
  }
});

// Auction log endpoint
router.get('/log', (req, res) => {
  try { return res.json(getLog()); }
  catch (err) { return res.status(500).json({ error: 'Server error.' }); }
});

// Lot preview broadcast
router.post('/preview', auth, (req, res) => {
  req.app.get('io').emit('lot_preview', req.body);
  return res.json({ success: true });
});

function fmt(n) {
  if (!n) return '0';
  if (n >= 10000000) return `${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `${(n / 100000).toFixed(2)} L`;
  return n.toLocaleString('en-IN');
}

module.exports = router;

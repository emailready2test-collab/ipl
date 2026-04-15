const mongoose = require('mongoose');

// IPL 2025: Total purse = ₹120 Cr per team
// Squad: min 18, max 25 players | Max 8 overseas in squad, 4 in playing XI

const SnapshotSchema = new mongoose.Schema({
  docId: { type: String, required: true, unique: true }, // we only mutate the document 'live_auction'
  teams: { type: Object, default: {} },
  auctionLog: { type: Array, default: [] },
});
const SnapshotModel = mongoose.models.AuctionSnapshot || mongoose.model('AuctionSnapshot', SnapshotSchema);

let teams = {};
let auctionLog = [];  // global log of all transactions

const INITIAL_TEAMS = [
  { id: 'csk',  name: 'Chennai Super Kings',         shortName: 'CSK',  startPurse: 900000000, color: '#FFFF00', textColor: '#1A1000' },
  { id: 'mi',   name: 'Mumbai Indians',               shortName: 'MI',   startPurse: 900000000, color: '#004BA0', textColor: '#FFFFFF' },
  { id: 'rcb',  name: 'Royal Challengers Bengaluru', shortName: 'RCB',  startPurse: 900000000, color: '#EC1C24', textColor: '#FFFFFF' },
  { id: 'kkr',  name: 'Kolkata Knight Riders',       shortName: 'KKR',  startPurse: 900000000, color: '#3A225D', textColor: '#FFD700' },
  { id: 'dc',   name: 'Delhi Capitals',               shortName: 'DC',   startPurse: 900000000, color: '#0078BC', textColor: '#FFFFFF' },
  { id: 'srh',  name: 'Sunrisers Hyderabad',          shortName: 'SRH',  startPurse: 900000000, color: '#F7A721', textColor: '#1A1000' },
  { id: 'pbks', name: 'Punjab Kings',                 shortName: 'PBKS', startPurse: 900000000, color: '#ED1B24', textColor: '#FFFFFF' },
  { id: 'rr',   name: 'Rajasthan Royals',             shortName: 'RR',   startPurse: 900000000, color: '#E73895', textColor: '#FFFFFF' },
  { id: 'lsg',  name: 'Lucknow Super Giants',         shortName: 'LSG',  startPurse: 900000000, color: '#A0CAEC', textColor: '#001020' },
  { id: 'gt',   name: 'Gujarat Titans',               shortName: 'GT',   startPurse: 900000000, color: '#1C1C5E', textColor: '#FFD700' },
];

const backgroundDump = async () => {
  if (mongoose.connection.readyState !== 1) return; // Silent pass if no DB connected
  try {
    await SnapshotModel.findOneAndUpdate(
      { docId: 'live_auction' },
      { teams, auctionLog },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error('[Store Error] MongoDB background sync failed:', err.message);
  }
};

async function initializeStore() {
  if (mongoose.connection.readyState === 1) {
    try {
      const snap = await SnapshotModel.findOne({ docId: 'live_auction' });
      if (snap && snap.teams && Object.keys(snap.teams).length > 0) {
        // Sync metadata (purse limit, colors, names) from code to existing DB data
        const syncedTeams = { ...snap.teams };
        INITIAL_TEAMS.forEach(seed => {
          if (syncedTeams[seed.id]) {
            // Update static fields but KEEP current purse and player list
            syncedTeams[seed.id].startPurse = seed.startPurse;
            syncedTeams[seed.id].color = seed.color;
            syncedTeams[seed.id].textColor = seed.textColor;
            syncedTeams[seed.id].name = seed.name;
            syncedTeams[seed.id].shortName = seed.shortName;
          } else {
            syncedTeams[seed.id] = {
              ...seed,
              purse: seed.startPurse,
              players: [],
              playersCount: 0,
              overseasCount: 0,
              indianCount: 0
            };
          }
        });
        
        teams = syncedTeams;
        auctionLog = snap.auctionLog || [];
        console.log(`[Store] Successfully loaded and SYNCED backup from MongoDB (${Object.keys(teams).length} Teams)`);
        return;
      }
    } catch (e) {
      console.error('[Store Error] DB fetch failed, falling back to clean seed:', e.message);
    }
  }

  // Fallback to fresh seed data
  INITIAL_TEAMS.forEach((team) => {
    teams[team.id] = {
      ...team,
      purse: team.startPurse,
      players: [],          // list of players bought
      playersCount: 0,
      overseasCount: 0,
      indianCount: 0,
    };
  });
  auctionLog = [];
  console.log(`[Store] Seeded ${Object.keys(teams).length} IPL teams at ₹90 Cr each`);
  backgroundDump();
}

function getTeams()  { return teams; }
function getTeam(id) { return teams[id] || null; }
function getLog()    { return auctionLog.slice(0, 50); }

function deductPurse(teamId, amount, playerInfo = {}) {
  if (!teams[teamId])               throw new Error('Team not found');
  if (amount <= 0)                  throw new Error('Amount must be greater than 0');
  if (amount > teams[teamId].purse) throw new Error('Insufficient balance');
  
  // BCCI Compliance Checks
  if (teams[teamId].playersCount >= 25) {
    throw new Error('Squad Full: Maximum limit of 25 players reached for this franchise.');
  }

  if (playerInfo.type === 'overseas' && teams[teamId].overseasCount >= 8) {
    throw new Error('Overseas Limit: Maximum of 8 overseas players allowed per franchise.');
  }

  // Duplicate player check (case-insensitive) - "Furnished" logic
  const refinedPlayerName = (playerInfo.name || '').trim();
  const searchName = refinedPlayerName.toLowerCase();
  
  if (searchName) {
    for (const tid in teams) {
      if (teams[tid].players.some(p => p.name.trim().toLowerCase() === searchName)) {
        throw new Error(`⚠️ DUPLICATE DETECTED: "${refinedPlayerName.toUpperCase()}" is already assigned to ${teams[tid].name} (${teams[tid].shortName})!`);
      }
    }
  }

  const previousPurse = teams[teamId].purse;
  teams[teamId].purse -= amount;
  teams[teamId].playersCount += 1;

  const player = {
    name:      playerInfo.name      || `Player ${teams[teamId].playersCount}`,
    type:      playerInfo.type      || 'indian',   // 'indian' | 'overseas' | 'uncapped'
    role:      playerInfo.role      || 'Batsman',  // 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicket-keeper'
    basePrice: playerInfo.basePrice || amount,
    soldPrice: amount,
    soldAt:    new Date().toISOString(),
  };

  if (player.type === 'overseas') teams[teamId].overseasCount += 1;
  else teams[teamId].indianCount += 1;

  teams[teamId].players.push(player);

  // Add to auction log
  const logEntry = {
    id:         Date.now(),
    teamId,
    teamName:   teams[teamId].name,
    shortName:  teams[teamId].shortName,
    color:      teams[teamId].color,
    playerName: player.name,
    playerType: player.type,
    playerRole: player.role,
    soldPrice:  amount,
    basePrice:  player.basePrice,
    time:       new Date().toLocaleTimeString(),
  };
  auctionLog.unshift(logEntry);
  backgroundDump();

  return {
    teamId,
    teamName:     teams[teamId].name,
    shortName:    teams[teamId].shortName,
    color:        teams[teamId].color,
    playerName:   player.name,
    playerRole:   player.role,
    previousPurse,
    newPurse:     teams[teamId].purse,
    playersCount: teams[teamId].playersCount,
    overseasCount:teams[teamId].overseasCount,
    player,
    logEntry,
  };
}

function resetTeam(teamId) {
  if (!teams[teamId]) throw new Error('Team not found');
  teams[teamId].purse = teams[teamId].startPurse;
  teams[teamId].players = [];
  teams[teamId].playersCount = 0;
  teams[teamId].overseasCount = 0;
  teams[teamId].indianCount = 0;
  auctionLog = auctionLog.filter(e => e.teamId !== teamId);
  backgroundDump();
  return teams[teamId];
}

function resetAllTeams() {
  Object.keys(teams).forEach((id) => {
    teams[id].purse = teams[id].startPurse;
    teams[id].players = [];
    teams[id].playersCount = 0;
    teams[id].overseasCount = 0;
    teams[id].indianCount = 0;
  });
  auctionLog = [];
  backgroundDump();
  return Object.values(teams);
}

function removePlayer(teamId, playerName) {
  if (!teams[teamId]) throw new Error('Team not found');
  
  const playerIndex = teams[teamId].players.findIndex(p => p.name === playerName);
  if (playerIndex === -1) throw new Error('Player not found in team roster');

  const player = teams[teamId].players[playerIndex];
  
  // Refund purse
  const previousPurse = teams[teamId].purse;
  teams[teamId].purse += player.soldPrice;
  teams[teamId].playersCount -= 1;

  if (player.type === 'overseas') teams[teamId].overseasCount -= 1;
  else teams[teamId].indianCount -= 1;

  // Remove player from roster
  teams[teamId].players.splice(playerIndex, 1);

  // Add to auction log as a refund
  const logEntry = {
    id:         Date.now(),
    teamId,
    teamName:   teams[teamId].name,
    shortName:  teams[teamId].shortName,
    color:      teams[teamId].color,
    playerName: player.name,
    playerType: player.type,
    playerRole: player.role,
    soldPrice:  -player.soldPrice, // Negative denotes a refund
    basePrice:  player.basePrice,
    time:       new Date().toLocaleTimeString(),
    isRefund:   true
  };
  auctionLog.unshift(logEntry);
  backgroundDump();

  return {
    teamId,
    teamName:     teams[teamId].name,
    shortName:    teams[teamId].shortName,
    previousPurse,
    newPurse:     teams[teamId].purse,
    playersCount: teams[teamId].playersCount,
    overseasCount:teams[teamId].overseasCount,
    player,
    logEntry,
    isRemoval:    true
  };
}

let buzzerSession = {
  active: false,
  results: [] // { teamId, shortName, diff, timestamp }
};

function openBuzzer() {
  buzzerSession = { active: true, results: [] };
}

function resetBuzzer() {
  buzzerSession = { active: false, results: [] };
}

function closeBuzzer() {
  buzzerSession.active = false;
}

function recordBuzzerPress(teamId, diff) {
  if (!buzzerSession.active) return null;
  if (!teams[teamId]) return null;
  // Prevent duplicate presses
  if (buzzerSession.results.find(r => r.teamId === teamId)) return null;

  const result = {
    teamId,
    shortName: teams[teamId].shortName,
    color: teams[teamId].color,
    diff,
    timestamp: new Date().toLocaleTimeString()
  };
  
  // Sort by diff (millisecond) immediately
  buzzerSession.results.push(result);
  buzzerSession.results.sort((a, b) => a.diff - b.diff);
  
  return buzzerSession;
}

function getBuzzerState() {
  return buzzerSession;
}

module.exports = { 
  initializeStore, 
  getTeams, 
  getTeam, 
  getLog, 
  deductPurse, 
  removePlayer, 
  resetTeam, 
  resetAllTeams,
  openBuzzer,
  resetBuzzer,
  closeBuzzer,
  recordBuzzerPress,
  getBuzzerState
};

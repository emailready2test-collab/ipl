import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTeams } from '../hooks/useTeams';
import { useSocket } from '../hooks/useSocket';

export default function BuzzerPage() {
  const { teams, isLoading } = useTeams();
  const [selectedTeamId, setSelectedTeamId] = useState(() => sessionStorage.getItem('buzzer_team_id') || '');
  const [buzzerState, setBuzzerState] = useState({ active: false, results: [] });
  const [hasBuzzed, setHasBuzzed] = useState(false);
  const [connected, setConnected] = useState(false);
  
  // Timing refs for precision
  const openTimeRef = useRef(0);
  
  const socket = useSocket({
    onConnect: () => setConnected(true),
    onDisconnect: () => setConnected(false),
    onBuzzerUpdate: (state) => {
      // If transition from inactive to active, record start time
      if (!buzzerState.active && state.active) {
        openTimeRef.current = performance.now();
        setHasBuzzed(false);
      }
      // If transition to inactive, reset hasBuzzed
      if (!state.active) {
        setHasBuzzed(false);
      }
      setBuzzerState(state);
    }
  });

  useEffect(() => {
    if (selectedTeamId) sessionStorage.setItem('buzzer_team_id', selectedTeamId);
  }, [selectedTeamId]);

  const handleBuzz = () => {
    if (!buzzerState.active || hasBuzzed || !selectedTeamId) return;
    
    const now = performance.now();
    const diff = Math.round(now - openTimeRef.current);
    
    setHasBuzzed(true);
    socket.emit('buzzer_press', { teamId: selectedTeamId, diff });
  };

  const selectedTeam = teams.find(t => t.id === selectedTeamId);
  const myResult = buzzerState.results.find(r => r.teamId === selectedTeamId);
  const myRank = buzzerState.results.findIndex(r => r.teamId === selectedTeamId) + 1;

  if (isLoading) return <div className="min-h-screen bg-[#080f24] flex items-center justify-center text-white">Loading Teams...</div>;

  return (
    <div className="min-h-screen bg-[#080f24] text-white flex flex-col items-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 w-full max-w-md text-center mb-8">
        <h1 className="text-3xl font-rajdhani font-bold tracking-[0.2em] mb-2 uppercase">IPL Buzzer</h1>
        <div className="flex items-center justify-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-[10px] text-gray-500 font-inter tracking-widest uppercase">{connected ? 'Live Sync Active' : 'Offline'}</span>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md flex-1 flex flex-col items-center">
        {/* Team Selector */}
        {!buzzerState.active && !hasBuzzed && !myResult && (
          <div className="w-full mb-10">
            <label className="block text-[10px] text-gray-500 mb-2 uppercase tracking-widest font-inter">Select Your Franchise</label>
            <div className="relative">
              <select 
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-inter text-sm focus:outline-none appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#080f24]">--- Select Team ---</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id} className="bg-[#080f24]">{t.shortName} - {t.name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▾</div>
            </div>
          </div>
        )}

        {/* Selected Team Indicator */}
        {selectedTeam && (
          <div className="flex items-center gap-3 mb-10 px-6 py-2 rounded-full border border-white/5" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-[10px]" style={{ borderColor: selectedTeam.color, color: selectedTeam.color }}>{selectedTeam.shortName}</div>
            <span className="text-sm font-rajdhani font-bold tracking-widest">{selectedTeam.name}</span>
          </div>
        )}

        {/* Main Interaction Area */}
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          {!selectedTeamId ? (
             <p className="text-gray-500 text-center font-inter italic">Please select your team to begin</p>
          ) : (
            <AnimatePresence mode="wait">
              {buzzerState.active && !hasBuzzed ? (
                <motion.button
                  key="active-buzzer"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.2, opacity: 0 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBuzz}
                  className="w-64 h-64 rounded-full flex flex-col items-center justify-center shadow-[0_0_80px_rgba(239,68,68,0.4)] relative"
                  style={{ background: 'radial-gradient(circle at 30% 30%, #EF4444, #991B1B)' }}
                >
                  <div className="absolute inset-0 rounded-full animate-ping bg-red-500/20" />
                  <span className="text-4xl font-rajdhani font-black tracking-widest uppercase">BUZZ</span>
                  <p className="text-[10px] mt-2 font-inter font-bold tracking-[0.2em] opacity-60">FASTEST FINGER</p>
                </motion.button>
              ) : myResult ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="text-7xl mb-4">{myRank === 1 ? '🥇' : '✅'}</div>
                  <h3 className="text-2xl font-rajdhani font-bold uppercase mb-1">Confirmed!</h3>
                  <p className="text-red-400 text-5xl font-rajdhani font-black mb-2">+{myResult.diff}ms</p>
                  <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-inter text-gray-400">
                    Ranked #{myRank} in current round
                  </div>
                </motion.div>
              ) : hasBuzzed ? (
                <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                  <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gold font-rajdhani font-bold text-xl uppercase tracking-widest">Transmitting bid...</p>
                </motion.div>
              ) : (
                <motion.div key="ready" className="text-center">
                  <div className="w-24 h-24 rounded-full border-4 border-white/10 flex items-center justify-center mb-6 mx-auto opacity-20">
                    <span className="text-4xl text-white">🔒</span>
                  </div>
                  <h3 className="text-xl font-rajdhani font-bold uppercase text-gray-500 tracking-[0.3em]">Buzzer Locked</h3>
                  <p className="text-[11px] text-gray-600 mt-2 font-inter px-10">Wait for the auctioneer to arm the system for the current lot.</p>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Footer Branding */}
      <div className="relative z-10 text-center mt-10">
        <p className="text-[10px] text-gray-700 font-inter tracking-widest uppercase">Precision Tracking System v2.0</p>
      </div>
    </div>
  );
}

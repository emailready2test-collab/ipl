import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../hooks/useSocket';
import { useTeams } from '../hooks/useTeams';
import { useState, useMemo } from 'react';

export default function AdminBuzzerManager() {
  const { teams } = useTeams();
  const [buzzerState, setBuzzerState] = useState({ active: false, results: [] });
  const [teamStatus, setTeamStatus] = useState({});
  const [connected, setConnected] = useState(false);

  const socket = useSocket({
    onConnect: () => setConnected(true),
    onDisconnect: () => setConnected(false),
    onBuzzerUpdate: (state) => setBuzzerState(state),
    onTeamStatus: (status) => setTeamStatus(status)
  });

  const handleOpen = () => socket.emit('buzzer_control', 'open');
  const handleClose = () => socket.emit('buzzer_control', 'close');
  const handleReset = () => socket.emit('buzzer_control', 'reset');

  const winner = buzzerState.results[0];
  const buzzerActive = buzzerState.active;

  return (
    <div className="premium-glass p-0 rounded-3xl flex flex-col h-[520px] overflow-hidden border border-white/5 relative">
      {/* Background Glow */}
      <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] transition-all duration-700 pointer-events-none ${
        buzzerState.active ? 'bg-red-500/20' : winner ? 'bg-gold/10' : 'bg-white/5'
      }`} />

      {/* Header Panel */}
      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-inner transition-all duration-500 ${
            buzzerState.active ? 'bg-red-500/20 border border-red-500/30' : 'bg-white/5 border border-white/10 opacity-40'
          }`}>
            {buzzerState.active ? '📡' : '🛰️'}
          </div>
          <div>
            <h3 className="text-xs font-space font-bold tracking-[0.2em] text-white uppercase">Auction Command</h3>
            <div className="flex items-center gap-2 mt-1">
               <div className={`w-1 h-1 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
               <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{connected ? 'Relay Active' : 'Relay Offline'}</span>
            </div>
          </div>
        </div>
        
        <button onClick={handleReset} className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-[9px] font-black uppercase tracking-widest text-red-400 transition-all shadow-lg active:scale-95">
          SECURE & REFRESH
        </button>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
        
        {/* Dynamic Action Zone */}
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="wait">
            {!buzzerState.active && !winner ? (
              <motion.button key="arm" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
                onClick={handleOpen} className="w-full bg-red-600 hover:bg-red-500 text-white font-space font-bold py-6 rounded-2xl transition-all shadow-[0_10px_40px_rgba(220,38,38,0.4)] text-sm tracking-[0.4em] uppercase border-b-4 border-red-800 active:border-b-0 active:translate-y-1">
                ARM SESSION ⚡
              </motion.button>
            ) : buzzerActive ? (
              <motion.button key="lock" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
                onClick={handleClose} className="w-full bg-white/5 border-2 border-red-500/50 hover:bg-red-500/10 text-red-500 font-space font-bold py-6 rounded-2xl transition-all text-sm tracking-[0.4em] uppercase group shadow-2xl">
                <span className="group-hover:scale-110 transition-transform inline-block">STOP & LOCK 🔒</span>
              </motion.button>
            ) : (
              <motion.div key="closed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full bg-gold/10 border border-gold/20 py-6 rounded-2xl flex flex-col items-center justify-center gap-2">
                 <span className="text-gold font-space font-bold text-sm tracking-[0.4em] uppercase">RESULTS LOCKED</span>
                 <span className="text-[10px] text-gold/40 uppercase font-black tracking-[0.2em]">Ready for Verification</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Real-time Intel */}
        <div className="bg-black/20 rounded-2xl border border-white/5 p-4">
           <div className="flex items-center justify-between mb-3">
              <span className="label-premium !text-[7px]">Relay Monitor</span>
              <span className="text-[8px] font-bold text-green-500 tracking-widest uppercase">{Object.keys(teamStatus).length} Cores Online</span>
           </div>
           <div className="flex flex-wrap gap-1.5">
             {Array.isArray(teams) && teams.map(t => (
               <div key={t.id} className={`px-2 py-1 rounded-md border transition-all ${
                 teamStatus[t.id] ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-white/2 border-white/5 text-gray-700'
               }`}>
                 <span className="text-[8px] font-black uppercase tracking-widest">{t.shortName}</span>
               </div>
             ))}
           </div>
        </div>

        {/* High-Precision Leaderboard */}
        <div className="flex-1 flex flex-col min-h-0">
          <h4 className="label-premium !text-[7px] mb-3">Live Intercepts</h4>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
            <AnimatePresence>
              {buzzerState.results.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center opacity-10 py-10 border border-dashed border-white/10 rounded-2xl">
                   <p className="text-[8px] font-bold uppercase tracking-[0.4em]">Awaiting Uplink...</p>
                </motion.div>
              ) : (
                buzzerState.results.map((r, i) => {
                  const isWinner = i === 0;
                  return (
                    <motion.div key={r.teamId} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className={`relative flex items-center justify-between p-3 rounded-xl border transition-all ${
                        isWinner ? 'bg-gold/[0.08] border-gold/30 shadow-[0_0_20px_rgba(217,179,106,0.05)]' : 'bg-white/[0.03] border-white/5'
                      }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] ${
                          isWinner ? 'bg-gold text-[#05070a]' : 'bg-white/5 text-gray-500'
                        }`}>
                          {i + 1}
                        </div>
                        <div>
                          <p className={`text-xs font-space font-bold uppercase tracking-widest ${isWinner ? 'text-white' : 'text-gray-300'}`}>{r.shortName}</p>
                          <p className="text-[7px] text-gray-500 uppercase mt-0.5 tracking-widest">TS: {r.timestamp}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-mono text-sm font-bold ${isWinner ? 'text-gold' : 'text-gray-500'}`}>
                          +{r.diff}ms
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

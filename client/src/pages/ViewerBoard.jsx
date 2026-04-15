import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTeams } from '../hooks/useTeams';
import { useSocket } from '../hooks/useSocket';
import { fmt } from '../components/TeamCard';
import SoldAnimation from '../components/SoldAnimation';
import TeamModal from '../components/TeamModal';

export default function ViewerBoard() {
  const { teams, updateTeamPurse, applyReset } = useTeams();
  const [lastSale, setLastSale] = useState(null);
  const [connected, setConnected] = useState(false);
  const [viewedTeam, setViewedTeam] = useState(null);

  useSocket({
    onConnect: () => setConnected(true),
    onDisconnect: () => setConnected(false),
    onPurseUpdate: (payload) => {
      updateTeamPurse(payload.teamId, payload);
      if (payload.player) {
        setLastSale({
          teamName: payload.teamName,
          playerName: payload.playerName,
          playerRole: payload.playerRole,
          soldPrice: payload.player.soldPrice,
          teamColor: payload.color
        });
      }
    },
    onPurseReset: ({ teams: t }) => applyReset(t),
    onInitialState: (data) => applyReset(data.teams)
  });

  return (
    <div className="min-h-screen bg-primary text-white flex flex-col relative overflow-hidden font-inter">
      <SoldAnimation data={lastSale} onComplete={() => setLastSale(null)} />
      
      {/* Precision Background */}
      <div className="absolute inset-0 pointer-events-none opacity-40" 
           style={{ background: 'radial-gradient(circle at 50% 0%, #111425 0%, var(--primary) 70%)' }} />

      {/* Broadcast Nav */}
      <nav className="z-50 px-10 py-6 border-b border-white/5 bg-black/40 backdrop-blur-3xl">
        <div className="layout-container flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-2xl shadow-2xl">🏆</div>
            <div>
              <h1 className="text-2xl font-space font-bold text-white tracking-[0.2em] uppercase leading-none">Auction 2026</h1>
              <p className="label-premium mt-1.5 !text-gold/50 !tracking-[0.6em]">Digital Showcase Feed</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className={`px-5 py-2 rounded-lg border flex items-center gap-3 transition-all duration-500 ${
              connected ? 'border-green-500/20 bg-green-500/5 text-green-400' : 'border-red-500/20 bg-red-500/5 text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 live-dot' : 'bg-red-500'}`} />
              <span className="text-[10px] font-space font-bold uppercase tracking-widest">{connected ? 'Satellite: Active' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 layout-container px-10 py-10 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
          <AnimatePresence mode="popLayout">
            {(Array.isArray(teams) ? [...teams].sort((a, b) => b.purse - a.purse) : []).map((team, idx) => {
              const pct = Math.round((team.purse / team.startPurse) * 100);
              const barColor = pct > 60 ? '#10b981' : pct > 30 ? '#D9B36A' : '#ef4444';
              
              return (
                <motion.div
                  layout
                  key={team.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => setViewedTeam(team)}
                  className="premium-glass rounded-3xl p-6 flex flex-col items-center group relative border border-white/5 team-glow-card h-full cursor-pointer hover:border-gold/30 transition-all"
                >
                  {/* Subtle Team Indicator */}
                  <div className="absolute top-0 inset-x-0 h-0.5 opacity-40 group-hover:opacity-100 transition-opacity" style={{ background: team.color }} />
                  
                  {/* Team Crest - Compact */}
                  <div className="relative mb-6">
                     <div className="absolute inset-0 blur-xl opacity-20" style={{ background: team.color }} />
                     <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-space font-bold text-lg border relative overflow-hidden shadow-2xl transition-transform group-hover:scale-110" 
                          style={{ borderColor: `${team.color}40`, color: team.color, backgroundColor: `${team.color}05` }}>
                        {team.shortName}
                     </div>
                  </div>

                  <h2 className="text-sm font-space font-bold uppercase tracking-widest text-white/80 mb-6 text-center group-hover:gold-text transition-colors">
                     {team.name}
                  </h2>

                  <div className="mt-auto w-full text-center">
                     <p className="label-premium !text-[7px] mb-2 opacity-30 uppercase tracking-widest">Available Purse</p>
                     <p className="text-2xl font-space font-bold text-white mb-5 transition-transform group-hover:scale-105">
                        ₹{fmt(team.purse)}
                     </p>
                     
                     {/* Precision Bar */}
                     <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-6">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          className="h-full rounded-full" 
                          style={{ background: barColor }} 
                        />
                     </div>

                     <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white/2 rounded-xl p-3 border border-white/5 group-hover:bg-white/5 transition-colors">
                           <p className="label-premium !text-[6px] mb-1 opacity-40">Squad</p>
                           <p className="text-sm font-space font-bold text-white">{team.playersCount || 0}</p>
                        </div>
                        <div className="bg-white/2 rounded-xl p-3 border border-white/5 group-hover:bg-white/5 transition-colors">
                           <p className="label-premium !text-[6px] mb-1 opacity-40">OS</p>
                           <p className={`text-sm font-space font-bold ${team.overseasCount >= 8 ? 'text-red-400' : 'text-white'}`}>
                              {team.overseasCount || 0}
                           </p>
                        </div>
                     </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </main>

      <footer className="layout-container py-8 text-center opacity-30">
         <p className="label-premium !text-[8px] !tracking-[0.8em]">
            Obsidian Elite Production • Broadcast Standards 2026
         </p>
      </footer>

      {/* Drill-down Detail Modal */}
      <AnimatePresence>
        {viewedTeam && <TeamModal team={viewedTeam} onClose={() => setViewedTeam(null)} />}
      </AnimatePresence>
    </div>
  );
}

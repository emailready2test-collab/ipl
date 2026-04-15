import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useTeams } from '../hooks/useTeams';
import { useSocket } from '../hooks/useSocket';
import { fmt } from '../components/TeamCard';
import SoldAnimation from '../components/SoldAnimation';
import TeamModal from '../components/TeamModal';

export default function TeamDashboard() {
  const { getUser, logout } = useAuth();
  const { teams } = useTeams();
  const userData = getUser();
  const teamId = userData.teamId;
  const team = teams.find(t => t.id === teamId);
  const otherTeams = teams.filter(t => t.id !== teamId);

  const [buzzerActive, setBuzzerActive] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [buzzed, setBuzzed] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [rank, setRank] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(0);
  const [lotPreview, setLotPreview] = useState(null);
  const [connected, setConnected] = useState(false);
  const [viewedTeam, setViewedTeam] = useState(null);
  const [salesHistory, setSalesHistory] = useState([]);
  const [lastSale, setLastSale] = useState(null);

  const playClick = () => {
    try { new Audio('https://www.soundjay.com/buttons/button-16.mp3').play(); } catch(e) {}
  };

  const socket = useSocket({
    onConnect: () => setConnected(true),
    onDisconnect: () => setConnected(false),
    onBuzzerUpdate: (data) => {
      setBuzzerActive(data.active);
      const hasResults = data.results && data.results.length > 0;
      setIsLocked(!data.active && hasResults);
      
      if (!data.active && !hasResults) {
        setBuzzed(false);
        setIsWinner(false);
        setRank(0);
      }

      const myResultIndex = data.results.findIndex(r => r.teamId === teamId);
      if (myResultIndex !== -1) {
        setBuzzed(true);
        setIsWinner(myResultIndex === 0);
        setRank(myResultIndex + 1);
      }

      if (data.active) {
        setSessionStartTime(data.startTime || Date.now());
      }
    },
    onLotPreview: (data) => setLotPreview(data.active ? data : null),
    onPurseUpdate: (payload) => {
      if (payload.player) {
         setLastSale({
            teamName: payload.teamName,
            playerName: payload.playerName,
            playerRole: payload.playerRole,
            soldPrice: payload.player.soldPrice,
            teamColor: payload.color,
         });
         setSalesHistory(prev => [{
            teamName: payload.teamName,
            playerName: payload.playerName,
            playerRole: payload.playerRole,
            soldPrice: payload.player.soldPrice,
            teamColor: payload.color,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
         }, ...prev].slice(0, 20));
      }
    }
  });

  const handleBuzz = (s) => {
    if (!buzzerActive || buzzed || !team) return;
    const now = performance.now();
    const diff = Math.round(now - sessionStartTime);
    
    playClick();
    setBuzzed(true);
    s.emit('buzzer_press', { 
      teamId: team.id, 
      shortName: team.shortName,
      color: team.color,
      diff,
      timestamp: new Date().toLocaleTimeString()
    });
  };

  if (!team) {
    return (
       <div className="min-h-screen bg-primary flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
            <p className="label-premium opacity-30">Authenticating Terminal...</p>
          </div>
       </div>
    );
  }

  return (
    <div className="h-screen bg-primary text-white font-inter flex flex-col overflow-hidden relative">
      <SoldAnimation data={lastSale} onComplete={() => setLastSale(null)} />
      
      <div className="absolute inset-x-0 top-0 h-[60vh] opacity-20 pointer-events-none" 
           style={{ background: `radial-gradient(circle at 50% 0%, ${team.color} 0%, transparent 70%)` }} />

      <header className="px-8 py-4 border-b border-white/5 bg-black/60 backdrop-blur-2xl flex items-center justify-between z-50">
        <div className="flex items-center gap-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-space font-bold text-sm border shadow-2xl" 
               style={{ borderColor: `${team.color}40`, color: team.color, background: `${team.color}10` }}>
            {team.shortName}
          </div>
          <div>
            <h1 className="text-xl font-space font-bold tracking-widest uppercase">{team.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500 live-dot' : 'bg-red-500'}`} />
              <span className="label-premium !text-[8px] opacity-70">{connected ? 'Satellite Link: Active' : 'Offline'}</span>
            </div>
          </div>
        </div>
        <button onClick={logout} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-[9px] text-zinc-400 hover:text-red-400 border border-white/5 transition-all uppercase tracking-widest font-bold">
          Exit
        </button>
      </header>

      <main className="flex-1 layout-container px-8 py-6 relative z-10 overflow-hidden">
         <div className="h-full grid grid-cols-12 gap-8 grid-rows-[auto_1fr_auto]">
            
            {/* ROW 1: MISSION METRICS SUMMARY */}
            <div className="col-span-3 premium-glass p-6 rounded-3xl team-glow-card flex flex-col justify-center border border-white/10 h-32">
              <p className="label-premium mb-3 flex items-center gap-2">
                 <span className="w-1 h-1 rounded-full bg-gold" /> Capital Reserves
              </p>
              <div className="flex flex-col">
                 <span className="text-4xl font-space font-bold gold-text leading-none tracking-tighter">₹{fmt(team.purse)}</span>
                 <div className="mt-4 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full liquid-progress rounded-full"
                      style={{ background: team.color }}
                      initial={{ width: 0 }} animate={{ width: `${Math.round((team.purse / team.startPurse) * 100)}%` }}
                    />
                 </div>
              </div>
            </div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="col-span-3 premium-glass p-6 rounded-3xl team-glow-card flex flex-col justify-center border border-white/10 h-32">
              <p className="label-premium mb-3 flex items-center gap-2">
                 <span className="w-1 h-1 rounded-full bg-blue-400" /> Franchise Depth
              </p>
              <div className="flex items-baseline gap-2 mb-4">
                 <span className="text-4xl font-space font-bold text-white leading-none">{team.playersCount || 0}</span>
                 <span className="text-sm font-space font-bold text-zinc-500 uppercase">/ 25 Assets</span>
              </div>
              <div className="flex gap-2">
                 <div className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border ${team.overseasCount >= 7 ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-white/10 border-white/10 text-zinc-300'}`}>
                    OS: {team.overseasCount}/8
                 </div>
                 <div className="px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border bg-white/10 border-white/10 text-zinc-300">
                    IND: {team.indianCount || 0}
                 </div>
              </div>
            </motion.div>

            <div className="col-span-6 premium-glass p-6 rounded-3xl border border-white/10 flex items-center justify-between h-32 px-10">
               <div className="flex flex-col">
                  <h3 className="label-premium gold-text !font-black uppercase tracking-widest">Marketplace Pulse</h3>
                  <p className="text-[7px] text-zinc-500 uppercase mt-1">Global Rival Tracking Active</p>
               </div>
               <div className="flex gap-10">
                  <div className="flex flex-col items-end">
                     <span className="text-2xl font-space font-bold text-white leading-none">₹{fmt(Math.max(...otherTeams.map(t => t.purse), 0))}</span>
                     <span className="text-[7px] label-premium opacity-40 uppercase mt-2 font-bold whitespace-nowrap">Highest Rival Purse</span>
                  </div>
                  <div className="w-px h-10 bg-white/5" />
                  <div className="flex flex-col items-end">
                     <span className="text-2xl font-space font-bold text-gold leading-none">{otherTeams.reduce((acc, t) => acc + (t.playersCount || 0), 0)}</span>
                     <span className="text-[7px] label-premium opacity-40 uppercase mt-2 font-bold whitespace-nowrap">Total Rivals Secured</span>
                  </div>
               </div>
            </div>

            {/* ROW 2: TACTICAL ENGAGEMENT CORE */}
            <section className="col-span-3 row-span-1 premium-glass rounded-3xl p-6 flex flex-col border border-white/10 shadow-inner bg-black/40">
              <div className="flex items-center justify-between mb-6">
                 <div>
                    <h3 className="label-premium gold-text !font-black uppercase">Marketplace History</h3>
                    <p className="text-[7px] text-zinc-500 uppercase tracking-widest mt-1">Real-time Acquisition Feed</p>
                 </div>
                 <div className="w-2 h-2 rounded-full bg-gold/40 animate-pulse" />
              </div>
              <div className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2">
                 {salesHistory.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                       <div className="w-1.5 h-1.5 bg-gold/20 rounded-full animate-ping mb-4" />
                       <p className="label-premium !text-[6px] opacity-20 uppercase tracking-[0.4em]">Listening for Sales...</p>
                    </div>
                 ) : (
                    salesHistory.map((s, i) => (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        key={i} className="flex flex-col p-4 bg-white/[0.03] rounded-2xl border border-white/5 border-l-4 group hover:bg-white/[0.06] transition-all"
                        style={{ borderLeftColor: s.teamColor }}>
                         <div className="flex justify-between items-start mb-2">
                            <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/5" style={{ color: s.teamColor }}>{s.teamName}</span>
                            <span className="text-[10px] font-space font-bold text-gold">₹{fmt(s.soldPrice)}</span>
                         </div>
                         <h4 className="text-[12px] font-space font-bold text-white uppercase truncate">{s.playerName}</h4>
                         <div className="flex justify-between items-center mt-2">
                            <p className="text-[7px] text-zinc-400 uppercase font-bold tracking-widest">{s.playerRole}</p>
                            <span className="text-[6px] text-zinc-600 font-bold">{s.timestamp}</span>
                         </div>
                      </motion.div>
                    ))
                 )}
              </div>
            </section>

            <div className="col-span-6 row-span-1 premium-glass bg-gradient-to-b from-white/[0.07] to-transparent rounded-[3rem] p-10 relative overflow-hidden group border border-white/10 flex flex-col justify-center items-center shadow-inner min-h-[500px]">
               <div className="absolute top-0 right-0 p-8">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.7)]" />
                     <span className="label-premium !text-red-500 !font-black">Satellite Feed</span>
                  </div>
               </div>
               
               {lotPreview ? (
                 <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center z-10">
                     <p className="label-premium mb-4 text-gold/80 flex justify-center items-center gap-2">
                        <span className="w-1.5 h-px bg-gold/30" /> Currently in Room <span className="w-1.5 h-px bg-gold/30" />
                     </p>
                     <h2 className="text-7xl font-space font-bold uppercase text-white tracking-widest mb-8 glow-text-white drop-shadow-2xl">
                        {lotPreview.playerName}
                     </h2>
                     <div className="flex justify-center gap-6">
                        <div className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center min-w-[160px] backdrop-blur-md">
                           <span className="label-premium !text-[8px] mb-2 opacity-60 uppercase">Tactical Role</span>
                           <span className="text-lg font-space font-bold text-white tracking-widest uppercase">{lotPreview.playerRole}</span>
                        </div>
                        <div className="px-8 py-4 rounded-2xl bg-gold/10 border border-gold/30 flex flex-col items-center min-w-[160px] backdrop-blur-md shadow-lg shadow-gold/5">
                           <span className="label-premium !text-[8px] gold-text opacity-80 mb-2 uppercase">Base Valuation</span>
                           <span className="text-lg font-space font-bold text-gold tracking-widest uppercase">₹{fmt(lotPreview.basePrice)}</span>
                        </div>
                     </div>
                 </motion.div>
               ) : (
                 <div className="text-center flex flex-col items-center opacity-80 z-10">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-gold/20 flex items-center justify-center animate-spin-slow mb-8 bg-gold/5">
                       <span className="text-3xl grayscale opacity-60">📡</span>
                    </div>
                    <h3 className="text-xl font-space font-bold uppercase tracking-[0.8em] text-white/90 ml-[0.8em]">Searching Signal</h3>
                    <p className="label-premium mt-6 opacity-40">Awaiting central lot broadcast synchronization...</p>
                 </div>
               )}

               <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>

            <div className="col-span-3 row-span-1 flex flex-col gap-6 h-full">
               <div className="flex-1 premium-glass rounded-[4rem] flex flex-col items-center justify-center relative group overflow-hidden border border-white/10 shadow-2xl bg-black/60">
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 text-center w-full">
                     <p className="label-premium uppercase opacity-60">Bidding Interface</p>
                     <div className="w-16 h-0.5 bg-gold/30 mx-auto mt-6" />
                  </div>

                  <AnimatePresence mode="wait">
                     {!buzzerActive && !isLocked ? (
                      <motion.div key="locked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-8 py-20">
                         <div className="w-40 h-40 rounded-[4.5rem] border border-white/10 flex items-center justify-center bg-white/[0.02] opacity-40 group-hover:scale-105 transition-transform duration-500 shadow-xl">
                            <span className="text-6xl drop-shadow-lg">🔒</span>
                         </div>
                         <div className="text-center">
                            <p className="label-premium opacity-60">Auth Pending</p>
                            <p className="text-[8px] text-zinc-500 mt-3 uppercase font-black tracking-widest opacity-90">Awaiting Auctioneer Signal</p>
                         </div>
                      </motion.div>
                    ) : isLocked ? (
                      <motion.div key="closed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-10 py-20">
                         <div className="w-48 h-48 rounded-[5rem] border-2 border-gold/20 flex flex-col items-center justify-center bg-gold/[0.05] relative shadow-[0_0_80px_rgba(217,179,106,0.1)]">
                            <span className="text-6xl mb-4 drop-shadow-2xl">🏁</span>
                            <div className="absolute inset-0 rounded-[5rem] border border-gold/30 animate-pulse" />
                         </div>
                         <div className="text-center">
                            <p className="text-3xl font-space font-bold uppercase tracking-[0.2em] text-white mb-3">
                              {buzzed ? (isWinner ? '👑 Victory' : `Rank: ${rank}`) : 'Closed'}
                            </p>
                            <p className="label-premium opacity-40 uppercase">Decision Finalized</p>
                         </div>
                      </motion.div>
                    ) : (
                      <motion.div key="active" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-12">
                         <button
                           disabled={buzzed}
                           onClick={() => handleBuzz(socket)}
                           className={`w-80 h-80 rounded-[5rem] flex flex-col items-center justify-center transition-all duration-500 relative group/btn ${
                             buzzed 
                              ? isWinner 
                                ? 'bg-gold/10 border-gold border-[3px] shadow-[0_0_120px_rgba(217,179,106,0.3)]' 
                                : 'bg-white/2 border-white/5 border opacity-30 cursor-not-allowed'
                              : 'bg-red-600 hover:bg-red-500 border-red-400/20 border-[16px] shadow-[0_0_100px_rgba(239,68,68,0.4)] hover:shadow-[0_0_150px_rgba(239,68,68,0.6)] active:scale-90'
                           }`}
                         >
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 pointer-events-none" />
                            <span className="text-8xl mb-6 transition-transform duration-500 group-hover/btn:scale-110 drop-shadow-2xl">{buzzed ? (isWinner ? '👑' : '⏳') : '🔨'}</span>
                            <span className={`text-3xl font-space font-black uppercase tracking-widest ${buzzed && isWinner ? 'text-gold' : 'text-white'}`}>
                              {buzzed ? (isWinner ? 'WINNER L1' : `RANK: ${rank}`) : 'ENGAGE'}
                            </span>
                         </button>
                         <div className="text-center mt-4">
                            <p className={`label-premium !text-[11px] font-black tracking-[0.4em] uppercase transition-all duration-300 ${buzzed ? 'opacity-20' : 'text-red-500 opacity-80 animate-pulse'}`}>
                              {buzzed ? 'SIGNAL SENT' : 'SYSTEM READY'}
                            </p>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center w-full">
                     <p className="label-premium !text-[8px] uppercase tracking-[0.5em] opacity-10">Obsidian Link 2.4.0 • Nominal</p>
                  </div>
               </div>
            </div>

            {/* ROW 3: COMPREHENSIVE GLOBAL MARKETPLACE */}
            <div className="col-span-12 premium-glass border border-white/10 rounded-[2.5rem] p-8 flex flex-col h-full bg-black/60 shadow-2xl min-h-[220px]">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="label-premium !font-black text-gold flex items-center gap-3">
                    <span className="w-2 h-2 bg-gold rounded-full shadow-[0_0_10px_rgba(217,179,106,0.5)]" /> Global Marketplace Pulse
                 </h3>
                 <span className="label-premium opacity-40 font-medium">Live Rival Monitoring • RT-FEED-01</span>
              </div>
              <div className="flex-1 flex gap-4 overflow-x-auto pb-2 custom-scrollbar no-scrollbar scroll-smooth">
                 {otherTeams.sort((a,b) => b.purse - a.purse).map(t => (
                   <button
                     key={t.id}
                     onClick={() => setViewedTeam(t)}
                     className="flex-shrink-0 w-60 group relative bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-gold/30 rounded-3xl p-5 flex items-center gap-5 transition-all duration-500 transform hover:-translate-y-1"
                   >
                      <div className="absolute top-0 inset-x-0 h-0.5 opacity-10 group-hover:opacity-100 transition-opacity" style={{ background: t.color }} />
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-space font-black text-xs border flex-shrink-0 shadow-lg" 
                           style={{ borderColor: `${t.color}30`, color: t.color, background: `${t.color}10` }}>
                        {t.shortName}
                      </div>
                      <div className="text-left overflow-hidden">
                         <p className="text-[12px] font-space font-black text-white/90 truncate uppercase group-hover:text-white transition-colors">{t.name}</p>
                         <p className="text-xl font-space font-bold text-gold mt-1.5 leading-none drop-shadow-sm">₹{fmt(t.purse)}</p>
                         <p className="text-[8px] text-zinc-400 mt-2.5 font-black uppercase tracking-widest opacity-80 group-hover:opacity-100">{t.playersCount || 0} Assets Secured</p>
                      </div>
                   </button>
                 ))}
              </div>
           </div>
        </div>
      </main>

      <footer className="px-8 py-4 text-center bg-black/40 backdrop-blur-xl border-t border-white/5 flex items-center justify-between opacity-30 text-[8px] relative z-50">
        <p className="label-premium">Tactical Cockpit • System OS 2.4.0</p>
        <span className="label-premium">Secured Franchise Auth Feed • 2026 IPL AUCTION</span>
      </footer>

      <AnimatePresence>
        {viewedTeam && <TeamModal team={viewedTeam} onClose={() => setViewedTeam(null)} />}
      </AnimatePresence>
    </div>
  );
}

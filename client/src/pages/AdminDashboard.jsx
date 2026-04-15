import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useTeams } from '../hooks/useTeams';
import { useSocket } from '../hooks/useSocket';
import TeamCard, { fmt } from '../components/TeamCard';
import DeductPanel from '../components/DeductPanel';
import ResetModal from '../components/ResetModal';
import { getLog, deletePlayer } from '../services/api';
import TeamModal from '../components/TeamModal';
import UndoConfirmModal from '../components/UndoConfirmModal';
import AdminBuzzerManager from '../components/AdminBuzzerManager';
import SoldAnimation from '../components/SoldAnimation';
import AuctionHistoryModal from '../components/AuctionHistoryModal';

function StatCard({ label, value, sub, colorClass, icon }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="premium-glass p-5 rounded-2xl flex flex-col justify-between min-h-[120px] team-glow-card group">
      <div className="flex items-start justify-between">
        <div>
          <p className="label-premium !text-[8px] mb-2 opacity-40 group-hover:opacity-100 transition-opacity">{label}</p>
          <p className="text-3xl font-space font-bold text-white group-hover:gold-text transition-all">
            {value}
          </p>
        </div>
        <div className="text-xl bg-white/5 w-10 h-10 rounded-lg flex items-center justify-center border border-white/5 opacity-40 group-hover:opacity-100 transition-all">
          {icon}
        </div>
      </div>
      {sub && <p className="text-[8px] text-gray-600 font-inter uppercase tracking-widest mt-2">{sub}</p>}
    </motion.div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout, getUsername } = useAuth();
  const { teams, isLoading, error, updateTeamPurse, applyReset, refetch } = useTeams();
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [viewedTeam, setViewedTeam]     = useState(null);
  const [activity, setActivity]         = useState([]);
  const [showHistory, setShowHistory]   = useState(false);
  const [showReset, setShowReset]       = useState(false);
  const [toast, setToast]               = useState(null);
  const [connected, setConnected]       = useState(false);
  const [flashId, setFlashId]           = useState(null);
  const [pendingUndo, setPendingUndo]   = useState(null);
  const [isUndoing, setIsUndoing]       = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState('auction');
  const [lastSale, setLastSale]           = useState(null);

  const handleUndo = () => {
    if (activity.length === 0) return;
    const last = activity[0];
    if (last.isRefund || last.isRemoval) return;
    setPendingUndo(last);
  };

  const confirmUndo = async () => {
    if (!pendingUndo) return;
    setIsUndoing(true);
    try {
      const { data } = await deletePlayer(pendingUndo.teamId, pendingUndo.playerName);
      updateTeamPurse(pendingUndo.teamId, data);
      setActivity(prev => prev.filter(a => a.id !== pendingUndo.id));
      showToast('Action reverted successfully');
      setPendingUndo(null);
    } catch(err) {
      showToast('Undo failed', 'error');
    } finally {
      setIsUndoing(false);
    }
  };

  useEffect(() => {
    getLog().then(res => setActivity(res.data)).catch(console.error);
  }, []);

  const flash = (id) => { setFlashId(id); setTimeout(() => setFlashId(null), 2000); };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useSocket({
    onConnect:     () => setConnected(true),
    onDisconnect:  () => setConnected(false),
    onPurseUpdate: (payload) => {
      updateTeamPurse(payload.teamId, payload);
      flash(payload.teamId);
      if (payload.player) {
         setLastSale({
            teamName: payload.teamName,
            playerName: payload.playerName,
            playerRole: payload.playerRole,
            soldPrice: payload.player.soldPrice,
            basePrice: payload.player.basePrice || payload.player.soldPrice,
            teamColor: payload.color
         });
      }
    },
    onPurseReset:  ({ teams: t }) => { applyReset(t); t.forEach(x => flash(x.id)); },
  });

  const handleLogout = () => { logout(); navigate('/login'); };

  const stats = (Array.isArray(teams) && teams.length > 0) ? {
    totalPurse: teams.reduce((s, t) => s + (t?.purse || 0), 0),
    totalSpent: teams.reduce((s, t) => s + ((t?.startPurse || 0) - (t?.purse || 0)), 0),
    totalPlayersSold: teams.reduce((s, t) => s + (t?.playersCount || 0), 0)
  } : { totalPurse: 0, totalSpent: 0, totalPlayersSold: 0 };

  if (isLoading) {
    return (
       <div className="min-h-screen bg-primary flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
            <p className="label-premium opacity-30">Loading Auction Environment...</p>
          </div>
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary text-white font-inter flex flex-col overflow-x-hidden relative">
      {lastSale && <SoldAnimation data={lastSale} onComplete={() => setLastSale(null)} />}
      
      {/* Precision Ambient Background */}
      <div className="absolute inset-0 pointer-events-none opacity-40" 
           style={{ background: 'radial-gradient(circle at 50% 0%, #111425 0%, var(--primary) 80%)' }} />

      {/* Control Nav */}
      <nav className="sticky top-0 z-50 px-8 py-4 border-b border-white/5 bg-black/60 backdrop-blur-3xl">
        <div className="layout-container flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-xl shadow-2xl">🏏</div>
            <div>
              <h1 className="text-xl font-space font-bold text-white tracking-widest uppercase leading-none">Auction Central</h1>
              <p className="label-premium mt-1 !text-[8px] opacity-40">Administrator Session • {getUsername()}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-3 px-4 py-1.5 rounded-lg border ${
              connected ? 'border-green-500/20 bg-green-500/5 text-green-400' : 'border-red-500/20 bg-red-500/5 text-red-400'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500 live-dot' : 'bg-red-500'}`} />
              <span className="text-[10px] font-space font-bold tracking-widest">{connected ? 'LIVE FEED ACTIVE' : 'SATELLITE DOWN'}</span>
            </div>

            <div className="w-px h-6 bg-white/10 mx-1" />

            <button onClick={handleLogout} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 border border-white/5 transition-all text-[9px] font-bold uppercase tracking-widest">
              Exit
            </button>
          </div>
        </div>
      </nav>

      <main className="layout-container px-8 py-8 relative z-10 flex flex-col gap-8">
        
        {/* Compact Grid Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
           <StatCard label="Total Teams" value={teams?.length || 0} icon="🏟️" />
           <StatCard label="Total Purse" value={`₹${fmt(stats?.totalPurse || 0)}`} icon="💰" />
           <StatCard label="Live Expenditure" value={`₹${fmt(stats?.totalSpent || 0)}`} icon="📉" />
           <StatCard label="Confirmed Sales" value={stats?.totalPlayersSold || 0} icon="💼" sub="Across all franchises" />
        </div>

        <div className="flex flex-col xl:flex-row gap-8">
          {/* Franchise Grid Area */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-space font-bold tracking-widest text-white uppercase">Franchise Terminal</h2>
                <span className="label-premium !text-[8px] opacity-30 italic">Real-time status monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                {error && (
                  <button onClick={() => refetch?.()} className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all">
                    Retry Sync
                  </button>
                )}
                <button onClick={handleUndo} disabled={isUndoing || !activity?.length || activity[0]?.isRefund || activity[0]?.isRemoval}
                  className="p-3 rounded-xl border border-white/10 hover:border-yellow-500/50 text-gray-400 hover:text-yellow-500 transition-all disabled:opacity-20 translate-y-0.5" title="Revert Last Action">
                  <span className="text-xl">↩</span>
                </button>
                <button onClick={() => setShowHistory(true)}
                  className="px-4 py-3 rounded-xl bg-white/5 border border-white/5 hover:border-gold/50 text-[9px] font-black uppercase tracking-widest transition-all">
                  History
                </button>
                <button onClick={() => setShowReset(true)}
                  className="px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all">
                  Force Reset
                </button>
              </div>
            </div>

            {!teams || teams.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 premium-glass rounded-3xl border-dashed border-white/10 opacity-30">
                <span className="text-4xl mb-4">📡</span>
                <p className="font-space font-bold tracking-[0.2em] uppercase text-xs">No Franchise Data Detected</p>
                <p className="text-[10px] mt-2 text-gray-400">Environment might require a Hard Reset to initialize teams.</p>
                <button onClick={() => setShowReset(true)} className="mt-6 px-6 py-2 border border-white/20 rounded-lg hover:bg-white/5 transition-all text-[9px] font-bold uppercase tracking-widest">
                  Initialize Environment
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams.map((team, i) => (
                  <motion.div key={team?.id || i} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}>
                    <div className="relative group cursor-pointer" onClick={() => setViewedTeam(team)}>
                      <TeamCard
                        team={team}
                        isSelected={selectedTeam?.id === team?.id}
                        isFlashing={flashId === team?.id}
                        onClick={() => {}} 
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Compact Tactical Console */}
          <div className="xl:w-[400px] flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-space font-bold tracking-widest text-white uppercase">Auction Deck</h2>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                {[
                  { id: 'auction', label: 'Deduct', icon: '🔨' },
                  { id: 'buzzer', label: 'Buzzer', icon: '🛰️' }
                ].map(tab => (
                  <button key={tab.id} onClick={() => setRightPanelTab(tab.id)}
                    className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-lg transition-all ${
                      rightPanelTab === tab.id ? 'bg-gold text-[#05070a] shadow-lg' : 'text-gray-500 hover:text-white'
                    }`}>
                    <span className="text-base">{tab.icon}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="sticky top-[100px]">
              <AnimatePresence mode="wait">
                <motion.div key={rightPanelTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  {rightPanelTab === 'auction' ? (
                    teams && teams.length > 0 ? (
                      <DeductPanel 
                        selectedTeam={selectedTeam} 
                        teams={teams}
                        onTeamChange={setSelectedTeam}
                        onSuccess={(r) => {
                          showToast(`SUCCESS: ${r?.teamName} acquired ${r?.playerName}`);
                          setActivity(prev => [r?.logEntry, ...(prev || [])]);
                          setSelectedTeam(null);
                        }}
                        onError={(m) => showToast(m, 'error')}
                      />
                    ) : (
                      <div className="premium-glass p-8 text-center opacity-20">
                         <p className="text-[10px] font-bold uppercase tracking-widest">Awaiting Franchise Link...</p>
                      </div>
                    )
                  ) : (
                    <div className="premium-glass p-6 rounded-3xl border border-white/5">
                       {teams && teams.length > 0 ? (
                         <AdminBuzzerManager />
                       ) : (
                         <div className="text-center py-10 opacity-20">
                           <p className="text-[10px] font-bold uppercase tracking-widest">Buzzer Link Latency...</p>
                         </div>
                       )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* Precision Toast System */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl text-[10px] font-bold tracking-widest uppercase backdrop-blur-2xl border flex items-center gap-3 shadow-2xl"
            style={{
              background: toast.type === 'error' ? 'rgba(239,68,68,0.9)' : 'rgba(5,7,10,0.95)',
              borderColor: toast.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(217,179,106,0.2)',
              color: toast.type === 'error' ? 'white' : 'var(--gold)'
            }}>
            <span>{toast.type === 'error' ? '✖' : '✔'}</span>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReset && <ResetModal teams={teams} onClose={() => setShowReset(false)} onSuccess={msg => { showToast(msg); setActivity([]); }} onError={msg => showToast(msg, 'error')} />}
        {showHistory && <AuctionHistoryModal activity={activity} onClose={() => setShowHistory(false)} />}
        {pendingUndo && <UndoConfirmModal action={pendingUndo} isUndoing={isUndoing} onConfirm={confirmUndo} onCancel={() => setPendingUndo(null)} />}
        {viewedTeam && <TeamModal team={viewedTeam} onClose={() => setViewedTeam(null)} onSelectTeam={setSelectedTeam} />}
      </AnimatePresence>
      
      <footer className="layout-container py-8 text-center opacity-20 border-t border-white/5 mt-10">
        <p className="label-premium !text-[7px]">Core Control Layer • Obsidian Systems • Verified Root Access</p>
      </footer>
    </div>
  );
}

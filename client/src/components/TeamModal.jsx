import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fmt } from './TeamCard';
import { deletePlayer } from '../services/api';

export default function TeamModal({ team, onClose, onSelectTeam }) {
  const [deleting, setDeleting] = useState(null);
  if (!team) return null;

  const spent = team.startPurse - team.purse;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Precision Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-primary/80 backdrop-blur-xl"
      />

      {/* Obsidian Terminal Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
        className="relative w-full max-w-4xl max-h-[90vh] rounded-3xl flex flex-col overflow-hidden premium-glass border border-white/5 shadow-2xl"
      >
        {/* Elite Header */}
        <div className="flex items-center justify-between p-8 border-b border-white/5 relative overflow-hidden" 
             style={{ background: `linear-gradient(135deg, ${team.color}15, transparent)` }}>
          
          <div className="flex items-center gap-6 relative z-10">
             <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-space font-bold text-xl border shadow-2xl"
                  style={{ borderColor: `${team.color}40`, color: team.color, background: `${team.color}05` }}>
                 {team.shortName}
             </div>
             <div>
                <h2 className="text-3xl font-space font-bold text-white tracking-widest uppercase leading-none">{team.name}</h2>
                 <div className="flex gap-4 mt-3">
                   <span className="label-premium !text-[8px] text-white/60 uppercase tracking-[0.4em]">{team.playersCount || 0}/25 CONTRACTS</span>
                   <span className="w-px h-2 bg-white/10" />
                   <span className="label-premium !text-[8px] text-white/60 uppercase tracking-[0.4em]">{team.overseasCount || 0}/8 OVERSEAS</span>
                </div>
             </div>
          </div>
          
          <div className="text-right flex flex-col items-end gap-3 pr-10 relative z-10">
             <div>
                <p className="label-premium !text-[7px] gold-text text-gold/80 uppercase tracking-widest mb-1">Total Liquidity</p>
                <p className="text-4xl font-space font-bold text-white leading-none">₹{fmt(team.purse)}</p>
             </div>
             {onSelectTeam && (
               <button onClick={() => { onSelectTeam(team); onClose(); }} 
                 className="mt-2 text-[9px] font-space font-bold tracking-widest uppercase bg-gold text-primary px-4 py-2 rounded-lg hover:bg-gold-light transition-all shadow-lg active:scale-95">
                 AUTHORIZE DESK
               </button>
             )}
          </div>
          
          <button onClick={onClose} 
            title="Close Monitor"
            className="absolute top-8 right-8 w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white flex items-center justify-center transition-all border border-white/10 shadow-xl group/close z-50"
          >
            <span className="text-xl transition-transform group-hover/close:rotate-90">✕</span>
          </button>
        </div>

        {/* High-Density Roster Monitor */}
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar bg-black/20">
           <div className="flex items-center justify-between mb-6">
              <h3 className="label-premium !text-[8px] text-white/50 uppercase tracking-[0.6em]">Contract Log: Purchased Assets</h3>
              <span className="text-[10px] font-space font-bold text-white/20">{team.players?.length || 0} TOTAL</span>
           </div>
           
           {!team.players || team.players.length === 0 ? (
              <div className="text-center py-16 text-white/5 font-space border border-dashed border-white/5 rounded-2xl flex flex-col items-center gap-4">
                 <span className="text-4xl">📁</span>
                 <p className="tracking-widest uppercase text-[10px] font-bold">No active acquisitions detected</p>
              </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {team.players.map((p, i) => (
                 <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                   key={i} className="p-4 rounded-2xl flex flex-col justify-between bg-white/[0.03] border border-white/5 group hover:border-gold/20 transition-all shadow-lg"
                 >
                    <div className="flex justify-between items-start mb-3">
                       <p className="font-space font-extrabold gold-text text-base tracking-widest uppercase group-hover:text-white transition-colors duration-300 drop-shadow-sm">{p.name || '---'}</p>
                       <div className="flex items-center gap-3">
                          <p className="font-space font-black text-gold text-base tracking-tighter">₹{fmt(p.soldPrice)}</p>
                          {onSelectTeam && (
                            <button 
                              onClick={() => {
                                 setDeleting(p.name);
                                 deletePlayer(team.id, p.name).catch(() => alert('Failed to refund.')).finally(() => setDeleting(null));
                              }}
                              disabled={deleting === p.name}
                              className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/30 text-red-500/60 hover:text-red-500 transition-all flex items-center justify-center border border-red-500/20 shadow-lg"
                            >
                               {deleting === p.name ? '...' : '✕'}
                            </button>
                          )}
                       </div>
                    </div>
                    <div className="flex items-center gap-2 text-[7px] font-space font-black uppercase tracking-widest text-gray-500">
                       <span className={p.type === 'overseas' ? 'text-red-400 opacity-80' : 'text-blue-400 opacity-80'}>{p.type}</span>
                       <span className="opacity-20">•</span>
                       <span className="opacity-80">{p.role}</span>
                    </div>
                 </motion.div>
               ))}
             </div>
           )}
        </div>
        
        {/* Terminal Audit Footer */}
        <div className="px-8 py-5 bg-black/40 border-t border-white/5 flex justify-between items-center">
           <div className="flex gap-8">
              <div>
                 <p className="label-premium !text-[6px] text-white/40 mb-1 uppercase tracking-widest">Initial Credit</p>
                 <p className="text-[10px] font-space font-bold text-white/60">₹{fmt(team.startPurse)}</p>
              </div>
              <div>
                 <p className="label-premium !text-[6px] text-white/40 mb-1 uppercase tracking-widest">Asset Expenditure</p>
                 <p className="text-[10px] font-space font-bold text-red-500/60">₹{fmt(spent)}</p>
              </div>
           </div>
           <p className="label-premium !text-[6px] text-white/40 uppercase tracking-[0.4em]">Audit Hash: 0X{team.id?.slice(0,8).toUpperCase()}</p>
        </div>
      </motion.div>
    </div>
  );
}

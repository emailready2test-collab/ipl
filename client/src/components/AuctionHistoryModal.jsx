import { motion } from 'framer-motion';
import { fmt } from './TeamCard';
import { useState } from 'react';

export default function AuctionHistoryModal({ activity, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = activity.filter(a => 
    a.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.teamName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-card w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden border border-white/10"
      >
        <div className="p-8 border-b border-white/5 bg-white/2 flex items-center justify-between">
           <div>
              <h2 className="text-2xl font-rajdhani font-bold gold-text uppercase tracking-widest leading-none">Auction Activity Log</h2>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em] mt-2">Official Record of Transactions</p>
           </div>
           <div className="flex items-center gap-4">
              <input 
                type="text"
                placeholder="Search Player or Team..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-inter focus:outline-none focus:border-gold/40 transition-all w-64"
              />
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"
              >
                ✕
              </button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
           {filtered.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-gray-600">
                <span className="text-4xl mb-4">📜</span>
                <p className="text-xs uppercase tracking-widest">No transactions recorded yet</p>
             </div>
           ) : (
             <table className="w-full text-left border-separate border-spacing-y-3">
                <thead>
                   <tr className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">
                      <th className="pb-2 px-4 uppercase">Time</th>
                      <th className="pb-2 px-4">Player</th>
                      <th className="pb-2 px-4">Role</th>
                      <th className="pb-2 px-4">Franchise</th>
                      <th className="pb-2 px-4 text-right">Sold Price</th>
                      <th className="pb-2 px-4">Status</th>
                   </tr>
                </thead>
                <tbody className="font-inter">
                   {filtered.map((log) => (
                     <tr key={log.id} className="group transition-all hover:bg-white/10">
                        <td className="bg-white/2 rounded-l-2xl py-5 px-4 text-xs font-semibold text-gray-400 group-hover:text-white transition-colors">{log.time}</td>
                        <td className="bg-white/2 py-5 px-4 font-bold tracking-wide uppercase text-sm">{log.playerName}</td>
                        <td className="bg-white/2 py-5 px-4">
                           <span className="text-[10px] py-1 px-3 rounded-md bg-white/5 border border-white/5 text-gray-400 uppercase font-bold tracking-tighter">
                              {log.playerRole}
                           </span>
                        </td>
                        <td className="bg-white/2 py-5 px-4">
                           <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-rajdhani border" style={{ borderColor: log.color, color: log.color, backgroundColor: `${log.color}15` }}>
                                 {log.shortName}
                              </div>
                              <span className="text-xs font-semibold">{log.teamName}</span>
                           </div>
                        </td>
                        <td className="bg-white/2 py-5 px-4 text-right">
                           <span className={`text-lg font-rajdhani font-black ${log.isRefund ? 'text-red-400' : 'gold-text'}`}>
                              ₹{fmt(Math.abs(log.soldPrice))}
                           </span>
                        </td>
                        <td className="bg-white/2 rounded-r-2xl py-5 px-4">
                           {log.isRefund ? (
                             <div className="flex items-center gap-1 text-[9px] text-red-400 font-bold uppercase tracking-widest bg-red-400/5 px-2 py-1 rounded border border-red-400/20">
                                ↺ REFUNDED
                             </div>
                           ) : (
                             <div className="flex items-center gap-1 text-[9px] text-green-400 font-bold uppercase tracking-widest bg-green-400/5 px-2 py-1 rounded border border-green-400/20">
                                ✓ SOLD
                             </div>
                           )}
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
           )}
        </div>
        
        <div className="p-6 bg-white/2 border-t border-white/5 text-center">
           <p className="text-[9px] text-gray-600 uppercase tracking-[0.5em]">Digital Ledger Authority · Phase 2 Secure</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

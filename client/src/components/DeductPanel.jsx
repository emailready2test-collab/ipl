import { useState, useMemo } from 'react';
import { deductPurse } from '../services/api';
import { fmt } from './TeamCard';
import { motion, AnimatePresence } from 'framer-motion';

const ROLES = [
  { id: 'Batsman', icon: '🏏' },
  { id: 'Bowler', icon: '🥎' },
  { id: 'All-rounder', icon: '⚡' },
  { id: 'Wicket-keeper', icon: '🧤' }
];

export default function DeductPanel({ selectedTeam = null, teams = [], onTeamChange = () => {}, onSuccess = () => {}, onError = () => {} }) {
  // Ultra-safety: If teams is not an array, this is a corrupted boot
  if (!Array.isArray(teams)) return null;

  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('L'); 
  const [playerName, setPlayerName] = useState('');
  const [playerType, setPlayerType] = useState('indian'); 
  const [playerRole, setPlayerRole] = useState('Batsman');
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const rawAmount = useMemo(() => {
    if (!amount) return 0;
    const val = parseFloat(amount) || 0;
    return unit === 'Cr' ? val * 10000000 : val * 100000;
  }, [amount, unit]);

  const handleDeduct = async (e) => {
    e.preventDefault();
    if (!selectedTeam) return onError('Select team');
    if (!amount || isNaN(amount)) return onError('Invalid amount');
    if (!playerName.trim()) return onError('Enter name');

    setLoading(true);
    try {
      const { data } = await deductPurse(selectedTeam.id, rawAmount, {
        name: playerName.trim(),
        type: playerType,
        role: playerRole,
        basePrice: rawAmount // Default to sold price if no opening bid input
      });
      onSuccess(data);
      setAmount('');
      setPlayerName('');
    } catch (err) {
      onError(err.response?.data?.error || 'Deduction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-glass p-6 rounded-3xl border border-white/5 relative group h-full">
      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-gold/20 to-transparent opacity-50" />
      
      <div className="mb-6">
         <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <h3 className="text-xs font-space font-bold uppercase tracking-widest gold-text">Hammer Action</h3>
         </div>
         <p className="label-premium !text-[8px] opacity-40">Contract Finalization Suite</p>
      </div>
 
       <form onSubmit={handleDeduct} className="space-y-6">
         <div className="relative z-[100]">
           <label className="label-premium !text-[8px] block mb-2 opacity-30 uppercase">Franchise Allocation</label>
           <div className="relative">
             <div 
               onClick={() => setIsDropdownOpen(!isDropdownOpen)}
               className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-bold uppercase tracking-widest focus:border-gold/40 outline-none cursor-pointer transition-all hover:bg-white/10 flex items-center justify-between"
             >
               <span className={selectedTeam ? 'text-white' : 'opacity-40'}>
                 {selectedTeam ? `${selectedTeam.name} (₹${fmt(selectedTeam.purse)})` : 'SELECT TEAM...'}
               </span>
               <span className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''} text-[8px] opacity-30`}>▼</span>
             </div>
 
             <AnimatePresence>
               {isDropdownOpen && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="absolute z-[110] left-0 right-0 mt-2 bg-[#05070a] border-2 border-gold/30 rounded-2xl overflow-hidden shadow-[0_30px_90px_-10px_rgba(0,0,0,0.9)] backdrop-blur-3xl max-h-60 overflow-y-auto custom-scrollbar"
                 >
                   {teams.map(t => (
                     <div 
                       key={t.id}
                       onClick={() => {
                         onTeamChange(t);
                         setIsDropdownOpen(false);
                       }}
                       className="px-5 py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-gold/20 hover:text-gold transition-all cursor-pointer flex justify-between items-center border-b border-white/5 last:border-none"
                     >
                       <span>{t.name}</span>
                       <span className="gold-text opacity-90 font-black">₹{fmt(t.purse)}</span>
                     </div>
                   ))}
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
         </div>
 
         <div className="space-y-6">
            <div>
               <label className="label-premium !text-[8px] block mb-2 opacity-30 uppercase">Contract Identity</label>
               <input 
                 type="text" value={playerName} onChange={(e) => setPlayerName(e.target.value)}
                 placeholder="PRO PLAYER NAME"
                 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-space font-bold uppercase tracking-wider focus:border-gold/60 outline-none placeholder:opacity-10 transition-all hover:bg-white/10"
               />
            </div>
            
            <div className="relative">
               <div className="flex justify-between items-end mb-2">
                  <label className="label-premium !text-[8px] gold-text opacity-50 uppercase tracking-widest">Final Hammer Price</label>
                  <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
                     <button 
                       type="button" 
                       onClick={() => setUnit('L')} 
                       className={`px-5 py-1.5 rounded-lg text-[8px] font-black tracking-widest transition-all ${unit === 'L' ? 'bg-gold text-primary shadow-lg scale-105' : 'text-gray-500 hover:text-white'}`}
                     >
                       LAKH
                     </button>
                     <button 
                       type="button" 
                       onClick={() => setUnit('Cr')} 
                       className={`px-5 py-1.5 rounded-lg text-[8px] font-black tracking-widest transition-all ${unit === 'Cr' ? 'bg-gold text-primary shadow-lg scale-105' : 'text-gray-500 hover:text-white'}`}
                     >
                       CRORE
                     </button>
                  </div>
               </div>
               
               <div className="relative">
                  <input 
                    type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
                    placeholder="ENTER SOLD PRICE"
                    className="w-full bg-gold/5 border border-gold/10 rounded-2xl px-6 py-4 text-2xl font-space font-bold text-gold focus:border-gold/40 outline-none placeholder:opacity-5 transition-all shadow-inner"
                  />
                  {amount && (
                    <motion.div 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none pr-2"
                    >
                      <span className="text-[10px] font-space font-black gold-text opacity-60 uppercase tracking-widest">
                        = ₹{fmt(rawAmount)}
                      </span>
                    </motion.div>
                  )}
               </div>
            </div>
         </div>
 
         <div className="grid grid-cols-2 gap-4 relative z-0">
            <div>
               <label className="label-premium !text-[8px] block mb-2 opacity-30 uppercase">Tier</label>
               <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
                  <button type="button" onClick={() => setPlayerType('indian')} className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${playerType === 'indian' ? 'bg-white/10 text-white' : 'text-gray-500'}`}>IND</button>
                  <button type="button" onClick={() => setPlayerType('overseas')} className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${playerType === 'overseas' ? 'bg-gold/10 text-gold' : 'text-gray-500'}`}>OVS</button>
               </div>
            </div>
            <div>
               <label className="label-premium !text-[8px] block mb-2 opacity-30 uppercase">Role</label>
               <div className="relative">
                 <select 
                    value={playerRole} onChange={(e) => setPlayerRole(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-[8px] font-bold uppercase tracking-widest focus:border-gold/40 outline-none appearance-none cursor-pointer"
                 >
                    {ROLES.map(r => <option key={r.id} value={r.id} className="bg-primary">{r.id.toUpperCase()}</option>)}
                 </select>
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-30 text-[6px]">▼</div>
               </div>
            </div>
         </div>
 
         {selectedTeam && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2">
             <div className="p-4 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-md flex items-center justify-between shadow-2xl">
                <div>
                   <p className="label-premium !text-[6px] mb-1 opacity-30 uppercase">Remaining Purse</p>
                   <p className="text-xl font-space font-bold text-white tracking-tighter leading-none">₹{fmt(selectedTeam.purse - (rawAmount || 0))}</p>
                </div>
                <div className="text-right">
                   <p className="label-premium !text-[6px] mb-1 opacity-30 uppercase">Squad</p>
                   <p className="text-[10px] font-space font-bold text-gray-500 uppercase">{selectedTeam.playersCount}/25</p>
                </div>
             </div>
           </motion.div>
         )}

        <button 
          id="confirm-sale-btn"
          disabled={loading || !selectedTeam || !amount || !playerName}
          className="w-full relative group overflow-hidden mt-4"
        >
          <div className={`py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 border ${
             loading || !selectedTeam || !amount || !playerName
             ? 'bg-white/5 border-white/10 grayscale opacity-20 cursor-not-allowed'
             : 'bg-gold hover:bg-gold-light border-gold text-primary shadow-lg active:scale-95'
          }`}>
            {loading ? (
              <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            ) : (
              <>
                <span className="text-xl">🔨</span>
                <span className="text-[10px] font-space font-bold uppercase tracking-widest">Authorize Sale</span>
              </>
            )}
          </div>
        </button>
      </form>
    </div>
  );
}

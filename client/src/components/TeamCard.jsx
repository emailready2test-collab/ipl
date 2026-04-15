import { motion } from 'framer-motion';

export function fmt(n) {
  if (n === null || n === undefined) return '0';
  const val = Number(n);
  if (isNaN(val)) return '0';
  if (val >= 10000000) return `${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000)   return `${(val / 100000).toFixed(2)} L`;
  return val.toLocaleString('en-IN');
}

export default function TeamCard({ team, isSelected, isFlashing, onClick }) {
  if (!team) return null;

  const purse = team.purse || 0;
  const startPurse = team.startPurse || 800000000;
  
  const pct     = Math.max(0, Math.min(100, Math.round((purse / startPurse) * 100)));
  const barColor = pct > 60 ? '#10b981' : pct > 30 ? '#D9B36A' : '#ef4444';

  const isOverseasCritical = (team.overseasCount || 0) >= 7;
  const isSquadCritical = (team.playersCount || 0) >= 23;

  return (
    <motion.div
      layout
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 select-none ${isFlashing ? 'flash-update' : ''} premium-glass group`}
      style={{
        borderColor: isSelected ? 'var(--gold)' : 'rgba(255,255,255,0.08)',
        background: isSelected ? 'rgba(217,179,106,0.05)' : 'rgba(255,255,255,0.02)',
        boxShadow: isSelected ? '0 10px 30px -10px rgba(217,179,106,0.2)' : 'none',
      }}
    >
      {/* Dynamic Team Accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 group-hover:w-1.5 transition-all" style={{ background: team.color }} />
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-lg flex items-center justify-center font-space font-bold text-xs border shadow-inner transition-transform group-hover:scale-105"
               style={{
                 background: `${team.color}15`,
                 borderColor: `${team.color}30`,
                 color: team.color
               }}>
                {team.shortName}
             </div>
             <div>
                <h3 className="label-premium !text-[7px] !tracking-[0.3em] opacity-40 group-hover:opacity-100 transition-opacity">{team.name}</h3>
                <p className="text-xl font-space font-bold text-white group-hover:gold-text transition-all mt-0.5">₹{fmt(purse)}</p>
             </div>
          </div>

          {isSelected && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 rounded-full bg-gold flex items-center justify-center shadow-lg">
               <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 stroke-[#05070a] stroke-[4]" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17L4 12" />
               </svg>
            </motion.div>
          )}
        </div>

        {/* Dense Progress Bar */}
        <div className="mb-4">
           <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                className="h-full rounded-full liquid-progress" 
                style={{ background: barColor }} 
              />
           </div>
        </div>

        {/* Compact Tactical Metrics */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
           <div className="flex items-center gap-4">
              <div>
                 <p className="label-premium !text-[6px] !tracking-widest mb-0.5 opacity-30">Squad</p>
                 <div className="flex items-baseline gap-1">
                    <span className={`text-sm font-space font-bold ${isSquadCritical ? 'text-red-400' : 'text-gray-200'}`}>{team.playersCount || 0}</span>
                    <span className="text-[9px] font-medium text-gray-600">/ 25</span>
                 </div>
              </div>
              <div className="w-px h-6 bg-white/5" />
              <div>
                 <p className="label-premium !text-[6px] !tracking-widest mb-0.5 opacity-30">OS</p>
                 <div className="flex items-baseline gap-1">
                    <span className={`text-sm font-space font-bold ${isOverseasCritical ? 'text-orange-400' : 'text-gray-200'}`}>{team.overseasCount || 0}</span>
                    <span className="text-[9px] font-medium text-gray-600">/ 8</span>
                 </div>
              </div>
           </div>
           
           <div className="text-right">
              <p className="label-premium !text-[6px] mb-0.5 opacity-30">Integrity</p>
              <p className="text-[10px] font-space font-bold text-white/40">{pct}%</p>
           </div>
        </div>
      </div>
    </motion.div>
  );
}

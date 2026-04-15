import { motion } from 'framer-motion';
import { fmt } from './TeamCard';

export default function UndoConfirmModal({ action, onConfirm, onCancel, isUndoing }) {
  if (!action) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0"
        style={{ background: 'rgba(5,10,25,0.92)', backdropFilter: 'blur(12px)' }}
      />

      {/* Modal */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="relative w-full max-w-md rounded-2xl flex flex-col overflow-hidden shadow-2xl"
        style={{ 
          background: 'rgba(13,26,53,0.98)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl text-yellow-500">↩</span>
          </div>
          
          <h3 className="text-2xl font-rajdhani font-bold text-white mb-2 uppercase tracking-tight">Undo Purchase?</h3>
          <p className="text-gray-400 font-inter text-sm mb-8 px-4 leading-relaxed">
            Are you sure you want to revert the purchase of <span className="text-white font-semibold">{action.playerName}</span>? 
            <br />
            The amount <span className="text-gold font-bold">₹{fmt(action.soldPrice)}</span> will be refunded to <span className="text-white font-semibold">{action.shortName}</span>.
          </p>

          <div className="flex flex-col gap-3">
            <button 
              onClick={onConfirm} 
              disabled={isUndoing}
              className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-[#080f24] font-rajdhani font-bold py-3.5 rounded-xl transition-all uppercase tracking-widest text-sm"
              style={{ boxShadow: '0 4px 20px rgba(245,197,24,0.3)' }}
            >
              {isUndoing ? '⏳ Reverting Action...' : 'Confirm Undo'}
            </button>
            <button 
              onClick={onCancel}
              disabled={isUndoing}
              className="w-full bg-transparent hover:bg-white/5 text-gray-400 hover:text-white font-inter text-xs py-3 rounded-xl transition-all uppercase tracking-widest font-semibold"
            >
              Nevermind, Cancel
            </button>
          </div>
        </div>

        {/* Decorative caution stripe */}
        <div className="h-1.5 w-full flex">
           {Array(20).fill(0).map((_, i) => (
             <div key={i} className={`h-full flex-1 ${i % 2 === 0 ? 'bg-yellow-500/20' : 'bg-transparent'}`} />
           ))}
        </div>
      </motion.div>
    </div>
  );
}

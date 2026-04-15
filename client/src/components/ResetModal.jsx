import { useState } from 'react';
import { motion } from 'framer-motion';
import { resetPurse, resetAll } from '../services/api';
import { fmt } from './TeamCard';

export default function ResetModal({ teams, onClose, onSuccess, onError }) {
  const [mode, setMode] = useState('all'); // 'all' | 'single'
  const [selectedId, setSelectedId] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const CONFIRM_TEXT = mode === 'all' ? 'RESET ALL' : 'RESET';
  const ready = confirm === CONFIRM_TEXT && (mode === 'all' || selectedId);

  const handleReset = async () => {
    if (!ready) return;
    setIsLoading(true);
    try {
      if (mode === 'all') {
        await resetAll();
        onSuccess('✅ All team purses have been reset to ₹9 Cr');
      } else {
        const team = teams.find(t => t.id === selectedId);
        await resetPurse(selectedId);
        onSuccess(`✅ ${team?.name} purse reset to ₹${fmt(team?.startPurse)}`);
      }
      onClose();
    } catch (err) {
      onError(err.response?.data?.error || 'Reset failed. Please retry.');
    } finally { setIsLoading(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="glass rounded-2xl p-8 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-red-400" stroke="currentColor" strokeWidth="2">
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-rajdhani font-bold text-white">Reset Purse</h2>
            <p className="text-xs text-gray-400 font-inter">This action cannot be undone</p>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-5">
          {['all', 'single'].map(m => (
            <button key={m} onClick={() => { setMode(m); setConfirm(''); setSelectedId(''); }}
              className={`flex-1 py-2 rounded-xl text-sm font-rajdhani font-semibold transition-all ${
                mode === m ? 'bg-gold text-navy' : 'border border-white/10 text-gray-400 hover:border-white/20'}`}>
              {m === 'all' ? 'Reset All Teams' : 'Reset Single Team'}
            </button>
          ))}
        </div>

        {mode === 'single' && (
          <div className="mb-4">
            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-widest font-inter">Select Team</label>
            <select id="reset-team-select" value={selectedId} onChange={e => setSelectedId(e.target.value)}
              className="w-full bg-navy border border-white/10 text-white rounded-xl px-4 py-3 font-inter text-sm focus:outline-none focus:border-gold/60">
              <option value="">-- Select a team --</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.shortName} — ₹{fmt(t.purse)}</option>)}
            </select>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-xs text-gray-400 mb-2 font-inter">
            Type <span className="text-gold font-mono font-bold">{CONFIRM_TEXT}</span> to confirm
          </label>
          <input id="reset-confirm-input" type="text" value={confirm} onChange={e => setConfirm(e.target.value.toUpperCase())}
            placeholder={CONFIRM_TEXT}
            className="w-full bg-navy border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-red-500/60 transition-all" />
        </div>

        <div className="flex gap-3">
          <button id="cancel-reset-btn" onClick={onClose}
            className="flex-1 border border-white/10 text-gray-300 hover:border-white/30 py-3 rounded-xl font-rajdhani font-semibold transition-all">
            Cancel
          </button>
          <button id="confirm-reset-btn" onClick={handleReset} disabled={!ready || isLoading}
            className="flex-1 bg-red-500 hover:bg-red-400 disabled:opacity-30 disabled:cursor-not-allowed text-white py-3 rounded-xl font-rajdhani font-bold tracking-wider transition-all">
            {isLoading ? 'RESETTING...' : '🔄 CONFIRM RESET'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

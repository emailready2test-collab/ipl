import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

export default function TeamLogin() {
  const { login, isLoading, error: authError } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!formData.username || !formData.password) {
      return setLocalError('Please enter both Franchise ID and Password.');
    }

    try {
      await login(formData.username.toLowerCase(), formData.password);
      navigate('/team-dashboard');
    } catch (err) {
      // Error handled by useAuth
    }
  };

  return (
    <div className="min-h-screen bg-[#080f24] grid-bg flex items-center justify-center relative overflow-hidden">
      {/* Decorative Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="text-center mb-8">
           <motion.div 
             animate={{ rotateY: 360 }}
             transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
             className="inline-block mb-6"
           >
              <div className="w-20 h-20 rounded-2xl border border-gold/30 bg-gold/5 flex items-center justify-center shadow-[0_0_40px_rgba(212,160,23,0.1)]">
                <span className="text-5xl">⚡</span>
              </div>
           </motion.div>
           <h1 className="text-4xl font-rajdhani font-black text-white tracking-[0.2em] uppercase">Franchise Login</h1>
           <p className="text-gray-500 font-inter text-xs tracking-widest mt-2 uppercase">Official Team Auction Portal</p>
        </div>

        <div className="gold-border-card p-10 bg-[#0d1633]/90 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl">
           <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-inter font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Franchise ID</label>
                <input
                  type="text"
                  placeholder="e.g. rcb, csk"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-rajdhani text-lg focus:outline-none focus:border-gold/50 transition-all placeholder:text-gray-700"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[10px] font-inter font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Access Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-rajdhani text-lg focus:outline-none focus:border-gold/50 transition-all placeholder:text-gray-700"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>

              {(authError || localError) && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium text-center">
                  {authError || localError}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-gold w-full py-4 rounded-xl font-rajdhani font-bold text-lg tracking-widest disabled:opacity-50 transition-all active:scale-[0.98] shadow-lg"
              >
                {isLoading ? 'VERIFYING...' : 'ACCESS DASHBOARD'}
              </button>

              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                 <a href="/login" className="text-[10px] text-gray-600 font-inter hover:text-white uppercase tracking-widest transition-colors">Admin Console</a>
                 <a href="/viewer" target="_blank" className="text-[10px] text-gray-600 font-inter hover:text-white uppercase tracking-widest transition-colors">Public Board</a>
              </div>
           </form>
        </div>
      </motion.div>
    </div>
  );
}

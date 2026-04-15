import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

/* Cricket field SVG lines as decorative background */
function CricketField() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 800 500" fill="none" preserveAspectRatio="xMidYMid slice">
      <ellipse cx="400" cy="250" rx="380" ry="230" stroke="#D4A017" strokeWidth="1.5"/>
      <ellipse cx="400" cy="250" rx="280" ry="168" stroke="#D4A017" strokeWidth="1"/>
      <ellipse cx="400" cy="250" rx="40"  ry="24"  stroke="#D4A017" strokeWidth="1"/>
      <line x1="400" y1="20"  x2="400" y2="480" stroke="#D4A017" strokeWidth="0.8"/>
      <line x1="20"  y1="250" x2="780" y2="250" stroke="#D4A017" strokeWidth="0.8"/>
      <rect x="370" y="195" width="60" height="110" stroke="#D4A017" strokeWidth="1"/>
      <line x1="360" y1="390" x2="440" y2="390" stroke="#D4A017" strokeWidth="1.2"/>
    </svg>
  );
}

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (await login(username, password)) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#080f24] grid-bg flex items-center justify-center relative overflow-hidden">
      <CricketField />

      {/* Ambient glow orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-gold/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-600/5 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Header */}
        <motion.div className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>

          <motion.div
            initial={{ scale: 0.6, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 14 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-5"
            style={{ background: 'radial-gradient(circle, rgba(212,160,23,0.18) 0%, rgba(212,160,23,0.05) 70%)', border: '1.5px solid rgba(212,160,23,0.4)' }}>
            <span className="text-5xl leading-none select-none">🏏</span>
          </motion.div>

          <h1 className="text-5xl font-space font-bold tracking-[0.18em] text-white uppercase">IPL Auction</h1>
          <div className="flex items-center justify-center gap-2 mt-2 mb-4">
            <div className="h-px flex-1 max-w-[60px]" style={{ background: 'linear-gradient(to right, transparent, var(--gold))' }} />
            <p className="text-[10px] font-space font-bold tracking-[0.5em] gold-text uppercase">Management System</p>
            <div className="h-px flex-1 max-w-[60px]" style={{ background: 'linear-gradient(to left, transparent, var(--gold))' }} />
          </div>
          <span className="inline-block text-[10px] font-space font-bold text-white/30 uppercase tracking-[0.4em] border border-white/5 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-md">
            Admin Controller
          </span>
        </motion.div>

        {/* Card */}
        <div className="premium-glass p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
          
          <form onSubmit={handleSubmit} id="login-form">
            <div className="space-y-6">

              {['Username', 'Password'].map((label, i) => (
                <div key={label}>
                  <label className="block text-[9px] font-space font-bold text-white/40 mb-2.5 uppercase tracking-widest">{label}</label>
                  <input
                    id={i === 0 ? 'username-input' : 'password-input'}
                    type={i === 1 ? 'password' : 'text'}
                    autoComplete={i === 0 ? 'username' : 'current-password'}
                    value={i === 0 ? username : password}
                    onChange={e => i === 0 ? setUsername(e.target.value) : setPassword(e.target.value)}
                    placeholder={i === 0 ? 'ENTER USER ID...' : '••••••••'}
                    required
                    className="auth-input w-full rounded-xl px-5 py-4 font-space text-sm focus:outline-none"
                  />
                </div>
              ))}

              {error && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20"
                >
                  <span className="text-red-500">⚠</span>
                  <p className="text-red-500 text-[10px] font-space font-bold uppercase tracking-widest">{error}</p>
                </motion.div>
              )}

              <button id="login-btn" type="submit" disabled={isLoading}
                className="btn-gold w-full flex items-center justify-center gap-3 py-4 rounded-xl text-sm font-space font-black tracking-[0.2em] shadow-2xl active:scale-95 disabled:grayscale disabled:opacity-20"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="text-xl">⚡</span>
                    <span>Authorize Access</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-5 text-center">
            <a
               href="/viewer" target="_blank" rel="noopener noreferrer"
               className="inline-block text-[11px] uppercase tracking-[0.2em] font-rajdhani font-semibold text-gray-500 hover:text-white transition-colors border border-white/5 bg-transparent hover:bg-white/5 py-2 px-6 rounded-full"
            >
               Go to Public Viewer Board 🚀
            </a>
          </div>

          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="h-px w-12 bg-white/5" />
            <p className="text-[11px] text-gray-600 font-inter">🔒 Department of Computer Science Engineering, VCE · 2026</p>
            <div className="h-px w-12 bg-white/5" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

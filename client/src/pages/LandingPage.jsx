import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const PORTALS = [
  {
    title: 'Auctioneer Console',
    desc: 'Authorized access for auction management and player bidding.',
    path: '/login',
    icon: '🎙️',
    color: 'linear-gradient(135deg, #F5C518, #926F10)',
    role: 'Admin Access Only'
  },
  {
    title: 'Franchise Portal',
    desc: 'Secure dashboard for team managers to place bids and track squad.',
    path: '/team-login',
    icon: '🦁',
    color: 'linear-gradient(135deg, #1D4ED8, #1E3A8A)',
    role: 'Team Login Required'
  },
  {
    title: 'Spectator Board',
    desc: 'Public view for real-time auction highlights and purse tracking.',
    path: '/viewer',
    icon: '📊',
    color: 'linear-gradient(135deg, #10B981, #065F46)',
    role: 'Public Global View'
  }
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#080f24] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full grid-bg opacity-40 pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-gold/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center max-w-5xl w-full"
      >
        <div className="mb-12">
           <motion.div 
             animate={{ rotateY: 360 }}
             transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
             className="inline-block mb-6"
           >
              <div className="w-24 h-24 rounded-[2rem] border-2 border-gold/40 bg-gold/5 flex items-center justify-center shadow-[0_0_60px_rgba(212,160,23,0.15)]">
                 <span className="text-6xl">🏏</span>
              </div>
           </motion.div>
           <h1 className="text-6xl md:text-8xl font-rajdhani font-black tracking-[0.3em] uppercase gold-text mb-4 drop-shadow-2xl">
             Auction 2026
           </h1>
           <p className="text-gray-500 font-inter text-sm md:text-lg tracking-[0.5em] uppercase font-bold">
             Premier Management Portal
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {PORTALS.map((portal, idx) => (
            <motion.div
              key={portal.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15 }}
              onClick={() => navigate(portal.path)}
              className="group cursor-pointer relative"
            >
              <div className="absolute inset-0 bg-white/5 rounded-[2.5rem] blur-xl group-hover:bg-white/10 transition-all duration-500" />
              <div className="relative bg-[#0d1633]/80 backdrop-blur-2xl border border-white/5 p-10 rounded-[2.5rem] h-full flex flex-col items-center text-center transition-all duration-300 group-hover:-translate-y-3 group-hover:border-gold/30">
                 
                 <div 
                   className="w-16 h-16 rounded-2xl mb-8 flex items-center justify-center text-3xl shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12"
                   style={{ background: portal.color }}
                 >
                   {portal.icon}
                 </div>

                 <h2 className="text-2xl font-rajdhani font-black uppercase tracking-widest text-white mb-4">
                   {portal.title}
                 </h2>
                 <p className="text-gray-500 text-xs font-inter leading-relaxed mb-8">
                   {portal.desc}
                 </p>

                 <div className="mt-auto">
                    <span className="text-[10px] font-bold py-2 px-4 rounded-full bg-white/5 text-gray-400 border border-white/5 uppercase tracking-widest">
                       {portal.role}
                    </span>
                 </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-24 pt-12 border-t border-white/5">
           <p className="text-[10px] text-gray-700 uppercase tracking-[0.6em] font-medium">
             Authorized Broadcast System · Phase 2 Active
           </p>
        </div>
      </motion.div>
    </div>
  );
}

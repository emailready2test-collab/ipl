import { motion, AnimatePresence } from 'framer-motion';
import { fmt } from './TeamCard';

export default function UnsoldAnimation({ data }) {
  if (!data) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
        initial={{ opacity: 0, backdropFilter: 'grayscale(0%) blur(0px)' }}
        animate={{ opacity: 1, backdropFilter: 'grayscale(100%) blur(20px)', background: 'rgba(5,5,5,0.9)' }}
        exit={{ opacity: 0, backdropFilter: 'grayscale(0%) blur(0px)', transition: { duration: 0.8 } }}
      >
        <motion.div
          className="relative text-center w-full max-w-6xl px-10 flex flex-col items-center"
        >
          {/* Player Name */}
          <motion.h1
            initial={{ scale: 1, opacity: 0, y: -50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-7xl md:text-9xl font-rajdhani font-bold text-gray-500 uppercase tracking-tight leading-none mb-6 text-center"
            style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.8))' }}
          >
            {data.playerInfo?.name || 'PLAYER'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-gray-600 font-inter text-xl tracking-[0.3em] font-bold mb-12 uppercase"
          >
            Base Price: ₹{fmt(data.playerInfo?.basePrice || 0)}
          </motion.p>

          {/* UNSOLD STAMP */}
          <motion.div
            initial={{ scale: 5, opacity: 0, rotate: -15 }}
            animate={{ scale: 1, opacity: 1, rotate: [-15, -5, -10] }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 15 }}
            className="border-8 border-[#EF4444] px-12 py-4 rounded-3xl mb-8 flex items-center justify-center"
            style={{ color: '#EF4444', background: 'rgba(239,68,68,0.05)', boxShadow: '0 0 80px rgba(239,68,68,0.3) inset, 0 0 80px rgba(239,68,68,0.6)' }}
          >
            <span className="text-6xl md:text-8xl font-rajdhani font-black uppercase tracking-[0.2em] transform rotate-2">
              UNSOLD
            </span>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

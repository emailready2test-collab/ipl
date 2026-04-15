import { motion, AnimatePresence } from 'framer-motion';

export default function RevertedAnimation({ data }) {
  if (!data) return null;

  const { playerName, teamName, shortName, color } = data;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[120] flex flex-col items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, background: 'rgba(15, 5, 5, 0.95)', backdropFilter: 'blur(25px)' }}
        exit={{ opacity: 0, transition: { duration: 0.8 } }}
      >
        <motion.div
          animate={{ x: [0, -20, 20, -15, 15, 0] }}
          transition={{ duration: 0.4, repeat: 1 }}
          className="relative flex flex-col items-center"
        >
          {/* Main Headline */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="mb-4"
          >
             <h2 className="text-3xl md:text-5xl font-rajdhani font-bold text-red-500 uppercase tracking-[0.5em] mb-2">
               Warning
             </h2>
          </motion.div>

          {/* Large Reverted Text */}
          <motion.h1
            initial={{ scale: 3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 20 }}
            className="text-7xl md:text-[10rem] font-rajdhani font-black text-white uppercase tracking-tighter leading-none mb-4 text-center"
            style={{ textShadow: '0 0 50px rgba(239, 68, 68, 0.5)' }}
          >
            REVERTED
          </motion.h1>

          {/* Sub-details */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="h-px w-64 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
            
            <p className="text-2xl md:text-4xl font-rajdhani text-gray-300">
               Transaction for <span className="text-white font-bold">{playerName}</span> cancelled
            </p>
            
            <div className="flex items-center gap-4 px-6 py-2 rounded-full border border-white/10 bg-white/5">
               <span className="text-gray-500 text-sm uppercase tracking-widest font-inter">Affected Team:</span>
               <span className="text-xl font-bold font-rajdhani" style={{ color: color }}>{shortName}</span>
            </div>
          </motion.div>

          {/* Background Glitch Elements */}
          <motion.div 
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 0.1, repeat: Infinity }}
            className="absolute inset-x-0 h-4 bg-red-600/20 top-1/2 -translate-y-1/2 blur-2xl"
          />
        </motion.div>

        {/* Diagonal Warning Stripes (Static) */}
        <div className="absolute top-0 w-full h-8 flex overflow-hidden opacity-30">
          {Array(40).fill(0).map((_, i) => (
            <div key={i} className={`h-full w-20 skew-x-[-45deg] ${i % 2 === 0 ? 'bg-yellow-500' : 'bg-black'}`} />
          ))}
        </div>
        <div className="absolute bottom-0 w-full h-8 flex overflow-hidden opacity-30">
          {Array(40).fill(0).map((_, i) => (
            <div key={i} className={`h-full w-20 skew-x-[45deg] ${i % 2 === 0 ? 'bg-yellow-500' : 'bg-black'}`} />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

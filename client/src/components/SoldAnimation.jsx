import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { fmt } from './TeamCard';

// Realistic Auction Hammer SVG — held at handle, head swings anti-clockwise
const HammerSVG = ({ color = '#D9B36A' }) => (
  <svg viewBox="0 0 240 340" className="w-[180px] h-[260px] drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)] scale-125">
    <defs>
      {/* Polished Mahogany Wood Grain */}
      <linearGradient id="mahoganyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#5e321e' }} />
        <stop offset="35%" style={{ stopColor: '#3d1d11' }} />
        <stop offset="65%" style={{ stopColor: '#4b2516' }} />
        <stop offset="100%" style={{ stopColor: '#2b140b' }} />
      </linearGradient>

      {/* High-Reflectivity Brass */}
      <linearGradient id="brassMetallic" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#ffeb85' }} />
        <stop offset="45%" style={{ stopColor: '#d6a01d' }} />
        <stop offset="55%" style={{ stopColor: '#b8860b' }} />
        <stop offset="100%" style={{ stopColor: '#7a5a08' }} />
      </linearGradient>

      {/* Subtle Grain Noise */}
      <filter id="grainOverlay">
        <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="3" result="noise" />
        <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.15 0" />
        <feComposite in="SourceGraphic" operator="in" />
      </filter>
    </defs>

    {/* The Tapered Wooden Handle */}
    <g transform="translate(120, 110)">
       <path 
         d="M-8,0 L8,0 L12,190 Q12,205 0,205 Q-12,205 -12,190 Z" 
         fill="url(#mahoganyGrad)" 
         filter="url(#grainOverlay)"
       />
       {/* Brass Band on Handle */}
       <rect x="-10" y="45" width="20" height="6" fill="url(#brassMetallic)" />
       {/* Leather-wrapped Grip Area */}
       <path d="M-11,140 L11,140 L12,190 Q12,205 0,205 Q-12,205 -12,190 Z" fill="#1c0f0a" opacity="0.95" />
       {[0, 1, 2, 4].map(i => (
         <rect key={i} x="-11" y={145 + i * 12} width="22" height="1" fill="rgba(255,255,255,0.03)" />
       ))}
    </g>

    {/* The Gavel Head */}
    <g transform="translate(120, 110)">
       {/* Main Cylindrical Body */}
       <rect x="-65" y="-38" width="130" height="76" rx="14" fill="url(#mahoganyGrad)" filter="url(#grainOverlay)" />
       
       {/* Iconic Brass Reinforcement Bands */}
       <rect x="-58" y="-38" width="14" height="76" fill="url(#brassMetallic)" />
       <rect x="44" y="-38" width="14" height="76" fill="url(#brassMetallic)" />
       
       {/* Striking Face Details (Polished) */}
       <rect x="-68" y="-22" width="6" height="44" rx="3" fill="url(#brassMetallic)" />
       <rect x="62" y="-22" width="6" height="44" rx="3" fill="url(#brassMetallic)" />
       
       {/* Specular Highlights for Polished Wood */}
       <rect x="-40" y="-32" width="80" height="6" rx="3" fill="rgba(255,255,255,0.12)" />
       <circle cx="0" cy="-10" r="15" fill="rgba(255,255,255,0.05)" filter="blur(8px)" />
    </g>
  </svg>
);

// Sparks that burst on impact
const ImpactSpark = ({ angle, delay, color }) => {
  const rad = (angle * Math.PI) / 180;
  const distance = 120 + Math.random() * 80;
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: 6 + Math.random() * 6,
        height: 6 + Math.random() * 4,
        background: color,
        top: '50%', left: '50%',
        transformOrigin: 'center',
      }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{
        x: Math.cos(rad) * distance,
        y: Math.sin(rad) * distance,
        opacity: 0,
        scale: 0,
        rotate: 720,
      }}
      transition={{ duration: 0.9 + Math.random() * 0.4, ease: 'easeOut', delay }}
    />
  );
};

export default function SoldAnimation({ data, onComplete }) {
  const [phase, setPhase] = useState('idle'); // idle → enter → strike1 → strike2 → reveal → done
  const [sparks, setSparks] = useState([]);

  useEffect(() => {
    if (!data) { setPhase('idle'); return; }

    setPhase('enter');
    setSparks([]);

    // Timeline:
    // 0.0s  - hammer enters from upper-right, swings to starting position
    // 0.9s  - FIRST STRIKE (anti-clockwise swing down)
    // 1.3s  - hammer rebounds
    // 1.7s  - SECOND STRIKE (harder)
    // 2.2s  - THIRD FINAL STRIKE - big impact + sparks
    // 2.5s  - SOLD reveal text slams in
    // 6.5s  - fade out and complete

    const t1 = setTimeout(() => setPhase('strike1'), 900);
    const t2 = setTimeout(() => setPhase('rebound1'), 1250);
    const t3 = setTimeout(() => setPhase('strike2'), 1650);
    const t4 = setTimeout(() => setPhase('rebound2'), 2000);
    const t5 = setTimeout(() => {
      setPhase('final');
      // Generate sparks on final impact
      const teamColor = data.teamColor || '#D9B36A';
      const sparkArr = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        angle: (i / 50) * 360 + Math.random() * 10 - 5,
        delay: Math.random() * 0.1,
        color: i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? teamColor : '#FFFFFF',
      }));
      setSparks(sparkArr);
    }, 2300);
    const t6 = setTimeout(() => setPhase('reveal'), 2700);
    const t7 = setTimeout(() => {
      setPhase('idle');
      setSparks([]);
      if (onComplete) onComplete();
    }, 7000);

    return () => [t1, t2, t3, t4, t5, t6, t7].forEach(clearTimeout);
  }, [data]);

  if (!data || phase === 'idle') return null;

  const teamColor = data.teamColor || '#D9B36A';
  const isUnsold = data.isUnsold;

  // Hammer rotation: starts at +40° (upper right), swings anti-clockwise to -70° on strike
  const hammerRotation = {
    idle:     { rotate: 40,  y: -20, x: 0, opacity: 0 },
    enter:    { rotate: 40,  y: -20, x: 0, opacity: 1 },
    strike1:  { rotate: -55, y: 20,  x: -10, opacity: 1 },
    rebound1: { rotate: 25,  y: -10, x: 0, opacity: 1 },
    strike2:  { rotate: -65, y: 25,  x: -10, opacity: 1 },
    rebound2: { rotate: 20,  y: -15, x: 0, opacity: 1 },
    final:    { rotate: -80, y: 30,  x: -12, opacity: 1 },
    reveal:   { rotate: -80, y: 30,  x: -12, opacity: 1 },
  };

  const currentHammerState = hammerRotation[phase] || hammerRotation.idle;
  
  const playerName = data.playerName || 'Unknown Player';
  const soldPrice = data.soldPrice || 0;
  const teamName = data.teamName || 'Independent';
  const playerRole = data.playerRole || 'Cricketer';

  return (
    <AnimatePresence>
      {phase !== 'idle' && (
        <motion.div
          key="sold-overlay"
          className="fixed inset-0 z-[1000] flex flex-col items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, background: isUnsold ? 'rgba(10, 2, 2, 0.97)' : 'rgba(5, 7, 10, 0.97)' }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
          style={{ backdropFilter: 'blur(20px)' }}
        >
          {/* Ambient team-colored radial glow */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ opacity: phase === 'reveal' ? 0.35 : 0.1 }}
            transition={{ duration: 0.5 }}
            style={{
              background: `radial-gradient(circle at 50% 50%, ${isUnsold ? '#ef4444' : teamColor} 0%, transparent 65%)`,
            }}
          />

          {/* Screen shake on strikes */}
          <motion.div
            key={phase}
            animate={
              phase === 'strike1' || phase === 'strike2' ? { x: [-4, 4, -3, 3, 0], y: [3, -3, 2, -2, 0] } :
              phase === 'final' ? { x: [-8, 8, -6, 6, -4, 4, 0], y: [5, -5, 4, -4, 2, -2, 0] } : {}
            }
            transition={{ duration: 0.3 }}
            className="w-full h-full absolute inset-0 pointer-events-none"
          />
          {/* ─── HAMMER AREA ─── */}
          <div className="relative flex items-center justify-center -translate-y-8" style={{ height: 260, width: 260 }}>
            {/* Impact Sparks — only on final */}
            {sparks.map(s => (
              <ImpactSpark key={s.id} angle={s.angle} delay={s.delay} color={s.color} />
            ))}
 
            {/* Strike shockwave rings */}
            {(phase === 'strike1' || phase === 'strike2' || phase === 'final') && (
              <>
                <motion.div
                  key={`ring-${phase}`}
                  className="absolute rounded-full border-2 pointer-events-none"
                  style={{
                    borderColor: phase === 'final' ? teamColor : 'rgba(255,255,255,0.4)',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%,-50%)',
                    width: 40,
                    height: 40,
                  }}
                  initial={{ scale: 0.5, opacity: 0.9 }}
                  animate={{ scale: phase === 'final' ? 5 : 3, opacity: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
                {phase === 'final' && (
                  <motion.div
                    className="absolute rounded-full border pointer-events-none"
                    style={{
                      borderColor: '#FFD700',
                      top: '50%', left: '50%',
                      transform: 'translate(-50%,-50%)',
                      width: 30, height: 30,
                    }}
                    initial={{ scale: 0.5, opacity: 0.7 }}
                    animate={{ scale: 7, opacity: 0 }}
                    transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 }}
                  />
                )}
              </>
            )}
 
            {/* THE HAMMER */}
            <motion.div
              animate={currentHammerState}
              transition={{
                rotate: {
                  type: phase.startsWith('strike') || phase === 'final'
                    ? 'tween' : 'spring',
                  duration: phase.startsWith('strike') || phase === 'final' ? 0.18 : 0.5,
                  stiffness: 400, damping: 20,
                  ease: 'easeIn',
                },
                y: { duration: phase.startsWith('strike') || phase === 'final' ? 0.18 : 0.4 },
                x: { duration: 0.3 },
              }}
              style={{ transformOrigin: '60px 200px' }} // pivot at bottom of handle
              initial={{ rotate: 40, y: -200, opacity: 0 }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <HammerSVG color={isUnsold ? '#ef4444' : teamColor} />
              </motion.div>
            </motion.div>
 
            {/* Impact flash on podium */}
            {(phase === 'strike1' || phase === 'strike2' || phase === 'final') && (
              <motion.div
                key={`flash-${phase}`}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
                style={{
                  width: phase === 'final' ? 200 : 120,
                  height: phase === 'final' ? 30 : 16,
                  background: `radial-gradient(ellipse, ${isUnsold ? '#ef4444' : teamColor} 0%, transparent 70%)`,
                  opacity: 0.9,
                }}
                initial={{ opacity: 0.9, scaleX: 0.3 }}
                animate={{ opacity: 0, scaleX: 1 }}
                transition={{ duration: 0.5 }}
              />
            )}
          </div>
 
          {/* ─── SOLD TEXT REVEAL ─── */}
          <AnimatePresence>
            {phase === 'reveal' && (
              <motion.div
                key="sold-content"
                className="flex flex-col items-center text-center px-8 relative z-[50]"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                {/* Vignette behind text to pop details */}
                <div className="absolute inset-0 -inset-x-20 -inset-y-10 bg-black/40 blur-3xl rounded-full -z-10" />

                {/* SOLD / UNSOLD banner */}
                <motion.div
                  initial={{ scale: 4, opacity: 0, rotateX: 90 }}
                  animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18, duration: 0.5 }}
                  className={`mb-4 px-10 py-3 rounded-2xl border-2 shadow-2xl ${
                    isUnsold
                      ? 'border-red-500 bg-red-500/20'
                      : 'border-gold/60 bg-gold/10'
                  }`}
                >
                  <span className={`text-4xl md:text-5xl font-space font-black uppercase tracking-[0.5em] ${
                    isUnsold ? 'text-red-500' : 'gold-text'
                  }`}>
                    {isUnsold ? 'UNSOLD' : 'SOLD'}
                  </span>
                </motion.div>
 
                {/* TO TEAM NAME */}
                {!isUnsold && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, type: 'spring', stiffness: 250, damping: 20 }}
                    className="mb-4"
                  >
                    <span className="text-[12px] font-space font-black uppercase tracking-[0.6em] text-gray-500">
                      SOLD TO
                    </span>
                    <h2
                      className="text-7xl md:text-9xl font-space font-black uppercase tracking-tighter leading-none mt-2"
                      style={{ color: teamColor, textShadow: `0 0 80px ${teamColor}80` }}
                    >
                      {teamName}
                    </h2>
                  </motion.div>
                )}
  
                {/* PLAYER NAME */}
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 220, damping: 22 }}
                  className="text-5xl md:text-7xl font-space font-black text-white uppercase tracking-wider leading-none mb-3"
                  style={{ textShadow: '0 8px 40px rgba(0,0,0,0.9)' }}
                >
                  {playerName}
                </motion.h1>
  
                {/* ROLE */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  transition={{ delay: 0.4 }}
                  className="text-[13px] font-space font-black uppercase tracking-[0.5em] text-gray-400 mb-8"
                >
                  {playerRole}
                </motion.p>
  
                {/* PRICE */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 16 }}
                  className={`px-12 py-5 rounded-[40px] border-2 ${
                    isUnsold
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-gold/15 border-gold/40 shadow-[0_0_100px_rgba(217,179,106,0.3)] backdrop-blur-md'
                  }`}
                >
                  <p className="text-[10px] font-space font-black uppercase tracking-[0.5em] text-gray-500 mb-2">
                    {isUnsold ? 'Base Price' : 'Final Hammer Price'}
                  </p>
                  <span className={`text-6xl md:text-8xl font-space font-black ${isUnsold ? 'text-red-400' : 'gold-text'}`}>
                    ₹{fmt(soldPrice)}
                  </span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import React, { useMemo } from 'react';
import { Theme } from '../types';

interface HypnoticCanvasProps {
  command: string | null;
  loading: boolean;
  theme: Theme;
  isClimax: boolean;
}

const HypnoticCanvas: React.FC<HypnoticCanvasProps> = ({ command, loading, theme, isClimax }) => {
  // Generate a set of circles with staggered animation delays
  const circles = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      delay: `${i * 0.33}s`, // Staggered delay for continuous flow
      color: i % 2 === 0 ? theme.circleColorOdd : theme.circleColorEven,
    }));
  }, [theme]);

  // Generate particles for splash effect if climax
  const splashParticles = useMemo(() => {
    if (!isClimax) return [];
    return Array.from({ length: 20 }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / 20;
      const velocity = 100 + Math.random() * 100;
      const tx = Math.cos(angle) * 300 + 'px';
      const ty = Math.sin(angle) * 300 + 'px';
      return { id: i, tx, ty, delay: Math.random() * 0.5 };
    });
  }, [isClimax]);

  return (
    <div className={`relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br ${theme.backgroundGradient}`}>
      
      {/* Background radial gradient pulse */}
      <div className={`absolute inset-0 opacity-30 animate-pulse bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${theme.glowColor} to-transparent pointer-events-none`} />

      {/* Shrinking Circles */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {circles.map((circle) => (
          <div
            key={circle.id}
            className={`absolute rounded-full border-[6px] md:border-[12px] opacity-0 ${circle.color} shadow-[0_0_15px_rgba(255,255,255,0.2)] animate-shrink`}
            style={{
              width: '100vmax', // Ensure it covers screen
              height: '100vmax',
              animationDelay: circle.delay,
            }}
          />
        ))}
      </div>

      {/* Splash/Fluid Animation (Climax Only) */}
      {isClimax && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          {splashParticles.map((p) => (
             <div
               key={p.id}
               className="absolute w-4 h-4 bg-white rounded-full opacity-80 animate-splash blur-sm"
               style={{
                 '--tx': p.tx,
                 '--ty': p.ty,
                 animationDelay: `${p.delay}s`
               } as React.CSSProperties}
             />
          ))}
          {/* Secondary fluid drops */}
           {splashParticles.map((p) => (
             <div
               key={`s-${p.id}`}
               className={`absolute w-2 h-2 ${theme.accentColor} rounded-full opacity-60 animate-splash blur-md`}
               style={{
                 '--tx': p.tx,
                 '--ty': p.ty,
                 animationDelay: `${p.delay + 0.2}s`
               } as React.CSSProperties}
             />
          ))}
        </div>
      )}

      {/* Center Heart */}
      <div className={`z-20 relative transition-transform duration-1000 ${isClimax ? 'scale-150' : 'scale-100'}`}>
        <div className={`${isClimax ? 'animate-heartbeat-fast drop-shadow-[0_0_50px_rgba(255,0,0,1)]' : 'animate-heartbeat drop-shadow-[0_0_25px_rgba(255,0,0,0.8)]'}`}>
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-24 h-24 md:w-32 md:h-32 text-red-600"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          {/* Glow effect in center of heart */}
          <div className={`absolute inset-0 bg-red-500 rounded-full animate-pulse ${isClimax ? 'blur-2xl opacity-60' : 'blur-xl opacity-40'}`}></div>
        </div>
      </div>

      {/* Command Text Overlay */}
      <div className="absolute top-1/4 left-0 right-0 px-8 text-center z-30 pointer-events-none">
        {loading ? (
            <div className={`text-lg tracking-widest animate-pulse font-mono ${theme.textColor} opacity-80`}>
              CONNECTING TO SUBCONSCIOUS...
            </div>
        ) : (
          command && (
            <div className={`animate-fade-in backdrop-blur-sm bg-black/30 p-4 rounded-xl border ${theme.circleColorOdd}/30`}>
              <h2 className={`${isClimax ? 'text-5xl md:text-7xl text-red-500' : 'text-4xl md:text-5xl text-white'} font-bold drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] font-['Dancing_Script'] transition-all duration-500`}>
                {command}
              </h2>
            </div>
          )
        )}
      </div>

       {/* Decorative Particles (Subtle floaters) - Disable in Climax to reduce noise */}
       {!isClimax && (
         <div className="absolute inset-0 pointer-events-none opacity-40">
             <div className={`absolute top-10 left-10 w-2 h-2 rounded-full animate-bounce duration-[3000ms] ${theme.accentColor}`}></div>
             <div className={`absolute bottom-20 right-10 w-3 h-3 rounded-full animate-bounce duration-[4000ms] ${theme.accentColor}`}></div>
         </div>
       )}
    </div>
  );
};

export default HypnoticCanvas;
import React, { useMemo } from 'react';

interface HypnoticCanvasProps {
  command: string | null;
  loading: boolean;
}

const HypnoticCanvas: React.FC<HypnoticCanvasProps> = ({ command, loading }) => {
  // Generate a set of circles with staggered animation delays
  const circles = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      delay: `${i * 0.33}s`, // Staggered delay for continuous flow
      color: i % 2 === 0 ? 'border-pink-300' : 'border-pink-500',
    }));
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-pink-900 via-purple-900 to-black">
      
      {/* Background radial gradient pulse */}
      <div className="absolute inset-0 opacity-30 animate-pulse bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-pink-500 to-transparent pointer-events-none" />

      {/* Shrinking Circles */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {circles.map((circle) => (
          <div
            key={circle.id}
            className={`absolute rounded-full border-[6px] md:border-[12px] opacity-0 ${circle.color} shadow-[0_0_15px_rgba(236,72,153,0.6)] animate-shrink`}
            style={{
              width: '100vmax', // Ensure it covers screen
              height: '100vmax',
              animationDelay: circle.delay,
            }}
          />
        ))}
      </div>

      {/* Center Heart */}
      <div className="z-20 relative animate-heartbeat drop-shadow-[0_0_25px_rgba(255,0,0,0.8)]">
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-24 h-24 md:w-32 md:h-32 text-red-600"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        {/* Glow effect in center of heart */}
        <div className="absolute inset-0 bg-red-500 blur-xl opacity-40 rounded-full animate-pulse"></div>
      </div>

      {/* Command Text Overlay */}
      <div className="absolute top-1/4 left-0 right-0 px-8 text-center z-30 pointer-events-none">
        {loading ? (
            <div className="text-pink-200 text-lg tracking-widest animate-pulse font-mono">
              CONNECTING TO SUBCONSCIOUS...
            </div>
        ) : (
          command && (
            <div className="animate-fade-in backdrop-blur-sm bg-black/30 p-4 rounded-xl border border-pink-500/30">
              <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,105,180,0.8)] font-['Dancing_Script']">
                {command}
              </h2>
            </div>
          )
        )}
      </div>

       {/* Decorative Particles (Subtle floaters) */}
       <div className="absolute inset-0 pointer-events-none opacity-40">
           <div className="absolute top-10 left-10 w-2 h-2 bg-pink-400 rounded-full animate-bounce duration-[3000ms]"></div>
           <div className="absolute bottom-20 right-10 w-3 h-3 bg-purple-400 rounded-full animate-bounce duration-[4000ms]"></div>
       </div>
    </div>
  );
};

export default HypnoticCanvas;

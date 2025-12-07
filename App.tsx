import React, { useState, useEffect, useCallback } from 'react';
import HypnoticCanvas from './components/HypnoticCanvas';
import { audioService } from './services/audioService';
import { generateHypnoticCommand } from './services/geminiService';
import { AppState } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [currentCommand, setCurrentCommand] = useState<string | null>(null);
  const [loadingCommand, setLoadingCommand] = useState<boolean>(false);

  // Initialize command generation when entering hypnosis mode
  const startHypnosis = useCallback(async () => {
    // Requires user interaction first to play audio
    audioService.start();
    setAppState(AppState.HYPNOTIZING);
    
    // Initial playful delay before first command
    setLoadingCommand(true);
    const cmd = await generateHypnoticCommand();
    
    // Artificial delay to let the user "sync" with the rhythm
    setTimeout(() => {
        setCurrentCommand(cmd);
        setLoadingCommand(false);
    }, 3000);

  }, []);

  const stopHypnosis = useCallback(() => {
    audioService.stop();
    setAppState(AppState.IDLE);
    setCurrentCommand(null);
  }, []);

  const refreshCommand = useCallback(async () => {
    if (loadingCommand) return;
    setLoadingCommand(true);
    const cmd = await generateHypnoticCommand();
    setCurrentCommand(cmd);
    setLoadingCommand(false);
  }, [loadingCommand]);

  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      audioService.stop();
    };
  }, []);

  return (
    <div className="w-full h-screen font-['Montserrat'] text-white">
      {appState === AppState.IDLE ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-pink-900 to-black p-6 text-center space-y-12">
          
          <div className="space-y-4 animate-fade-in">
            <div className="relative inline-block">
                <div className="absolute inset-0 bg-pink-500 blur-2xl opacity-20 rounded-full"></div>
                <i className="fa-solid fa-heart-pulse text-6xl text-pink-500 animate-bounce"></i>
            </div>
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400 font-['Dancing_Script']">
              Love Hypnosis
            </h1>
            <p className="text-gray-300 max-w-xs mx-auto text-sm leading-relaxed">
              Play a trick on your friends. Show them the screen, let the binaural beats sync, and watch them obey the AI's commands.
            </p>
          </div>

          <button
            onClick={startHypnosis}
            className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-full transition-all duration-300 hover:scale-105"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-pink-600 to-purple-600 opacity-80 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute inset-0 blur-md bg-pink-500 opacity-50 group-hover:opacity-80"></div>
            <span className="relative z-10 font-bold tracking-widest text-lg uppercase flex items-center gap-3">
              <i className="fa-solid fa-play"></i> Start Hypnosis
            </span>
          </button>

          <footer className="absolute bottom-6 text-xs text-gray-600">
            For entertainment purposes only.
          </footer>
        </div>
      ) : (
        <div className="relative w-full h-full cursor-pointer" onClick={refreshCommand}>
          <HypnoticCanvas command={currentCommand} loading={loadingCommand} />
          
          {/* Controls Overlay */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6 z-40 px-4">
            
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering refreshCommand on background click
                stopHypnosis();
              }}
              className="p-4 rounded-full bg-black/40 border border-white/20 backdrop-blur-md text-white hover:bg-red-500/50 transition-colors"
              aria-label="Stop"
            >
              <i className="fa-solid fa-stop text-xl"></i>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                refreshCommand();
              }}
              disabled={loadingCommand}
              className={`px-6 py-3 rounded-full bg-pink-600/60 border border-pink-400/30 backdrop-blur-md text-white font-semibold transition-all hover:bg-pink-500/80 flex items-center gap-2 ${loadingCommand ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <i className={`fa-solid fa-wand-magic-sparkles ${loadingCommand ? 'animate-spin' : ''}`}></i>
              {loadingCommand ? 'Generating...' : 'New Command'}
            </button>

          </div>
          
          {/* Instruction hint */}
          <div className="absolute top-4 right-4 z-40 text-xs text-pink-300/50 pointer-events-none">
            Tap screen for new command
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

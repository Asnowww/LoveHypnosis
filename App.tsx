import React, { useState, useEffect, useCallback, useMemo } from 'react';
import HypnoticCanvas from './components/HypnoticCanvas';
import { audioService } from './services/audioService';
import { generateHypnoticCommand, STATIC_CORPUS, CLIMAX_MESSAGES } from './services/geminiService';
import { AppState, Language, Theme } from './types';

const THEMES: Record<string, Theme> = {
  default: {
    id: 'pink',
    backgroundGradient: 'from-pink-900 via-purple-900 to-black',
    circleColorOdd: 'border-pink-300',
    circleColorEven: 'border-pink-500',
    accentColor: 'bg-pink-500',
    buttonGradient: 'from-pink-600 to-purple-600',
    glowColor: 'from-pink-500',
    textColor: 'text-pink-200'
  },
  green: {
    id: 'green',
    backgroundGradient: 'from-emerald-900 via-green-900 to-black',
    circleColorOdd: 'border-emerald-300',
    circleColorEven: 'border-emerald-500',
    accentColor: 'bg-emerald-500',
    buttonGradient: 'from-emerald-600 to-green-600',
    glowColor: 'from-emerald-500',
    textColor: 'text-emerald-200'
  },
  red: {
    id: 'red',
    backgroundGradient: 'from-red-900 via-rose-900 to-black',
    circleColorOdd: 'border-red-300',
    circleColorEven: 'border-red-600',
    accentColor: 'bg-red-500',
    buttonGradient: 'from-red-600 to-rose-600',
    glowColor: 'from-red-500',
    textColor: 'text-red-200'
  }
};

const LANGUAGES: { code: Language; label: string; themeKey: string }[] = [
  { code: 'en', label: 'English', themeKey: 'default' },
  { code: 'zh', label: '中文', themeKey: 'default' },
  { code: 'ja', label: '日本語', themeKey: 'default' },
  { code: 'de', label: 'Deutsch', themeKey: 'default' },
  { code: 'es', label: 'Español', themeKey: 'default' },
  { code: 'ar', label: 'العربية', themeKey: 'green' },
  { code: 'ko', label: '한국어', themeKey: 'red' },
];

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [currentCommand, setCurrentCommand] = useState<string | null>(null);
  const [loadingCommand, setLoadingCommand] = useState<boolean>(false);
  const [language, setLanguage] = useState<Language>('zh');
  const [progress, setProgress] = useState<number>(0);
  const [usedCommands, setUsedCommands] = useState<Set<string>>(new Set());

  // Derive theme from selected language
  const currentTheme = useMemo(() => {
    const langConfig = LANGUAGES.find(l => l.code === language);
    const key = langConfig?.themeKey || 'default';
    return THEMES[key];
  }, [language]);

  const isClimax = progress >= 100;

  // Helper to get a unique command from corpus
  const getUniqueCorpusCommand = useCallback((lang: Language) => {
    const list = STATIC_CORPUS[lang] || STATIC_CORPUS['en'];
    const available = list.filter(cmd => !usedCommands.has(cmd));
    
    // If we exhausted the list, reset or just pick random
    if (available.length === 0) {
      return list[Math.floor(Math.random() * list.length)];
    }
    
    const cmd = available[Math.floor(Math.random() * available.length)];
    return cmd;
  }, [usedCommands]);

  // Initialize command generation when entering hypnosis mode
  const startHypnosis = useCallback(async () => {
    // Reset state
    audioService.start();
    setAppState(AppState.HYPNOTIZING);
    setProgress(5);
    setUsedCommands(new Set());
    
    setLoadingCommand(true);
    
    // Initial command from corpus to ensure speed and start fresh
    const cmd = getUniqueCorpusCommand(language);
    setUsedCommands(prev => new Set(prev).add(cmd));

    setTimeout(() => {
        setCurrentCommand(cmd);
        setLoadingCommand(false);
    }, 2000);

  }, [language, getUniqueCorpusCommand]);

  const stopHypnosis = useCallback(() => {
    audioService.stop();
    setAppState(AppState.IDLE);
    setCurrentCommand(null);
    setProgress(0);
    setUsedCommands(new Set());
  }, []);

  const refreshCommand = useCallback(async () => {
    if (loadingCommand) return;
    
    // If we are already at climax, maybe we just stay there or restart?
    // Let's allow restarting loop or just keeping it intense.
    // User requirement: "When progress reaches 100%, text becomes surrender..."
    // So if it's already 100, we probably shouldn't be here or we do nothing.
    if (isClimax) return;

    const newProgress = Math.min(progress + 15, 100);
    setProgress(newProgress);

    if (newProgress >= 100) {
      // Trigger Climax
      setCurrentCommand(CLIMAX_MESSAGES[language]);
      return;
    }

    setLoadingCommand(true);

    // Try to get unique command
    // We prioritize corpus for uniqueness tracking during progression
    // But we can mix in AI if we want. To strictly follow "no repeat during progress",
    // using the static corpus filtering is safest and fastest.
    
    let cmd = "";
    // Use AI with 40% chance if not near climax, but we need to check uniqueness.
    // Checking uniqueness against AI output is hard (fuzzy match), so for the specific "no repeat" rule,
    // let's stick to the corpus until it's empty, or use AI if corpus is used up.
    
    const corpusList = STATIC_CORPUS[language] || STATIC_CORPUS['en'];
    const availableInCorpus = corpusList.filter(c => !usedCommands.has(c));

    if (availableInCorpus.length > 0) {
      cmd = availableInCorpus[Math.floor(Math.random() * availableInCorpus.length)];
    } else {
      // Fallback to AI if we ran out of unique static commands
      cmd = await generateHypnoticCommand(language);
    }
    
    setUsedCommands(prev => new Set(prev).add(cmd));
    setCurrentCommand(cmd);
    setLoadingCommand(false);
  }, [loadingCommand, language, progress, isClimax, usedCommands]);

  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      audioService.stop();
    };
  }, []);

  return (
    <div className="w-full h-screen font-['Montserrat'] text-white selection:bg-pink-500 selection:text-white">
      {appState === AppState.IDLE ? (
        <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-b ${currentTheme.backgroundGradient} p-6 text-center space-y-10 transition-colors duration-1000`}>
          
          <div className="space-y-4 animate-fade-in">
            <div className="relative inline-block">
                <div className={`absolute inset-0 ${currentTheme.accentColor} blur-2xl opacity-20 rounded-full`}></div>
                <i className={`fa-solid fa-heart-pulse text-6xl ${currentTheme.textColor.replace('200', '500')} animate-bounce`}></i>
            </div>
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 font-['Dancing_Script']">
              Love Hypnosis
            </h1>
            <p className="text-gray-300 max-w-xs mx-auto text-sm leading-relaxed">
               Unlock your deepest desires. Let the rhythm take over and surrender to the pleasure of obedience.
            </p>
          </div>

          {/* Language Selector */}
          <div className="grid grid-cols-3 gap-3 md:flex md:flex-wrap md:justify-center animate-fade-in w-full max-w-sm">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 border ${
                  language === lang.code 
                    ? `bg-white/20 border-white text-white scale-105 shadow-[0_0_10px_rgba(255,255,255,0.3)]` 
                    : `bg-transparent border-white/10 text-gray-400 hover:border-white/40 hover:text-white`
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          <button
            onClick={startHypnosis}
            className="group relative px-10 py-5 bg-transparent overflow-hidden rounded-full transition-all duration-300 hover:scale-105 shadow-2xl"
          >
            <div className={`absolute inset-0 w-full h-full bg-gradient-to-r ${currentTheme.buttonGradient} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
            <div className={`absolute inset-0 blur-md ${currentTheme.accentColor} opacity-50 group-hover:opacity-80`}></div>
            <span className="relative z-10 font-bold tracking-widest text-lg uppercase flex items-center gap-3">
              <i className="fa-solid fa-play"></i> Start Trance
            </span>
          </button>

          <footer className="absolute bottom-6 text-xs text-gray-500 opacity-60">
            18+ Only. For consensual adult play and entertainment.
          </footer>
        </div>
      ) : (
        <div className="relative w-full h-full cursor-pointer overflow-hidden" onClick={refreshCommand}>
          <HypnoticCanvas 
            command={currentCommand} 
            loading={loadingCommand} 
            theme={currentTheme} 
            isClimax={isClimax}
          />
          
          {/* Progress Bar Container */}
          <div className="absolute bottom-0 left-0 w-full h-2 bg-gray-800 z-50">
            <div 
                className={`h-full ${isClimax ? 'bg-white shadow-[0_0_20px_white]' : 'bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.8)]'} transition-all duration-500 ease-out`}
                style={{ width: `${progress}%` }}
            />
          </div>

          {/* Controls Overlay */}
          <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-4 z-40 px-4 pointer-events-none">
            
            <div className="flex gap-6 pointer-events-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); 
                    stopHypnosis();
                  }}
                  className="p-4 rounded-full bg-black/40 border border-white/20 backdrop-blur-md text-white hover:bg-white/10 transition-colors"
                  aria-label="Stop"
                >
                  <i className="fa-solid fa-stop text-xl"></i>
                </button>

                {!isClimax && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      refreshCommand();
                    }}
                    disabled={loadingCommand}
                    className={`px-6 py-3 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white font-semibold transition-all hover:bg-white/20 flex items-center gap-2 ${loadingCommand ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <i className={`fa-solid fa-wand-magic-sparkles ${loadingCommand ? 'animate-spin' : ''}`}></i>
                    {loadingCommand ? '...' : 'Next'}
                  </button>
                )}
            </div>
            
             <div className="text-[10px] uppercase tracking-widest text-pink-300 opacity-60 font-mono">
                {isClimax ? 'MAXIMUM AROUSAL REACHED' : `Arousal Level: ${progress}%`}
            </div>

          </div>
          
          {/* Instruction hint */}
          {!isClimax && (
            <div className={`absolute top-4 right-4 z-40 text-xs ${currentTheme.textColor} opacity-50 pointer-events-none`}>
              Tap screen for next command
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
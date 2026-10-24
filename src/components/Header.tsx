import React from 'react';
import { Film, Bookmark, Sliders, Sparkles, RotateCcw, User, LogOut, Home } from 'lucide-react';

interface HeaderProps {
  currentView: 'landing' | 'calibrate' | 'recommendations' | 'watchlist';
  setCurrentView: (view: 'landing' | 'calibrate' | 'recommendations' | 'watchlist') => void;
  watchlistCount: number;
  onResetCalibration: () => void;
  pythonEngineActive?: boolean;
  user: { email: string; name: string } | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  watchlistCount,
  onResetCalibration,
  pythonEngineActive = true,
  user,
  onOpenAuth,
  onSignOut
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0b0d13]/85 backdrop-blur-xl border-b border-white/[0.06] transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => setCurrentView('landing')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded bg-[#161a26] border border-[#06b6d4]/40 group-hover:border-[#06b6d4] transition-colors shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]">
            <Film className="w-4 h-4 text-[#4cd7f6] group-hover:scale-110 transition-transform" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#06b6d4] animate-ping" />
          </div>
          <div>
            <span className="font-display font-extrabold text-lg tracking-wider text-white flex items-center gap-1.5">
              CINEMATCH <span className="text-[#4cd7f6] text-xs font-mono font-normal tracking-widest px-1.5 py-0.5 rounded bg-[#06b6d4]/10 border border-[#06b6d4]/30">AI</span>
            </span>
            <span className="block text-[10px] font-mono tracking-widest text-[#869397] uppercase -mt-1">
              Cinema Intelligence Hub
            </span>
          </div>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Home / Landing button */}
          <button
            onClick={() => setCurrentView('landing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono tracking-wider border transition-all cursor-pointer ${
              currentView === 'landing'
                ? 'bg-[#1e2434] border-[#4cd7f6]/40 text-[#4cd7f6]'
                : 'bg-[#191b22] border-white/[0.08] text-[#bcc9cd] hover:text-white'
            }`}
            title="Landing Home"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Home</span>
          </button>

          {/* Calibrate */}
          <button
            onClick={() => setCurrentView('calibrate')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono tracking-wider border transition-all cursor-pointer ${
              currentView === 'calibrate'
                ? 'bg-[#06b6d4]/15 border-[#06b6d4] text-[#4cd7f6] shadow-[0_0_16px_-4px_rgba(6,182,212,0.4)]'
                : 'bg-[#191b22] border-white/[0.08] text-[#bcc9cd] hover:text-white'
            }`}
            title="Calibrate Neural Signals"
          >
            <Sliders className="w-3.5 h-3.5 text-[#4cd7f6]" />
            <span className="hidden sm:inline">Calibrate</span>
          </button>

          {/* Recommendations Queue */}
          <button
            onClick={() => setCurrentView('recommendations')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono tracking-wider border transition-all cursor-pointer ${
              currentView === 'recommendations'
                ? 'bg-[#06b6d4]/15 border-[#06b6d4] text-[#4cd7f6] shadow-[0_0_16px_-4px_rgba(6,182,212,0.4)]'
                : 'bg-[#191b22] border-white/[0.08] text-[#bcc9cd] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#4cd7f6]" />
            <span className="hidden sm:inline">Queue</span>
          </button>

          {/* Watchlist */}
          <button
            onClick={() => setCurrentView('watchlist')}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono tracking-wider border transition-all cursor-pointer ${
              currentView === 'watchlist'
                ? 'bg-[#d0bcff]/15 border-[#d0bcff] text-[#d0bcff] shadow-[0_0_16px_-4px_rgba(208,188,255,0.4)]'
                : 'bg-[#191b22] border-white/[0.08] text-[#bcc9cd] hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Watchlist</span>
            {watchlistCount > 0 && (
              <span className="ml-1 w-4 h-4 rounded-full bg-[#8B5CF6] text-white text-[10px] font-bold flex items-center justify-center font-mono">
                {watchlistCount}
              </span>
            )}
          </button>

          {/* User Profile / Auth Button */}
          {user ? (
            <div className="flex items-center gap-1.5 pl-1">
              <div 
                className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-[#161a26] border border-[#06b6d4]/30 text-xs font-mono text-white"
                title={`Signed in as ${user.email}`}
              >
                <div className="w-4 h-4 rounded-full bg-[#4cd7f6] text-[#003640] flex items-center justify-center text-[10px] font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden lg:inline text-[#bcc9cd] max-w-[100px] truncate">{user.name}</span>
              </div>
              <button
                onClick={onSignOut}
                className="p-1.5 rounded bg-[#191b22] hover:bg-[#282a30] text-[#869397] hover:text-[#ffb4ab] border border-white/[0.06] transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono tracking-wider bg-[#4cd7f6] hover:bg-[#38bdf8] text-[#003640] font-bold transition-all shadow-[0_0_12px_rgba(76,215,246,0.3)] cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

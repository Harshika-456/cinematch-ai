import React from 'react';
import { User, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onStartCalibration: () => void;
  onOpenAuth: () => void;
  user: { email: string; name: string } | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartCalibration,
  onOpenAuth,
  user
}) => {
  return (
    <div className="w-full space-y-12 pb-16 animate-fadeIn">
      {/* Hero Section */}
      <section className="relative pt-20 pb-12 px-4 sm:px-6 max-w-6xl mx-auto text-center space-y-10">
        {/* Hero Headline */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.08]">
            CineMatch{' '}
            <span className="bg-gradient-to-r from-[#4cd7f6] via-[#818cf8] to-[#c4abff] bg-clip-text text-transparent italic font-black">
              Your Mood. Your Movie. Your Match.
            </span>
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          {!user ? (
            <button
              onClick={onOpenAuth}
              className="px-8 py-3.5 rounded-xl bg-[#4cd7f6] hover:bg-[#38bdf8] text-[#003640] font-display font-extrabold text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_0_25px_rgba(76,215,246,0.35)] cursor-pointer flex items-center justify-center gap-2.5"
            >
              <User className="w-4 h-4" />
              <span>Sign In / Access Hub</span>
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#161a26] border border-[#06b6d4]/30 text-xs font-mono text-[#bcc9cd]">
                <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                <span>Signed in as <strong className="text-white">{user.name}</strong></span>
              </div>
              <button
                onClick={onStartCalibration}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#4cd7f6] to-[#818cf8] hover:opacity-95 text-[#002b33] font-display font-extrabold text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(76,215,246,0.3)] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Go to Input Page</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Live Metrics Bar */}
       
      </section>
    </div>
  );
};

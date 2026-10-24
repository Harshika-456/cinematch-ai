import React, { useEffect, useState } from 'react';
import { Cpu, Sparkles, Orbit } from 'lucide-react';

interface SynthesisLoadingProps {
  onComplete: () => void;
}

export const SynthesisLoading: React.FC<SynthesisLoadingProps> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);

  const stages = [
    'Synthesizing Affective Resonance Matrix...',
    'Resolving Narrative Vector Tensors...',
    'Weighting Group Calibration & Pacing Constraints...',
    'Querying 12,000+ Film Nodes Across High-Dimensional Latent Space...',
    'Architecting Uncanny Cinema Recommendations...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStage(prev => {
        if (prev < stages.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(onComplete, 400);
          return prev;
        }
      });
    }, 350);

    return () => clearInterval(interval);
  }, [onComplete, stages.length]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0b0d13]/95 backdrop-blur-2xl">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Glowing Neural Core Reactor */}
        <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-[#06b6d4]/30 animate-ping opacity-60" />
          <div className="absolute -inset-2 rounded-full border border-[#8b5cf6]/40 animate-pulse-slow" />
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#161a26] via-[#10222a] to-[#201533] border border-[#06b6d4] shadow-[0_0_40px_rgba(6,182,212,0.6)] flex items-center justify-center">
            <Cpu className="w-9 h-9 text-[#4cd7f6] animate-pulse" />
          </div>
        </div>

        {/* Status text */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono tracking-widest text-[#4cd7f6] uppercase font-bold px-2.5 py-1 rounded-full bg-[#06b6d4]/10 border border-[#06b6d4]/30">
            NEURAL ENGINE ACTIVE
          </span>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
            {stages[stage]}
          </h3>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#181b24] h-1.5 rounded-full overflow-hidden p-0.5 border border-white/10">
          <div
            className="h-full rounded-full transition-all duration-300 shadow-[0_0_12px_#4cd7f6]"
            style={{
              width: `${((stage + 1) / stages.length) * 100}%`,
              background: 'linear-gradient(90deg, #4cd7f6 0%, #8b5cf6 100%)'
            }}
          />
        </div>

        {/* Quick Skip Button */}
        <div>
          <button
            onClick={onComplete}
            className="text-xs font-mono text-[#869397] hover:text-white transition-colors underline underline-offset-4 cursor-pointer"
          >
            Skip to results
          </button>
        </div>
      </div>
    </div>
  );
};

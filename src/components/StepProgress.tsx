import React from 'react';
import { Check } from 'lucide-react';
import { CalibrationState } from '../data/movies';

interface StepProgressProps {
  calibrationState: CalibrationState;
  onStepClick?: (stepNumber: number) => void;
}

export const StepProgress: React.FC<StepProgressProps> = ({
  calibrationState,
  onStepClick
}) => {
  const isMoodDone = calibrationState.moods.length > 0;
  const isGenreDone = calibrationState.genres.length > 0;
  const isGroupDone = calibrationState.socialDynamic !== null;
  const isTuneDone = isMoodDone && isGenreDone && isGroupDone;

  // First incomplete step is the active one (step 4 once everything is done).
  let currentActiveStep = 1;
  if (isMoodDone) currentActiveStep = 2;
  if (isMoodDone && isGenreDone) currentActiveStep = 3;
  if (isMoodDone && isGenreDone && isGroupDone) currentActiveStep = 4;

  const steps = [
    { number: 1, label: 'MOOD', isCompleted: isMoodDone, isActive: currentActiveStep === 1 },
    { number: 2, label: 'GENRE', isCompleted: isGenreDone, isActive: currentActiveStep === 2 },
    { number: 3, label: 'GROUP', isCompleted: isGroupDone, isActive: currentActiveStep === 3 },
    { number: 4, label: 'TUNE', isCompleted: isTuneDone, isActive: currentActiveStep === 4 },
  ];

  const completedCount = [isMoodDone, isGenreDone, isGroupDone, isTuneDone].filter(Boolean).length;
  const progressPercent = Math.max(Math.min((completedCount / 4) * 100, 100), 5);

  return (
    <div className="w-full max-w-xl mx-auto pt-6 pb-4 px-2">
      <div className="relative flex items-center justify-between">
        {/* Continuous Connecting Line Background */}
        <div className="absolute top-3.5 left-5 right-5 h-[2px] bg-[#1e2230] z-0" />
        
        {/* Dynamic Active Line Fill based on completed steps */}
        <div 
          className="absolute top-3.5 left-5 h-[2px] z-0 transition-all duration-500"
          style={{
            width: `${progressPercent}%`,
            background: 'linear-gradient(90deg, #4cd7f6 0%, #38bdf8 65%, #a855f7 100%)'
          }}
        />

        {/* Step Nodes */}
        {steps.map((step) => {
          return (
            <div 
              key={step.number}
              onClick={() => onStepClick?.(step.number)}
              className="relative z-10 flex flex-col items-center cursor-pointer group select-none"
            >
              {/* Node Icon/Circle */}
              {step.isCompleted ? (
                <div className="w-7 h-7 rounded-full bg-[#4cd7f6] text-[#003640] flex items-center justify-center shadow-[0_0_12px_rgba(76,215,246,0.5)] transition-transform group-hover:scale-110">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              ) : step.isActive ? (
                <div className="w-7 h-7 rounded-full bg-[#181126] border-2 border-[#a855f7] flex items-center justify-center shadow-[0_0_16px_rgba(168,85,247,0.7)] transition-transform group-hover:scale-110">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#c084fc] shadow-[0_0_8px_#c084fc]" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#1e2230] text-[#717b8c] border border-white/10 flex items-center justify-center text-xs font-mono font-medium transition-transform group-hover:border-white/25">
                  {step.number}
                </div>
              )}

              {/* Label */}
              <span 
                className={`mt-2 text-[10px] font-mono tracking-widest uppercase font-semibold transition-colors ${
                  step.isCompleted 
                    ? 'text-[#4cd7f6]' 
                    : step.isActive 
                    ? 'text-[#c084fc]' 
                    : 'text-[#5f687a]'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

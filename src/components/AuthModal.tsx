import React, { useState } from 'react';
import { X, Lock, Mail, User, Sparkles, ArrowRight, ShieldCheck, Check } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: { email: string; name: string }) => void;
  initialEmail?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialEmail = 'harshika.padosa456@gmail.com'
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('••••••••••••');
  const [name, setName] = useState('Harshika');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSuccess({
        email: email || 'user@cinematch.ai',
        name: name || email.split('@')[0] || 'Cinephile'
      });
      onClose();
    }, 600);
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSuccess({
        email: initialEmail || 'harshika.padosa456@gmail.com',
        name: 'Harshika'
      });
      onClose();
    }, 500);
  };

  const handleGuestContinue = () => {
    onSuccess({
      email: 'guest@cinematch.ai',
      name: 'Guest Explorer'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#111319] rounded-2xl border border-[#06b6d4]/40 shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden z-10">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#161a26] border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#06b6d4]/15 border border-[#06b6d4]/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#4cd7f6]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-base">
                {mode === 'signin' ? 'Sign In to CineMatch' : 'Create Neural Profile'}
              </h3>
              <p className="text-[10px] font-mono text-[#869397] uppercase tracking-wider">
                Cinema Intelligence Hub
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1f2433] hover:bg-[#282f42] text-[#bcc9cd] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-white/[0.06] bg-[#0c0e14]">
          <button
            onClick={() => setMode('signin')}
            className={`flex-1 py-3 text-xs font-mono font-semibold transition-colors cursor-pointer text-center ${
              mode === 'signin'
                ? 'text-[#4cd7f6] border-b-2 border-[#4cd7f6] bg-[#161a26]/40'
                : 'text-[#869397] hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-3 text-xs font-mono font-semibold transition-colors cursor-pointer text-center ${
              mode === 'signup'
                ? 'text-[#4cd7f6] border-b-2 border-[#4cd7f6] bg-[#161a26]/40'
                : 'text-[#869397] hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {/* 1-Click Google Auth */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 px-4 rounded-xl bg-[#191b24] hover:bg-[#222736] border border-white/10 hover:border-[#4cd7f6]/40 text-white text-xs font-mono transition-all flex items-center justify-center gap-3 cursor-pointer shadow-sm group"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="group-hover:text-[#4cd7f6] transition-colors">
              Continue with Google Account
            </span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-[1px] bg-white/[0.08]" />
            <span className="text-[10px] font-mono text-[#717b8c] uppercase">or with email</span>
            <div className="flex-1 h-[1px] bg-white/[0.08]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#bcc9cd] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#869397]" />
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Harshika"
                  className="w-full px-3 py-2 rounded-lg bg-[#0e1118] border border-white/[0.08] focus:border-[#4cd7f6] text-xs text-white placeholder-[#555e6d] outline-none"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-[#bcc9cd] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#869397]" />
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2 rounded-lg bg-[#0e1118] border border-white/[0.08] focus:border-[#4cd7f6] text-xs text-white placeholder-[#555e6d] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-[#bcc9cd] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#869397]" />
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-lg bg-[#0e1118] border border-white/[0.08] focus:border-[#4cd7f6] text-xs text-white placeholder-[#555e6d] outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#4cd7f6] hover:bg-[#38bdf8] text-[#003640] font-display font-extrabold text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(76,215,246,0.3)] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating Neural Matrix...</span>
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In & Access Taste Profile' : 'Create & Calibrate'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Guest Continue */}
          <div className="pt-2 text-center border-t border-white/[0.04]">
            <button
              type="button"
              onClick={handleGuestContinue}
              className="text-xs font-mono text-[#869397] hover:text-[#bcc9cd] transition-colors underline underline-offset-4 cursor-pointer"
            >
              Skip and continue as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { 
  Sparkles, 
  Check, 
  Plus, 
  Cpu, 
  Clock, 
  Star, 
  Languages, 
  User, 
  Users, 
  Heart,
  Laptop,
  Rocket,
  Trophy,
  Scroll,
  Fingerprint,
  Search,
  Compass,
  FlaskConical,
  Headphones,
  BookOpen,
  Wand2,
  Flame,
  Scale,
  Swords,
  GraduationCap,
  Landmark,
  Shield,
  Home
} from 'lucide-react';
import { CalibrationState, LANGUAGE_AUDIO_TRACKS } from '../data/movies';

interface CalibrationScreenProps {
  state: CalibrationState;
  onChange: (updater: (prev: CalibrationState) => CalibrationState) => void;
  customPrompt: string;
  onCustomPromptChange: (val: string) => void;
  onGenerate: () => void;
}

export const CalibrationScreen: React.FC<CalibrationScreenProps> = ({
  state,
  onChange,
  customPrompt,
  onCustomPromptChange,
  onGenerate
}) => {
  // Preset archetypes for 1-click dynamic re-calibration
  const presets = [
    {
      name: 'Friends Night Speculative',
      config: {
        moods: ['Relaxed', 'Thoughtful'],
        narrativeVectors: [],
        genres: ['Sci-Fi', 'Thriller'],
        socialDynamic: 'friends' as const,
        maxDuration: 135,
        ratingThreshold: 7.5,
        audioLanguage: 'EN'
      }
    },
    {
      name: 'Late-Night Mindbender',
      config: {
        moods: ['Thoughtful', 'Scared'],
        narrativeVectors: [],
        genres: ['Sci-Fi', 'Thriller', 'Mystery'],
        socialDynamic: 'solo' as const,
        maxDuration: 120,
        ratingThreshold: 7.5,
        audioLanguage: 'EN'
      }
    },
    {
      name: 'Harmonized Romance',
      config: {
        moods: ['Romantic', 'Emotional', 'Thoughtful'],
        narrativeVectors: [],
        genres: ['Drama', 'Romance'],
        socialDynamic: 'partner' as const,
        maxDuration: 120,
        ratingThreshold: 8.0,
        audioLanguage: 'EN'
      }
    },
    {
      name: 'Family Wonder',
      config: {
        moods: ['Happy', 'Funny', 'Excited'],
        narrativeVectors: [],
        genres: ['Animation', 'Adventure', 'Comedy'],
        socialDynamic: 'family' as const,
        maxDuration: 110,
        ratingThreshold: 8.0,
        audioLanguage: 'EN'
      }
    }
  ];

  // Mood options
  const moods = [
    { id: 'Happy', label: 'Happy', emoji: '😊', glow: 'cyan' },
    { id: 'Funny', label: 'Funny', emoji: '😂', glow: 'cyan' },
    { id: 'Relaxed', label: 'Relaxed', emoji: '😌', glow: 'cyan' },
    { id: 'Excited', label: 'Excited', emoji: '🔥', glow: 'amber' },
    { id: 'Scared', label: 'Scared', emoji: '😱', glow: 'purple' },
    { id: 'Romantic', label: 'Romantic', emoji: '❤️', glow: 'pink' },
    { id: 'Thoughtful', label: 'Thoughtful', emoji: '🧠', glow: 'purple' },
    { id: 'Emotional', label: 'Emotional', emoji: '😢', glow: 'cyan' },
  ];

  // Genres
  const genres = [
    'Comedy',
    'Drama',
    'Romance',
    'Action',
    'Thriller',
    'Mystery',
    'Crime',
    'Horror',
    'Sci-Fi',
    'Fantasy',
    'Animation',
    'Family'
  ];

  // Social dynamic options
  const socialOptions: Array<{
    id: CalibrationState['socialDynamic'];
    title: string;
    description: string;
    icon: typeof User;
    iconBg: string;
    iconColor: string;
    isActiveBadge?: boolean;
  }> = [
    {
      id: 'solo',
      title: 'Solo Experience',
      description: 'Deep immersion, unrestricted content pacing',
      icon: User,
      iconBg: 'bg-[#0369a1]/25 border border-[#0284c7]/40',
      iconColor: 'text-[#38bdf8]'
    },
    {
      id: 'family',
      title: 'Family Gathering',
      description: 'Prioritizes family-friendly content',
      icon: Users,
      iconBg: 'bg-[#92400e]/25 border border-[#b45309]/40',
      iconColor: 'text-[#fbbf24]'
    },
    {
      id: 'friends',
      title: 'Friends Night',
      description: 'Crowd-pleasing pacing & elevated dialogue',
      icon: Users,
      iconBg: 'bg-[#6b21a8]/35 border border-[#9333ea]/50',
      iconColor: 'text-[#c084fc]',
      isActiveBadge: true
    },
    {
      id: 'partner',
      title: 'Partner Sync',
      description: 'Harmonizes romantic & captivating narratives',
      icon: Heart,
      iconBg: 'bg-[#9f1239]/25 border border-[#e11d48]/40',
      iconColor: 'text-[#fb7185]'
    }
  ];

  // Handlers
  const toggleMood = (moodId: string) => {
    onChange(prev => {
      const exists = prev.moods.includes(moodId);
      const newMoods = exists 
        ? prev.moods.filter(m => m !== moodId) 
        : [...prev.moods, moodId];
      return { ...prev, moods: newMoods };
    });
  };

  const toggleGenre = (genreId: string) => {
    onChange(prev => {
      const exists = prev.genres.includes(genreId);
      const newGenres = exists 
        ? prev.genres.filter(g => g !== genreId) 
        : [...prev.genres, genreId];
      return { ...prev, genres: newGenres };
    });
  };

  const setSocialDynamic = (dynamic: CalibrationState['socialDynamic']) => {
    onChange(prev => ({ 
      ...prev, 
      socialDynamic: prev.socialDynamic === dynamic ? null : dynamic 
    }));
  };

  const formatDuration = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const remainder = mins % 60;
    if (mins >= 180) return 'Any Duration (3h+)';
    return `Under ${hours}h ${remainder > 0 ? `${remainder}m` : ''}`;
  };

  const profileHypothesis = (() => {
    const activeLanguages =
      state.audioLanguages && state.audioLanguages.length > 0
        ? state.audioLanguages
        : state.audioLanguage
          ? [state.audioLanguage]
          : [];

    const parts: string[] = [];
    if (state.moods.length > 0) parts.push(`feeling ${state.moods.join(', ').toLowerCase()}`);
    if (state.genres.length > 0) parts.push(`${state.genres.join(', ')} movies`);
    if (state.socialDynamic) {
      const who: Record<string, string> = {
        solo: 'watching solo',
        family: 'watching with family',
        friends: 'watching with friends',
        partner: 'watching with a partner'
      };
      parts.push(who[state.socialDynamic] || 'watching together');
    }
    if (activeLanguages.length > 0) {
      parts.push(`in ${activeLanguages.map(l => l.charAt(0).toUpperCase() + l.slice(1)).join(', ')}`);
    }

    return parts.length > 0
      ? `Looking for: ${parts.join(' · ')}.`
      : 'Pick your mood, genre and who you are watching with to get started.';
  })();

  return (
    <div className="w-full max-w-xl mx-auto px-4 pb-20 pt-2 space-y-8">
      {/* Preset Archetypes Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-[#869397]">
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-[#bcc9cd]">
            <Wand2 className="w-3.5 h-3.5 text-[#4cd7f6]" />
            Quick Neural Archetypes
          </span>
          <span className="text-[10px] text-[#717b8c]">1-Click Presets</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {presets.map(p => (
            <button
              key={p.name}
              onClick={() => onChange(() => p.config)}
              className="px-2.5 py-1 rounded bg-[#161a26] hover:bg-[#1f2434] text-[11px] font-mono text-[#bcc9cd] hover:text-[#4cd7f6] border border-white/[0.08] hover:border-[#06b6d4]/40 transition-all whitespace-nowrap cursor-pointer shrink-0"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Synthesizing Badge */}
      <div className="flex justify-start">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#06b6d4]/10 border border-[#06b6d4]/25 shadow-[0_0_15px_-4px_rgba(6,182,212,0.3)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6] animate-ping" />
          <span className="text-[10px] font-mono tracking-widest text-[#4cd7f6] font-semibold uppercase">
            SYNTHESIZING NEURAL TASTE
          </span>
        </div>
      </div>

      {/* Hero Headline */}
      <div className="space-y-3">
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
          Let&apos;s find your{' '}
          <span className="text-[#4cd7f6] italic tracking-normal font-black">
            perfect
          </span>{' '}
          movie.
        </h1>
        <p className="text-[#869397] text-sm sm:text-base leading-relaxed">
          A few quick signals and our machine intelligence will architect an uncanny recommendation queue.
        </p>
      </div>

      {/* 01 Current Resonance */}
      <section className="space-y-3" id="step-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-[#161a26] text-[#4cd7f6] border border-[#06b6d4]/30 text-[11px] font-mono font-bold">
              01
            </span>
            <h2 className="text-sm font-semibold tracking-wide text-white uppercase font-display">
              Current Resonance
            </h2>
          </div>
          <span className="text-[10px] font-mono tracking-wider text-[#869397] uppercase">
            SELECT 1 OR MORE
          </span>
        </div>

        {/* Mood Grid: 4 columns x 2 rows */}
        <div className="grid grid-cols-4 gap-2.5">
          {moods.map(m => {
            const isSelected = state.moods.includes(m.id);
            const isPurple = m.id === 'Thoughtful' || m.id === 'Scared';
            
            return (
              <button
                key={m.id}
                onClick={() => toggleMood(m.id)}
                className={`relative group flex flex-col items-center justify-center p-3 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? isPurple
                      ? 'bg-[#1e172a] border-[#a855f7] shadow-[0_0_18px_-4px_rgba(168,85,247,0.4)]'
                      : 'bg-[#10222a] border-[#06b6d4] shadow-[0_0_18px_-4px_rgba(6,182,212,0.4)]'
                    : 'bg-[#141720] border-white/[0.06] hover:border-white/20 hover:bg-[#191b24]'
                }`}
              >
                {/* Micro Indicator Dot on Top Right */}
                {isSelected && (
                  <span
                    className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${
                      isPurple 
                        ? 'bg-[#c084fc] shadow-[0_0_6px_#c084fc]' 
                        : 'bg-[#4cd7f6] shadow-[0_0_6px_#4cd7f6]'
                    }`}
                  />
                )}
                
                <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform select-none">
                  {m.emoji}
                </span>
                <span
                  className={`text-xs font-medium tracking-tight ${
                    isSelected
                      ? isPurple
                        ? 'text-[#d0bcff] font-semibold'
                        : 'text-[#4cd7f6] font-semibold'
                      : 'text-[#bcc9cd]'
                  }`}
                >
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 02 Genre Affinity */}
      <section className="space-y-3" id="step-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-[#161a26] text-[#4cd7f6] border border-[#06b6d4]/30 text-[11px] font-mono font-bold">
              02
            </span>
            <h2 className="text-sm font-semibold tracking-wide text-white uppercase font-display">
              Genre Affinity
            </h2>
          </div>
          <span className="text-[10px] font-mono tracking-wider text-[#869397] uppercase">
            Core Weights
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {genres.map(genre => {
            const isSelected = state.genres.includes(genre);

            return (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#6b21a8] text-[#f3e8ff] border border-[#a855f7] shadow-[0_0_16px_-4px_rgba(168,85,247,0.5)]'
                    : 'bg-[#141720] text-[#bcc9cd] border border-white/[0.08] hover:border-white/20 hover:text-white'
                }`}
              >
                <span>{genre}</span>
                {isSelected ? (
                  <Check className="w-3.5 h-3.5 text-[#e9d5ff]" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-[#717b8c]" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* 03 Social Dynamic */}
      <section className="space-y-3" id="step-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-[#161a26] text-[#4cd7f6] border border-[#06b6d4]/30 text-[11px] font-mono font-bold">
              03
            </span>
            <h2 className="text-sm font-semibold tracking-wide text-white uppercase font-display">
              Social Dynamic
            </h2>
          </div>
          <span className="text-[10px] font-mono tracking-wider text-[#869397] uppercase">
            Group Calibration
          </span>
        </div>

        <div className="space-y-2">
          {socialOptions.map(option => {
            const isSelected = state.socialDynamic === option.id;
            const Icon = option.icon;

            return (
              <div
                key={option.id}
                onClick={() => setSocialDynamic(option.id)}
                className={`flex items-center justify-between p-3.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#161a26] border-[#8b5cf6]/70 shadow-[0_0_24px_-6px_rgba(139,92,246,0.3)]'
                    : 'bg-[#141720] border-white/[0.06] hover:border-white/20 hover:bg-[#181b25]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-md flex items-center justify-center ${option.iconBg}`}>
                    <Icon className={`w-5 h-5 ${option.iconColor}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">
                        {option.title}
                      </span>
                      {isSelected && option.isActiveBadge && (
                        <span className="px-1.5 py-0.5 rounded bg-[#6b21a8] text-[#e9d5ff] text-[9px] font-mono font-bold tracking-widest uppercase">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#869397] mt-0.5">
                      {option.description}
                    </p>
                  </div>
                </div>

                {/* Radio Indicator */}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-[#8b5cf6] text-white shadow-[0_0_10px_#8b5cf6]'
                      : 'border-2 border-white/20'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 04 Fine-Tune Constraints */}
      <section className="space-y-3" id="step-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-[#161a26] text-[#4cd7f6] border border-[#06b6d4]/30 text-[11px] font-mono font-bold">
              04
            </span>
            <h2 className="text-sm font-semibold tracking-wide text-white uppercase font-display">
              Fine-Tune Constraints
            </h2>
          </div>
          <span className="text-[10px] font-mono tracking-wider text-[#869397] uppercase">
            Strict Metrics
          </span>
        </div>

        <div className="p-4 rounded-lg bg-[#141720] border border-white/[0.06] space-y-5">
          {/* Maximum Duration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-[#bcc9cd]">
                <Clock className="w-3.5 h-3.5 text-[#869397]" />
                Maximum Duration
              </span>
              <span className="font-mono text-[#4cd7f6] font-semibold">
                {formatDuration(state.maxDuration)}
              </span>
            </div>
            
            <div className="relative pt-1">
              <input
                type="range"
                min="75"
                max="180"
                step="15"
                value={state.maxDuration}
                onChange={e => {
                  const val = Number(e.target.value);
                  onChange(prev => ({ ...prev, maxDuration: val }));
                }}
                className="w-full h-1.5 bg-[#1f2433] rounded-lg appearance-none cursor-pointer accent-[#4cd7f6]"
              />
            </div>
          </div>

          <div className="h-[1px] bg-white/[0.04]" />

          {/* Critic / Audience Threshold */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-[#bcc9cd]">
              <Star className="w-3.5 h-3.5 text-[#f59e0b]" />
              Critic / Audience Threshold
            </span>
            <button
              onClick={() => {
                const next = state.ratingThreshold === 7.5 ? 8.0 : state.ratingThreshold === 8.0 ? 7.0 : 7.5;
                onChange(prev => ({ ...prev, ratingThreshold: next }));
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#ffb95f] text-xs font-mono font-bold tracking-wider hover:bg-[#f59e0b]/20 transition-colors cursor-pointer"
            >
              <span>★ {state.ratingThreshold.toFixed(1)}+ RATING</span>
            </button>
          </div>

          <div className="h-[1px] bg-white/[0.04]" />

          {/* Language Audio Tracks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-[#bcc9cd]">
                <Languages className="w-3.5 h-3.5 text-[#4cd7f6]" />
                <span className="font-medium text-white">Language Audio Tracks</span>
                <span className="text-[10px] font-mono text-[#869397] hidden sm:inline">
                  (Multi-select or single audio channel)
                </span>
              </div>
              {(state.audioLanguage || (state.audioLanguages && state.audioLanguages.length > 0)) && (
                <button
                  type="button"
                  onClick={() => onChange(prev => ({ ...prev, audioLanguage: '', audioLanguages: [] }))}
                  className="text-[10px] font-mono text-[#869397] hover:text-[#4cd7f6] underline cursor-pointer"
                >
                  Clear Audio Filter
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5 sm:gap-2">
              {LANGUAGE_AUDIO_TRACKS.map(track => {
                const isSelected = (state.audioLanguages && state.audioLanguages.includes(track.id)) || state.audioLanguage === track.id;
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => {
                      onChange(prev => {
                        const current = prev.audioLanguages && prev.audioLanguages.length > 0
                          ? [...prev.audioLanguages]
                          : (prev.audioLanguage ? [prev.audioLanguage] : []);
                        
                        const next = current.includes(track.id)
                          ? current.filter(id => id !== track.id)
                          : [...current, track.id];

                        return {
                          ...prev,
                          audioLanguages: next,
                          audioLanguage: next.length > 0 ? next[0] : ''
                        };
                      });
                    }}
                    className={`relative flex flex-col items-center justify-center py-2 px-2 rounded-lg border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#06b6d4]/15 border-[#4cd7f6] text-white shadow-[0_0_15px_rgba(76,215,246,0.3)] ring-1 ring-[#4cd7f6]'
                        : 'bg-[#10131d] border-white/[0.06] text-[#869397] hover:border-white/20 hover:text-[#bcc9cd]'
                    }`}
                  >
                    {/* Active pulse pip */}
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#4cd7f6] shadow-[0_0_6px_#4cd7f6]" />
                    )}

                    <span className="text-[11px] font-mono font-bold tracking-wide block">
                      {track.label}
                    </span>
                    <span className="text-[9px] font-sans opacity-70 block mt-0.5">
                      {track.nativeName}
                    </span>
                    <span className={`text-[8px] font-mono px-1 py-0.2 rounded mt-1 uppercase ${
                      isSelected ? 'bg-[#4cd7f6]/25 text-[#4cd7f6]' : 'bg-white/5 text-[#717b8c]'
                    }`}>
                      {track.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active tracks indicator */}
            {((state.audioLanguages && state.audioLanguages.length > 0) || state.audioLanguage) && (
              <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-[#4cd7f6]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6] animate-pulse" />
                <span>
                  Filtering audio tracks: {
                    (state.audioLanguages && state.audioLanguages.length > 0)
                      ? state.audioLanguages.map(id => id.toUpperCase()).join(', ')
                      : state.audioLanguage.toUpperCase()
                  }
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Custom Specific Intent Input */}
      <section className="space-y-2">
        <label className="flex items-center justify-between text-xs font-mono text-[#bcc9cd]">
          <span className="flex items-center gap-1.5 uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-[#4cd7f6]" />
            Specific Cinematic Intent (Optional)
          </span>
          <span className="text-[10px] text-[#717b8c]">Natural Language</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={customPrompt}
            onChange={e => onCustomPromptChange(e.target.value)}
            placeholder="e.g., 90s dystopian tech noir, cozy time-travel comedy, or Denis Villeneuve style..."
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#0e1118] border border-white/[0.08] focus:border-[#06b6d4] text-xs text-white placeholder-[#555e6d] outline-none transition-colors font-sans shadow-inner"
          />
        </div>
      </section>

      {/* Dynamic Profile Hypothesis Card */}
      <div className="p-4 rounded-lg bg-[#111624] border border-[#06b6d4]/30 shadow-[0_0_20px_-6px_rgba(6,182,212,0.2)] flex items-start gap-3.5 transition-all">
        <div className="w-8 h-8 rounded-md bg-[#06b6d4]/15 border border-[#06b6d4]/40 flex items-center justify-center shrink-0 mt-0.5">
          <Cpu className="w-4 h-4 text-[#4cd7f6]" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="block text-[10px] font-mono tracking-widest text-[#4cd7f6] font-bold uppercase">
              PROFILE HYPOTHESIS
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6] animate-pulse" />
          </div>
          <p className="text-xs text-[#bcc9cd] leading-relaxed">
            {profileHypothesis}
          </p>
        </div>
      </div>

      {/* Generate Recommendations Action Button */}
      <div className="pt-2 space-y-3">
        <button
          onClick={onGenerate}
          className="w-full relative group overflow-hidden rounded-xl p-4 sm:p-4.5 bg-gradient-to-r from-[#4cd7f6] via-[#818cf8] to-[#c4abff] text-[#0b0d13] font-display font-extrabold text-sm sm:text-base tracking-wider uppercase transition-all duration-300 hover:shadow-[0_0_40px_rgba(76,215,246,0.5)] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2.5"
        >
          {/* Shimmer overlay */}
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
          
          <Sparkles className="w-5 h-5 text-[#0b0d13] fill-[#0b0d13]" />
          <span>GENERATE RECOMMENDATIONS</span>
        </button>

        <p className="text-center text-xs font-mono text-[#717b8c] tracking-wide flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6]" />
          Analyzing 12,000+ films against your taste profile
        </p>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { 
  Play, 
  Bookmark, 
  BookmarkCheck, 
  Star, 
  Sliders, 
  Sparkles, 
  LayoutGrid, 
  Tv, 
  Layers, 
  ArrowRight, 
  Search, 
  ArrowUpDown, 
  ThumbsUp, 
  ThumbsDown, 
  Zap, 
} from 'lucide-react';
import { Movie, CalibrationState } from '../data/movies';
import { searchMovies } from '../services/tmdbService';

interface RecommendationQueueProps {
  movies: Movie[];
  calibrationState: CalibrationState;
  onOpenCalibration: () => void;
  onSelectMovie: (movie: Movie) => void;
  onPlayTrailer: (movie: Movie) => void;
  watchlist: string[];
  onToggleWatchlist: (movie: Movie) => void;
  onMoreLikeThis: (movie: Movie) => void;
  isAiGenerated?: boolean;
}

export const RecommendationQueue: React.FC<RecommendationQueueProps> = ({
  movies,
  calibrationState,
  onOpenCalibration,
  onSelectMovie,
  onPlayTrailer,
  watchlist,
  onToggleWatchlist,
  onMoreLikeThis,
  isAiGenerated = false
}) => {
  const [viewMode, setViewMode] = useState<'widescreen' | 'grid'>('widescreen');
  const [selectedGenreFilter, setSelectedGenreFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'match' | 'rating' | 'year' | 'duration'>('match');
  const [userFeedback, setUserFeedback] = useState<Record<string, 'liked' | 'disliked'>>({});
  const [tmdbMovies, setTmdbMovies] = useState<Movie[]>([]);
  const [isSearchingTmdb, setIsSearchingTmdb] = useState(false);
  const [tmdbSearchError, setTmdbSearchError] = useState('');

  const handleTmdbSearch = async () => {
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearchingTmdb(true);
    setTmdbSearchError('');
    try {
      const response = await searchMovies(query);
      setTmdbMovies(response.results || []);
      setSelectedGenreFilter('All');
      setUserFeedback({});
    } catch (error: any) {
      setTmdbMovies([]);
      setTmdbSearchError(error?.message || 'Could not search TMDB.');
    } finally {
      setIsSearchingTmdb(false);
    }
  };

  const handleFeedback = (movieId: string, type: 'liked' | 'disliked', e: React.MouseEvent) => {
    e.stopPropagation();
    setUserFeedback(prev => ({
      ...prev,
      [movieId]: prev[movieId] === type ? undefined : type
    } as any));
  };

  // Filter and sort movies dynamically
  const filteredAndSortedMovies = useMemo(() => {
    let result = [...(tmdbMovies.length > 0 ? tmdbMovies : movies)];

    // Filter out disliked movies
    result = result.filter(m => userFeedback[m.id] !== 'disliked');

    // Genre filter
    if (selectedGenreFilter !== 'All') {
      result = result.filter(m => m.genres.includes(selectedGenreFilter));
    }

    // Search query
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m => 
        m.title.toLowerCase().includes(q) ||
        m.director.toLowerCase().includes(q) ||
        m.cast.some(c => c.toLowerCase().includes(q)) ||
        m.synopsis.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'match') {
        const bonusA = userFeedback[a.id] === 'liked' ? 5 : 0;
        const bonusB = userFeedback[b.id] === 'liked' ? 5 : 0;
        return (b.matchScore + bonusB) - (a.matchScore + bonusA);
      }
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'year') return b.year - a.year;
      if (sortBy === 'duration') return a.durationMinutes - b.durationMinutes;
      return 0;
    });

    return result;
  }, [movies, tmdbMovies, selectedGenreFilter, searchQuery, sortBy, userFeedback]);

  const displayMovies = filteredAndSortedMovies.length > 0 ? filteredAndSortedMovies : movies;
  const topMovie = displayMovies[0];



  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fadeIn">
      {/* Simple Recommendations Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#121520]/80 backdrop-blur-xl border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4cd7f6]" />
            <h2 className="text-sm sm:text-base font-display font-bold text-white">Your Movie Recommendations</h2>
          </div>
          <p className="mt-1 text-xs text-[#869397]">Based on your mood, interests, language, and viewing preferences.</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            {calibrationState.moods.length > 0 && (
              <span className="px-2 py-0.5 rounded bg-[#1e2230] text-[#bcc9cd] text-[11px] border border-white/[0.06]">
                Mood: {calibrationState.moods.join(', ')}
              </span>
            )}
            {((calibrationState.audioLanguages && calibrationState.audioLanguages.length > 0) || calibrationState.audioLanguage) && (
              <span className="px-2 py-0.5 rounded bg-[#06b6d4]/15 text-[#4cd7f6] text-[11px] border border-[#06b6d4]/30">
                Language: {(calibrationState.audioLanguages && calibrationState.audioLanguages.length > 0) ? calibrationState.audioLanguages.join(', ') : calibrationState.audioLanguage}
              </span>
            )}
            {calibrationState.socialDynamic && (
              <span className="px-2 py-0.5 rounded bg-[#8b5cf6]/15 text-[#d0bcff] text-[11px] border border-[#8b5cf6]/30">
                Watching: {calibrationState.socialDynamic}
              </span>
            )}
            <span className="px-2 py-0.5 rounded bg-[#f59e0b]/10 text-[#ffb95f] text-[11px] border border-[#f59e0b]/25">
              Up to {Math.floor(calibrationState.maxDuration / 60)}h {calibrationState.maxDuration % 60}m
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isAiGenerated && (
            <span className="px-2.5 py-1.5 rounded-lg bg-[#8b5cf6]/15 text-[#d0bcff] text-[11px] font-mono border border-[#8b5cf6]/30">
              AI Recommendations
            </span>
          )}
          <button
            onClick={onOpenCalibration}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#06b6d4]/15 hover:bg-[#06b6d4]/25 text-[#4cd7f6] font-mono text-xs border border-[#06b6d4]/40 transition-all cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Refine Preferences</span>
          </button>
          <div className="flex items-center p-1 rounded-lg bg-[#161a24] border border-white/[0.06]">
            <button onClick={() => setViewMode('widescreen')} className={`p-1.5 rounded transition-colors cursor-pointer ${viewMode === 'widescreen' ? 'bg-[#1f2433] text-[#4cd7f6]' : 'text-[#717b8c] hover:text-white'}`} title="Widescreen view">
              <Layers className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-[#1f2433] text-[#4cd7f6]' : 'text-[#717b8c] hover:text-white'}`} title="Grid view">
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Live Search & Sort Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#121520]/60 border border-white/[0.05]">
        {/* Search Input */}
        <div className="flex-1 max-w-2xl">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-[#717b8c] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') void handleTmdbSearch(); }}
                placeholder="Search real movies: Inception, Dangal, Interstellar..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0f1118] border border-white/[0.08] focus:border-[#4cd7f6] text-xs text-white placeholder-[#555e6d] outline-none"
              />
            </div>
            <button
              onClick={() => void handleTmdbSearch()}
              disabled={isSearchingTmdb || !searchQuery.trim()}
              className="px-3 py-2 rounded-lg bg-[#4cd7f6] hover:bg-[#38bdf8] disabled:opacity-40 disabled:cursor-not-allowed text-[#003640] text-xs font-bold font-mono uppercase transition-all"
            >
              {isSearchingTmdb ? 'Searching...' : 'Search TMDB'}
            </button>
          </div>
          {tmdbSearchError && (
            <p className="mt-1.5 text-[10px] font-mono text-[#ff8a8a]">{tmdbSearchError}</p>
          )}
          {tmdbMovies.length > 0 && (
            <p className="mt-1.5 text-[10px] font-mono text-[#4cd7f6]">
              LIVE TMDB RESULTS · Real posters and backdrops loaded
            </p>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#869397] flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Sort:
          </span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg bg-[#161a26] border border-white/[0.08] text-xs text-[#bcc9cd] focus:text-white outline-none cursor-pointer"
          >
            <option value="match">Highest Match %</option>
            <option value="rating">IMDb Rating</option>
            <option value="year">Release Year (Newest)</option>
            <option value="duration">Shortest Runtime</option>
          </select>
        </div>
      </div>

      {/* Primary Top Match Banner (The #1 Uncanny Match) */}
      {topMovie && (
        <section className="relative rounded-2xl overflow-hidden border border-[#06b6d4]/30 bg-[#121520] shadow-[0_0_40px_rgba(6,182,212,0.15)] group">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">
            {/* Backdrop Visual Container (7 cols) */}
            <div className="lg:col-span-7 relative overflow-hidden h-64 lg:h-auto bg-[#161a26]">
              <img
                src={topMovie.backdropUrl}
                alt={topMovie.title}
                className="w-full h-full object-cover object-center filter brightness-90 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-transparent via-[#121520]/60 to-[#121520]" />
              
              {/* Top #1 Match badge */}
              <div className="absolute top-4 left-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#06b6d4]/20 backdrop-blur-md border border-[#06b6d4]/50 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                  <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-ping" />
                  <span className="text-[11px] font-mono font-bold tracking-widest text-[#4cd7f6]">
                    ★ {topMovie.matchScore}% UNCANNY NEURAL FIT
                  </span>
                </div>
              </div>

              {/* Quick Play Trailer Button Overlay */}
              <button
                onClick={() => onPlayTrailer(topMovie)}
                className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/60 hover:bg-[#4cd7f6] hover:text-[#003640] text-white flex items-center justify-center backdrop-blur-sm border border-white/20 hover:border-[#4cd7f6] transition-all duration-300 hover:scale-110 shadow-[0_0_30px_rgba(6,182,212,0.5)] cursor-pointer"
                title="Play Theatrical Trailer"
              >
                <Play className="w-6 h-6 fill-current ml-1" />
              </button>
            </div>

            {/* Content Details (5 cols) */}
            <div className="lg:col-span-5 p-6 lg:p-8 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/30 px-2 py-0.5 rounded font-bold">
                    ★ {topMovie.rating} IMDB
                  </span>
                  <span className="text-xs font-mono text-[#869397]">
                    {topMovie.durationMinutes} MIN · {topMovie.year}
                  </span>
                  {topMovie.audioTracks && topMovie.audioTracks.length > 0 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#06b6d4]/10 border border-[#06b6d4]/30 text-[#4cd7f6] uppercase font-semibold">
                      Audio: {topMovie.audioTracks.join(', ')}
                    </span>
                  )}
                </div>

                <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {topMovie.title}
                </h3>

                <p className="text-xs font-mono text-[#4cd7f6] italic">
                  &ldquo;{topMovie.tagline}&rdquo;
                </p>

                <p className="text-xs text-[#bcc9cd] line-clamp-3 leading-relaxed">
                  {topMovie.synopsis}
                </p>

                {/* Algorithmic Reason Box */}
                <div className="p-3 rounded-lg bg-[#161a26] border border-[#06b6d4]/20 text-[11px] text-[#bcc9cd] leading-relaxed">
                  <span className="text-[#4cd7f6] font-mono font-bold uppercase block mb-0.5">
                    Why this matches:
                  </span>
                  {topMovie.aiHypothesisMatch}
                </div>
              </div>

              {/* Bottom CTAs */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <button
                  onClick={() => onSelectMovie(topMovie)}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-[#4cd7f6] hover:bg-[#38bdf8] text-[#003640] font-display font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(76,215,246,0.35)] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Intelligence Dossier</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* More Like This */}
                <button
                  onClick={() => onMoreLikeThis(topMovie)}
                  className="p-2.5 rounded-lg bg-[#191b22] hover:bg-[#282a30] text-[#bcc9cd] hover:text-[#4cd7f6] border border-white/10 transition-all cursor-pointer"
                  title="Tune vectors around this movie"
                >
                  <Zap className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onToggleWatchlist(topMovie)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                    watchlist.includes(topMovie.id)
                      ? 'bg-[#8b5cf6]/20 border-[#8b5cf6] text-[#d0bcff]'
                      : 'bg-[#191b22] border-white/10 text-[#bcc9cd] hover:text-white'
                  }`}
                  title="Save to Watchlist"
                >
                  {watchlist.includes(topMovie.id) ? (
                    <BookmarkCheck className="w-4 h-4 text-[#d0bcff]" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Genre Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-mono text-[#717b8c] uppercase tracking-wider whitespace-nowrap mr-1">
          Stream Filter:
        </span>
        {['All', 'Sci-Fi', 'Mystery', 'Thriller', 'Drama', 'Adventure', 'Action', 'Comedy', 'Animation'].map(genre => (
          <button
            key={genre}
            onClick={() => setSelectedGenreFilter(genre)}
            className={`px-3 py-1 rounded text-xs font-mono transition-all whitespace-nowrap cursor-pointer ${
              selectedGenreFilter === genre
                ? 'bg-[#06b6d4]/20 text-[#4cd7f6] border border-[#06b6d4]/40 font-semibold'
                : 'bg-[#141720] text-[#869397] border border-white/[0.06] hover:text-[#bcc9cd]'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Recommendation Stream Grid */}
      {viewMode === 'widescreen' ? (
        /* Widescreen 16:9 Stream Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayMovies.slice(1).map(movie => {
            const isSaved = watchlist.includes(movie.id);
            const feedback = userFeedback[movie.id];

            return (
              <div
                key={movie.id}
                className="group relative rounded-xl bg-[#121520]/80 backdrop-blur-xl border border-white/[0.06] hover:border-[#06b6d4]/40 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.25)] overflow-hidden flex flex-col justify-between"
              >
                {/* 16:9 Visual Container */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#161a26]">
                  <img
                    src={movie.backdropUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover object-center filter brightness-80 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121520] via-transparent to-black/30" />

                  {/* AI Match Badge (Pill with pulsing dot) */}
                  <div className="absolute top-3 left-3">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#06b6d4]/15 backdrop-blur-md border border-[#06b6d4]/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6] animate-ping" />
                      <span className="text-[10px] font-mono font-bold tracking-wider text-[#4cd7f6]">
                        {movie.matchScore}% MATCH
                      </span>
                    </div>
                  </div>

                  {/* Feedback thumbs */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                    <button
                      onClick={e => handleFeedback(movie.id, 'liked', e)}
                      className={`p-1.5 rounded-md backdrop-blur-md transition-all cursor-pointer ${
                        feedback === 'liked'
                          ? 'bg-[#4cd7f6] text-[#003640] shadow-[0_0_10px_#4cd7f6]'
                          : 'bg-black/50 text-[#bcc9cd] hover:text-white border border-white/20'
                      }`}
                      title="More recommendations like this"
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={e => handleFeedback(movie.id, 'disliked', e)}
                      className="p-1.5 rounded-md backdrop-blur-md bg-black/50 text-[#bcc9cd] hover:text-[#ffb4ab] border border-white/20 transition-all cursor-pointer"
                      title="Hide from queue"
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Watch Trailer overlay button */}
                  <button
                    onClick={() => onPlayTrailer(movie)}
                    className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-black/70 hover:bg-[#4cd7f6] hover:text-[#003640] text-white backdrop-blur-md border border-white/20 hover:border-[#4cd7f6] text-xs font-mono font-medium transition-all cursor-pointer shadow-lg"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Trailer</span>
                  </button>

                  {/* Quick Watchlist toggle */}
                  <button
                    onClick={() => onToggleWatchlist(movie)}
                    className={`absolute top-3 right-3 p-1.5 rounded-md backdrop-blur-md transition-all cursor-pointer ${
                      isSaved
                        ? 'bg-[#8b5cf6] text-white shadow-[0_0_12px_#8b5cf6]'
                        : 'bg-black/50 text-[#bcc9cd] hover:text-white border border-white/20'
                    }`}
                    title={isSaved ? 'In Watchlist' : 'Add to Watchlist'}
                  >
                    {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      {/* Rating Chip */}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#f59e0b] font-mono font-bold">
                        <Star className="w-3 h-3 fill-[#f59e0b]" />
                        {movie.rating}
                      </span>

                      {/* Runtime chip */}
                      <span className="font-mono text-[11px] text-[#869397]">
                        {movie.durationMinutes} MIN · {movie.year}
                      </span>

                      {movie.audioTracks && movie.audioTracks.length > 0 && (
                        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#06b6d4]/10 text-[#4cd7f6] uppercase font-bold border border-[#06b6d4]/20">
                          {movie.audioTracks.slice(0, 3).join('/')}
                        </span>
                      )}
                    </div>

                    <h4 
                      onClick={() => onSelectMovie(movie)}
                      className="font-display text-xl font-bold text-white hover:text-[#4cd7f6] transition-colors cursor-pointer"
                    >
                      {movie.title}
                    </h4>

                    <p className="text-xs text-[#bcc9cd] line-clamp-2 leading-relaxed">
                      {movie.synopsis}
                    </p>
                  </div>

                  {/* Streaming & Inspect CTA */}
                  <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#869397]">
                      <Tv className="w-3 h-3 text-[#4cd7f6]" />
                      <span>{movie.streamProviders?.[0] || 'Streaming info unavailable'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onMoreLikeThis(movie)}
                        className="text-[11px] font-mono text-[#869397] hover:text-[#4cd7f6] transition-colors flex items-center gap-1 cursor-pointer"
                        title="Tune vectors around this movie"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Tune</span>
                      </button>

                      <button
                        onClick={() => onSelectMovie(movie)}
                        className="text-xs font-mono text-[#4cd7f6] hover:text-white transition-colors flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <span>Dossier</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Theatrical Key 2:3 Poster Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayMovies.map(movie => {
            const isSaved = watchlist.includes(movie.id);

            return (
              <div
                key={movie.id}
                onClick={() => onSelectMovie(movie)}
                className="group relative rounded-xl bg-[#121520] border border-white/[0.06] hover:border-[#06b6d4]/40 transition-all duration-300 hover:shadow-[0_0_25px_rgba(6,182,212,0.2)] overflow-hidden cursor-pointer flex flex-col"
              >
                {/* 2:3 Poster Frame */}
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#161a26]">
                  <img
                    src={movie.posterUrl}
                    alt={`${movie.title} official movie poster`}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121520] via-transparent to-black/30" />

                  {/* Top Match Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#06b6d4]/80 text-[#003640] shadow">
                      {movie.matchScore}%
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[11px] font-mono text-[#f59e0b] bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
                    <Star className="w-3 h-3 fill-[#f59e0b]" />
                    <span>{movie.rating}</span>
                  </div>
                </div>

                <div className="p-3 space-y-1">
                  <h4 className="font-display text-sm font-bold text-white truncate group-hover:text-[#4cd7f6] transition-colors">
                    {movie.title}
                  </h4>
                  <p className="text-[11px] font-mono text-[#869397]">
                    {movie.year} · {movie.durationMinutes}m
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

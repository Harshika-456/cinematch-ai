import React, { useEffect, useState } from 'react';
import { X, Play, Bookmark, BookmarkCheck, Star, Clock, Sparkles, Film, Tv, Share2, Award } from 'lucide-react';
import { Movie } from '../data/movies';
import { getMovieDetails } from '../services/tmdbService';

interface MovieDetailsModalProps {
  movie: Movie | null;
  onClose: () => void;
  onPlayTrailer: (movie: Movie) => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (movie: Movie) => void;
}

export const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({
  movie,
  onClose,
  onPlayTrailer,
  isWatchlisted,
  onToggleWatchlist
}) => {
  const [fullMovie, setFullMovie] = useState<Movie | null>(movie);

  useEffect(() => {
    setFullMovie(movie);
    if (!movie?.tmdbId) return;

    let cancelled = false;
    getMovieDetails(movie.tmdbId)
      .then(details => { if (!cancelled) setFullMovie(details); })
      .catch(error => console.error('TMDB details load failed:', error));

    return () => { cancelled = true; };
  }, [movie]);

  if (!fullMovie) return null;
  movie = fullMovie;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fadeIn overflow-y-auto">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#111319] rounded-2xl border border-white/[0.1] shadow-[0_0_60px_rgba(6,182,212,0.2)] z-10 my-auto text-[#e2e2eb]">
        {/* Hero Backdrop with Gradient Overlay */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-[#161a26]">
          <img
            src={movie.backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover object-center filter brightness-75 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111319] via-[#111319]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#111319] via-[#111319]/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer z-20"
          >
            <X className="w-4 h-4" />
          </button>

          {/* AI Match Badge Pill */}
          <div className="absolute top-4 left-4 z-20">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#06b6d4]/15 backdrop-blur-md border border-[#06b6d4]/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-ping" />
              <span className="text-[11px] font-mono font-bold tracking-widest text-[#4cd7f6]">
                {movie.matchScore}% NEURAL MATCH
              </span>
            </div>
          </div>

          {/* Hero Bottom Content inside backdrop */}
          <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {movie.awardBadges?.map(badge => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#f59e0b]/20 border border-[#f59e0b]/40 text-[#ffb95f]"
                >
                  <Award className="w-3 h-3" />
                  {badge}
                </span>
              ))}
            </div>

            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">
              {movie.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#4cd7f6] font-mono tracking-wide italic mt-1">
              &ldquo;{movie.tagline}&rdquo;
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Metadata bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
              {/* Amber Rating chip */}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#f59e0b] font-mono font-bold">
                <Star className="w-3.5 h-3.5 fill-[#f59e0b]" />
                {movie.rating} IMDB
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#e11d48]/10 border border-[#e11d48]/30 text-[#fb7185] font-mono font-bold">
                {movie.rottenTomatoes}% RT
              </span>

              {/* Monospaced Runtime and Specs Chips */}
              <span className="px-2.5 py-1 rounded bg-[#1e2230] border border-white/[0.06] text-[#bcc9cd] font-mono text-[11px]">
                {movie.durationMinutes} MIN
              </span>

              {(movie.audioFormats || []).map(fmt => (
                <span
                  key={fmt}
                  className="px-2 py-1 rounded bg-[#161a26] border border-white/[0.05] text-[#869397] font-mono text-[10px] tracking-wider"
                >
                  {fmt}
                </span>
              ))}

              {movie.audioTracks && movie.audioTracks.length > 0 && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#06b6d4]/10 border border-[#06b6d4]/25">
                  <span className="text-[10px] font-mono text-[#869397]">AUDIO:</span>
                  <span className="text-[10px] font-mono text-[#4cd7f6] font-bold uppercase">
                    {movie.audioTracks.join(' • ')}
                  </span>
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPlayTrailer(movie)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#4cd7f6] hover:bg-[#38bdf8] text-[#003640] font-display font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(76,215,246,0.4)] cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Trailer</span>
              </button>

              <button
                onClick={() => onToggleWatchlist(movie)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-mono text-xs border transition-all cursor-pointer ${
                  isWatchlisted
                    ? 'bg-[#8b5cf6]/20 border-[#8b5cf6] text-[#d0bcff]'
                    : 'bg-[#191b22] border-white/10 text-[#bcc9cd] hover:text-white'
                }`}
              >
                {isWatchlisted ? (
                  <>
                    <BookmarkCheck className="w-3.5 h-3.5 text-[#d0bcff]" />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Watchlist</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Grid Layout: Left Details, Right Neural Cluster */}
          <div className="grid grid-cols-1 gap-6">
            {/* Left Column (7 cols) */}
            <div className="space-y-5">
              {/* Algorithmic Fit Breakdown */}
              <div className="p-4 rounded-xl bg-[#131926] border border-[#06b6d4]/30 shadow-[0_0_20px_-6px_rgba(6,182,212,0.2)] space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono text-[#4cd7f6] font-semibold tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Algorithmic Fit Rationale</span>
                </div>
                <p className="text-xs text-[#bcc9cd] leading-relaxed">
                  {movie.aiHypothesisMatch}
                </p>
              </div>

              {/* Synopsis */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-mono tracking-widest text-[#869397] uppercase">
                  Synopsis
                </h4>
                <p className="text-sm text-[#e2e2eb] leading-relaxed">
                  {movie.synopsis}
                </p>
              </div>

              {/* Cast & Director */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-[#869397] block uppercase text-[10px] tracking-wider mb-1">
                      Director
                    </span>
                    <span className="text-white font-medium">{movie.director}</span>
                  </div>
                  <div>
                    <span className="text-[#869397] block uppercase text-[10px] tracking-wider mb-1">
                      Key Cast
                    </span>
                    <span className="text-white font-medium">{(movie.cast || []).join(', ')}</span>
                  </div>
                </div>

                {movie.castProfiles && movie.castProfiles.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto pb-1">
                    {movie.castProfiles.map(actor => (
                      <div key={actor.name} className="w-16 shrink-0 text-center">
                        <div className="w-14 h-14 mx-auto rounded-full overflow-hidden bg-[#1b1f2b] border border-white/[0.08]">
                          {actor.imageUrl ? (
                            <img src={actor.imageUrl} alt={actor.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-[#717b8c]">N/A</div>
                          )}
                        </div>
                        <span className="block mt-1 text-[9px] text-[#bcc9cd] leading-tight line-clamp-2">{actor.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Streaming Channels */}
              <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-xs font-mono text-[#869397]">
                  <Tv className="w-3.5 h-3.5" />
                  <span>Where to Stream</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(movie.streamProviders || []).map(prov => (
                    <span
                      key={prov}
                      className="px-3 py-1 rounded-md bg-[#191b22] border border-white/[0.08] text-xs font-medium text-white"
                    >
                      {prov}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
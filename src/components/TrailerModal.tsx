import React from 'react';
import { X, ExternalLink, Play, Film } from 'lucide-react';
import { Movie } from '../data/movies';

interface TrailerModalProps {
  movie: Movie | null;
  onClose: () => void;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({ movie, onClose }) => {
  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-[#121520] rounded-xl border border-[#06b6d4]/30 shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden z-10">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#161a26] border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#06b6d4] animate-ping" />
            <Film className="w-4 h-4 text-[#4cd7f6]" />
            <span className="font-display font-bold text-white text-sm sm:text-base">
              {movie.title} <span className="text-[#869397] font-normal">({movie.year})</span>
            </span>
            <span className="hidden sm:inline text-xs font-mono text-[#06b6d4] bg-[#06b6d4]/10 px-2 py-0.5 rounded border border-[#06b6d4]/20">
              OFFICIAL THEATRICAL TRAILER
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1f2433] hover:bg-[#282f42] text-[#bcc9cd] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Embed */}
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${movie.trailerYoutubeId}?autoplay=1&rel=0&modestbranding=1`}
            title={`${movie.title} Official Trailer`}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#141722] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <p className="text-white font-medium">{movie.tagline}</p>
            <p className="text-[#869397]">
              Director: <span className="text-[#bcc9cd]">{movie.director}</span> · Starring: {(movie.cast || []).slice(0, 3).join(', ')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://www.youtube.com/watch?v=${movie.trailerYoutubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1f2433] hover:bg-[#282f42] text-[#4cd7f6] font-mono text-xs border border-[#4cd7f6]/30 transition-colors"
            >
              <span>Watch on YouTube</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
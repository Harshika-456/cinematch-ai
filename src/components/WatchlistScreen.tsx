import React, { useState } from 'react';
import { 
  Bookmark, 
  Play, 
  Trash2, 
  ArrowLeft, 
  Star, 
  Film, 
  Sparkles, 
  Clock, 
  Tv, 
  Copy, 
  Check, 
  FileText, 
  Download, 
  X,
  Share2
} from 'lucide-react';
import { Movie } from '../data/movies';
import { formatWatchlistToMarkdown, copyTextToClipboard } from '../utils/exportMarkdown';

interface WatchlistScreenProps {
  watchlistIds: string[];
  allMovies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onPlayTrailer: (movie: Movie) => void;
  onRemoveFromWatchlist: (movieId: string) => void;
  onClearWatchlist: () => void;
  onBackToQueue: () => void;
}

export const WatchlistScreen: React.FC<WatchlistScreenProps> = ({
  watchlistIds,
  allMovies,
  onSelectMovie,
  onPlayTrailer,
  onRemoveFromWatchlist,
  onClearWatchlist,
  onBackToQueue
}) => {
  const [copied, setCopied] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const watchlistedMovies = allMovies.filter(m => watchlistIds.includes(m.id));
  const totalMinutes = watchlistedMovies.reduce((acc, m) => acc + m.durationMinutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remMinutes = totalMinutes % 60;

  const markdownString = formatWatchlistToMarkdown(watchlistedMovies);

  const handleCopyMarkdown = async () => {
    const success = await copyTextToClipboard(markdownString);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdownString], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CineMatch_Watchlist_${new Date().toISOString().slice(0, 10)}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToQueue}
            className="w-8 h-8 rounded-lg bg-[#191b22] hover:bg-[#282a30] text-[#bcc9cd] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
              Saved Watchlist
              <span className="text-xs font-mono text-[#d0bcff] px-2 py-0.5 rounded-full bg-[#8b5cf6]/20 border border-[#8b5cf6]/40">
                {watchlistedMovies.length} FILMS
              </span>
            </h2>
            <p className="text-xs text-[#869397] font-mono mt-0.5">
              Cumulative Runtime: {totalHours}h {remMinutes}m · Saved Neural Vector Matches
            </p>
          </div>
        </div>

        {/* Action Buttons: Copy Markdown & Clear */}
        <div className="flex flex-wrap items-center gap-2">
          {watchlistedMovies.length > 0 && (
            <>
              {/* Copy Markdown Button */}
              <button
                onClick={handleCopyMarkdown}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  copied
                    ? 'bg-[#10b981]/20 border border-[#10b981] text-[#34d399] shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'bg-[#06b6d4]/15 hover:bg-[#06b6d4]/25 border border-[#06b6d4]/40 text-[#4cd7f6] shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]'
                }`}
                title="Copy Watchlist as Shareable Markdown"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#34d399]" />
                    <span>Markdown Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#4cd7f6]" />
                    <span>Copy Markdown List</span>
                  </>
                )}
              </button>

              {/* View / Download Markdown Preview Modal */}
              <button
                onClick={() => setShowPreviewModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-[#bcc9cd] hover:text-white bg-[#191b22] hover:bg-[#282a30] border border-white/[0.08] transition-all cursor-pointer"
                title="Preview Markdown Source"
              >
                <FileText className="w-3.5 h-3.5 text-[#d0bcff]" />
                <span className="hidden sm:inline">Preview .MD</span>
              </button>

              {/* Clear Watchlist */}
              <button
                onClick={onClearWatchlist}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-[#ffb4ab] bg-[#93000a]/20 hover:bg-[#93000a]/40 border border-[#ffb4ab]/20 transition-colors cursor-pointer"
                title="Clear all saved films"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Empty State */}
      {watchlistedMovies.length === 0 ? (
        <div className="text-center py-20 p-8 rounded-2xl bg-[#121520]/60 border border-white/[0.06] space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-[#191b24] border border-white/10 flex items-center justify-center mx-auto text-[#717b8c]">
            <Bookmark className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display text-lg font-bold text-white">Your Watchlist is Empty</h3>
            <p className="text-xs text-[#869397]">
              Browse the neural recommendation queue and save films to watch later or export as markdown.
            </p>
          </div>
          <button
            onClick={onBackToQueue}
            className="px-4 py-2 rounded-lg bg-[#4cd7f6] hover:bg-[#38bdf8] text-[#003640] font-display font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(76,215,246,0.3)] cursor-pointer"
          >
            Explore Recommendations
          </button>
        </div>
      ) : (
        /* List of Saved Movies */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {watchlistedMovies.map(movie => (
            <div
              key={movie.id}
              className="p-4 rounded-xl bg-[#121520] border border-white/[0.06] hover:border-[#8b5cf6]/40 transition-all flex gap-4 group"
            >
              {/* Poster thumbnail */}
              <div
                onClick={() => onSelectMovie(movie)}
                className="w-24 sm:w-28 shrink-0 aspect-[2/3] rounded-lg overflow-hidden bg-[#161a26] relative cursor-pointer"
              >
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute top-1 left-1 bg-black/70 px-1 rounded text-[9px] font-mono text-[#f59e0b]">
                  ★ {movie.rating}
                </div>
              </div>

              {/* Movie info */}
              <div className="flex-1 flex flex-col justify-between py-0.5">
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4
                      onClick={() => onSelectMovie(movie)}
                      className="font-display text-base font-bold text-white hover:text-[#4cd7f6] transition-colors cursor-pointer"
                    >
                      {movie.title}
                    </h4>
                    <button
                      onClick={() => onRemoveFromWatchlist(movie.id)}
                      className="text-[#717b8c] hover:text-[#ffb4ab] p-1 transition-colors cursor-pointer"
                      title="Remove from Watchlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] font-mono text-[#869397]">
                    {movie.year} · {movie.durationMinutes} min · {movie.director}
                  </p>

                  <p className="text-xs text-[#bcc9cd] line-clamp-2 mt-1">
                    {movie.synopsis}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-white/[0.04]">
                  <button
                    onClick={() => onPlayTrailer(movie)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#191b24] hover:bg-[#282a34] text-xs font-mono text-[#4cd7f6] border border-[#06b6d4]/30 transition-colors cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Trailer</span>
                  </button>

                  <button
                    onClick={() => onSelectMovie(movie)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#191b24] hover:bg-[#282a34] text-xs font-mono text-[#bcc9cd] hover:text-white border border-white/[0.06] transition-colors cursor-pointer"
                  >
                    <span>Dossier</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Markdown Preview & Export Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
          <div className="absolute inset-0" onClick={() => setShowPreviewModal(false)} />

          <div className="relative w-full max-w-3xl bg-[#111319] rounded-2xl border border-[#06b6d4]/40 shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden z-10 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#161a26] border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#4cd7f6]" />
                <span className="font-display font-bold text-white text-sm sm:text-base">
                  Shareable Markdown Watchlist
                </span>
                <span className="text-[10px] font-mono text-[#06b6d4] bg-[#06b6d4]/10 px-2 py-0.5 rounded border border-[#06b6d4]/20">
                  {watchlistedMovies.length} FILMS FORMATTED
                </span>
              </div>

              <button
                onClick={() => setShowPreviewModal(false)}
                className="w-8 h-8 rounded-lg bg-[#1f2433] hover:bg-[#282f42] text-[#bcc9cd] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Markdown Textarea Preview */}
            <div className="p-4 sm:p-5 flex-1 overflow-y-auto bg-[#0a0c10]">
              <textarea
                readOnly
                value={markdownString}
                className="w-full h-80 sm:h-96 p-4 rounded-xl bg-[#0f1118] border border-white/[0.08] text-xs font-mono text-[#bcc9cd] selection:bg-[#4cd7f6]/30 outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Modal Footer Controls */}
            <div className="px-5 py-3.5 bg-[#141722] border-t border-white/[0.08] flex items-center justify-between gap-3">
              <span className="text-xs font-mono text-[#869397]">
                Ready to paste into GitHub, Notion, Discord, or notes.
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadMarkdown}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#191b22] hover:bg-[#282a30] text-[#bcc9cd] hover:text-white font-mono text-xs border border-white/[0.08] transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .md</span>
                </button>

                <button
                  onClick={handleCopyMarkdown}
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer ${
                    copied
                      ? 'bg-[#10b981] text-[#003640] shadow-[0_0_15px_#10b981]'
                      : 'bg-[#4cd7f6] hover:bg-[#38bdf8] text-[#003640] shadow-[0_0_15px_rgba(76,215,246,0.3)]'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Markdown</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

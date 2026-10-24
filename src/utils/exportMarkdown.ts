import { Movie } from '../data/movies';

/**
 * Formats a list of movies into a clean, shareable markdown document
 */
export function formatWatchlistToMarkdown(movies: Movie[]): string {
  if (movies.length === 0) {
    return '# 🎬 CineMatch AI — Watchlist\n\n*No films currently saved in watchlist.*';
  }

  const totalMinutes = movies.reduce((acc, m) => acc + m.durationMinutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remMinutes = totalMinutes % 60;
  const timestamp = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const lines: string[] = [
    '# 🎬 CineMatch AI — Curated Watchlist',
    `> **Synthesized via CineMatch AI Neural Engine** · Generated on ${timestamp}`,
    `> **Total Runtime**: ${totalHours}h ${remMinutes}m (${totalMinutes} mins) · **Selected**: ${movies.length} films`,
    '',
    '---',
    ''
  ];

  movies.forEach((movie, index) => {
    lines.push(`### ${index + 1}. **${movie.title}** (${movie.year})`);
    lines.push(`- **Neural Match**: \`${movie.matchScore}% Match\``);
    lines.push(`- **Ratings**: ★ ${movie.rating} IMDb · ${movie.rottenTomatoes}% Rotten Tomatoes`);
    lines.push(`- **Runtime**: ${movie.durationMinutes} min`);
    lines.push(`- **Director**: ${movie.director}`);
    lines.push(`- **Genres**: ${(movie.genres || []).join(', ')}`);
    lines.push(`- **Starring**: ${(movie.cast || []).slice(0, 3).join(', ')}`);
    lines.push(`- **Where to Stream**: ${(movie.streamProviders || []).join(', ')}`);
    if (movie.tagline) {
      lines.push(`- **Tagline**: *"${movie.tagline}"*`);
    }
    lines.push(`- **Synopsis**: ${movie.synopsis}`);
    lines.push(`- **Algorithmic Fit**: ${movie.aiHypothesisMatch}`);
    lines.push('');
  });

  lines.push('---');
  lines.push('*Curated with [CineMatch AI](https://github.com) — Avant-Garde Cinema Intelligence Hub*');

  return lines.join('\n');
}

/**
 * Robust copy helper that handles iframe constraints
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('Standard clipboard API failed, attempting fallback textarea copy:', err);
  }

  // Fallback for strict iframe permissions
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (fallbackErr) {
    console.error('All clipboard copy attempts failed:', fallbackErr);
    return false;
  }
}
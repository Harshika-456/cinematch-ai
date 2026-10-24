const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export function getTmdbPosterUrl(path?: string | null, size: 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500') {
  return path ? `${TMDB_IMAGE_BASE}/${size}${path}` : '';
}

export function getTmdbBackdropUrl(path?: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280') {
  return path ? `${TMDB_IMAGE_BASE}/${size}${path}` : '';
}

export function getTmdbProfileUrl(path?: string | null, size: 'w185' | 'w342' | 'original' = 'w185') {
  return path ? `${TMDB_IMAGE_BASE}/${size}${path}` : '';
}

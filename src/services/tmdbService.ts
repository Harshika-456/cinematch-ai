import { Movie } from '../data/movies';

export interface TmdbSearchResponse {
  page: number;
  total_pages: number;
  total_results: number;
  results: Movie[];
}

export async function searchMovies(query: string): Promise<TmdbSearchResponse> {
  const q = query.trim();
  if (!q) return { page: 1, total_pages: 0, total_results: 0, results: [] };

  const response = await fetch(`/api/movies/search?query=${encodeURIComponent(q)}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || 'Movie search failed');
  }

  return data;
}

export async function getMovieDetails(tmdbId: number): Promise<Movie> {
  const response = await fetch(`/api/movies/${tmdbId}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || 'Could not load movie details');
  }

  return data.movie;
}

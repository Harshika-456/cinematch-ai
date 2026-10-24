import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '5mb' }));

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const V3_MODEL_PATH = path.resolve(
  __dirname,
  'models',
  'cinematch_recommender_v3_2.joblib'
);

const ENGINE_VERSION = '3.2';
const ENGINE_NAME = 'CineMatch V3.2';

// ============================================================
// TMDB AUTH
// ============================================================

function getTmdbAccessToken(): string | null {
  const token = process.env.TMDB_ACCESS_TOKEN?.trim();
  return token || null;
}

function getTmdbApiKey(): string | null {
  const key = process.env.TMDB_API_KEY?.trim();
  return key || null;
}

function isTmdbConfigured(): boolean {
  return Boolean(getTmdbAccessToken() || getTmdbApiKey());
}

function requireTmdbAuth(res: Response): boolean {
  if (!isTmdbConfigured()) {
    res.status(503).json({
      success: false,
      error:
        'TMDB is not configured. Add TMDB_ACCESS_TOKEN or TMDB_API_KEY to your .env file and restart the server.'
    });

    return false;
  }

  return true;
}

// ============================================================
// TMDB FETCH
// ============================================================

async function tmdbFetch(
  endpoint: string,
  params: Record<string, string | number | undefined> = {}
) {
  const accessToken = getTmdbAccessToken();
  const apiKey = getTmdbApiKey();

  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);

  if (!accessToken && apiKey) {
    url.searchParams.set('api_key', apiKey);
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  const headers: Record<string, string> = {
    accept: 'application/json'
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`TMDB request failed (${response.status}): ${body}`);
  }

  return response.json();
}

// ============================================================
// NEURAL METRICS
// ============================================================

function makeNeuralMetrics() {
  return {
    atmosphericDread: 70,
    visualSymmetry: 80,
    existentialDepth: 75,
    philosophicalResonance: 75,
    pacingVelocity: 80,
    collectiveMomentum: 80,
    speculativeIndex: 70
  };
}

// ============================================================
// TMDB MOVIE MAPPER
// ============================================================

function mapTmdbMovie(movie: any) {
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '';

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : posterUrl;

  return {
    id: `tmdb-${movie.id}`,
    tmdbId: movie.id,
    title: movie.title || movie.original_title || 'Untitled',
    year: Number((movie.release_date || '').slice(0, 4)) || 0,
    durationMinutes: Number(movie.runtime || 0),
    rating: Number(movie.vote_average || 0),
    rottenTomatoes: 0,
    director: movie.director || 'Unknown',
    cast: movie.cast || [],
    castProfiles: movie.castProfiles || [],
    genres:
      movie.genres?.map((g: any) => g.name) ||
      movie.genre_names ||
      [],
    narrativeVectors: movie.narrativeVectors || [],
    moodResonances: movie.moodResonances || [],
    socialFit: movie.socialFit || [
      'solo',
      'friends',
      'partner',
      'family'
    ],
    language: (
      movie.original_language ||
      movie.language ||
      'unknown'
    ).toUpperCase(),
    tagline: movie.tagline || '',
    synopsis: movie.overview || movie.synopsis || 'No synopsis available.',
    aiHypothesisMatch: movie.aiHypothesisMatch || 'Live TMDB result.',
    matchScore: Number(movie.matchScore || 0),
    neuralMetrics: movie.neuralMetrics || makeNeuralMetrics(),
    posterUrl,
    backdropUrl,
    trailerYoutubeId: movie.trailerYoutubeId || '',
    streamProviders: movie.streamProviders || [],
    audioFormats: movie.audioFormats || [],
    audioTracks: movie.audioTracks || [],
    awardBadges: movie.awardBadges || [],
    source: movie.source || 'tmdb'
  };
}

// ============================================================
// HYDRATE PYTHON RECOMMENDATION WITH TMDB
// ============================================================

async function hydrateRecommendationWithTmdb(movie: any) {
  const tmdbId = Number(
    movie?.tmdbId ||
    String(movie?.id || '').replace('tmdb-', '')
  );

  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    return {
      ...movie,
      source: movie?.source || 'python-neural-engine-v3.2'
    };
  }

  try {
    const detail = await tmdbFetch(`/movie/${tmdbId}`, {
      language: 'en-US',
      append_to_response: 'credits,videos,watch/providers'
    });

    const credits = detail.credits || {};

    const director =
      credits.crew?.find(
        (person: any) => person.job === 'Director'
      )?.name ||
      movie.director ||
      'Unknown';

    const castPeople = (credits.cast || []).slice(0, 8);

    const cast = castPeople.map((person: any) => person.name);

    const castProfiles = castPeople.map((person: any) => ({
      name: person.name,
      imageUrl: person.profile_path
        ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
        : ''
    }));

    const videos = detail.videos?.results || [];

    const trailer =
      videos.find(
        (video: any) =>
          video.site === 'YouTube' &&
          video.type === 'Trailer' &&
          video.official
      ) ||
      videos.find(
        (video: any) =>
          video.site === 'YouTube' &&
          video.type === 'Trailer'
      );

    const india = detail['watch/providers']?.results?.IN || {};

    const providers = [
      ...(india.flatrate || []),
      ...(india.rent || []),
      ...(india.buy || [])
    ].map((provider: any) => provider.provider_name);

    const uniqueProviders = [...new Set(providers)] as string[];

    return {
      ...movie,
      id: `tmdb-${detail.id}`,
      tmdbId: detail.id,
      title: detail.title || detail.original_title || movie.title,
      year:
        Number((detail.release_date || '').slice(0, 4)) ||
        movie.year ||
        0,
      durationMinutes: Number(
        detail.runtime || movie.durationMinutes || 0
      ),
      rating: Number(
        detail.vote_average || movie.rating || 0
      ),
      director,
      cast,
      castProfiles,
      genres: (detail.genres || []).map((g: any) => g.name),
      language: (
        detail.original_language ||
        movie.language ||
        'unknown'
      ).toUpperCase(),
      tagline: detail.tagline || '',
      synopsis:
        detail.overview ||
        movie.synopsis ||
        'No synopsis available.',
      posterUrl: detail.poster_path
        ? `https://image.tmdb.org/t/p/w500${detail.poster_path}`
        : movie.posterUrl || '',
      backdropUrl: detail.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${detail.backdrop_path}`
        : detail.poster_path
          ? `https://image.tmdb.org/t/p/w500${detail.poster_path}`
          : movie.backdropUrl || '',
      trailerYoutubeId: trailer?.key || movie.trailerYoutubeId || '',
      streamProviders: uniqueProviders,
      source: 'tmdb-authoritative'
    };
  } catch (error) {
    console.warn(
      `Could not hydrate TMDB movie ${tmdbId}; keeping recommendation metadata.`
    );

    console.warn(error);
    return movie;
  }
}

// ============================================================
// MOVIE SEARCH
// ============================================================

app.get('/api/movies/search', async (req: Request, res: Response) => {
  if (!requireTmdbAuth(res)) return;

  const query = String(req.query.query || '').trim();

  if (!query) {
    return res.status(400).json({
      success: false,
      error: 'query is required'
    });
  }

  try {
    const data = await tmdbFetch('/search/movie', {
      query,
      include_adult: 'false',
      language: 'en-US',
      page: Number(req.query.page || 1)
    });

    const results = (data.results || []).map((movie: any) =>
      mapTmdbMovie(movie)
    );

    return res.json({
      success: true,
      source: 'tmdb',
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results,
      results
    });
  } catch (error: any) {
    console.error('TMDB search error:', error);

    return res.status(502).json({
      success: false,
      error: error?.message || 'TMDB search failed'
    });
  }
});

// ============================================================
// FULL MOVIE DOSSIER
// ============================================================

app.get('/api/movies/:id', async (req: Request, res: Response) => {
  if (!requireTmdbAuth(res)) return;

  const tmdbId = Number(req.params.id);

  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid TMDB movie id'
    });
  }

  try {
    const [movie, credits, videos, providers] = await Promise.all([
      tmdbFetch(`/movie/${tmdbId}`, { language: 'en-US' }),
      tmdbFetch(`/movie/${tmdbId}/credits`, { language: 'en-US' }),
      tmdbFetch(`/movie/${tmdbId}/videos`, { language: 'en-US' }),
      tmdbFetch(`/movie/${tmdbId}/watch/providers`)
    ]);

    const director =
      credits.crew?.find(
        (person: any) => person.job === 'Director'
      )?.name || 'Unknown';

    const castPeople = (credits.cast || []).slice(0, 8);

    const cast = castPeople.map((person: any) => person.name);

    const castProfiles = castPeople.map((person: any) => ({
      name: person.name,
      imageUrl: person.profile_path
        ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
        : ''
    }));

    const trailer =
      (videos.results || []).find(
        (video: any) =>
          video.site === 'YouTube' &&
          video.type === 'Trailer' &&
          video.official
      ) ||
      (videos.results || []).find(
        (video: any) =>
          video.site === 'YouTube' &&
          video.type === 'Trailer'
      );

    const india = providers.results?.IN || {};

    const streamProviders = [
      ...(india.flatrate || []),
      ...(india.rent || []),
      ...(india.buy || [])
    ].map((provider: any) => provider.provider_name);

    const uniqueProviders = [...new Set(streamProviders)] as string[];

    const result = mapTmdbMovie({
      ...movie,
      director,
      cast,
      castProfiles,
      trailerYoutubeId: trailer?.key || '',
      streamProviders: uniqueProviders
    });

    return res.json({
      success: true,
      source: 'tmdb',
      movie: result
    });
  } catch (error: any) {
    console.error('TMDB details error:', error);

    return res.status(502).json({
      success: false,
      error: error?.message || 'TMDB details failed'
    });
  }
});

// ============================================================
// MODEL STATUS — V3.2
// ============================================================

app.get('/api/model-status', (_req: Request, res: Response) => {
  const trained = fs.existsSync(V3_MODEL_PATH);

  return res.json({
    success: true,
    trained,
    model: `${ENGINE_NAME} TF-IDF weighted-feature recommender`,
    modelVersion: ENGINE_VERSION,
    modelPath: V3_MODEL_PATH,
    trainingCommand: 'python training/train_recommender_v3_2.py'
  });
});

// ============================================================
// HEALTH — V3.2
// ============================================================

app.get('/api/health', (_req: Request, res: Response) => {
  const trained = fs.existsSync(V3_MODEL_PATH);

  return res.json({
    status: 'ok',
    pythonEngine: 'Python 3.10.12',
    recommenderEngine: ENGINE_NAME,
    engineVersion: ENGINE_VERSION,
    trainedModel: trained,
    model: 'cinematch_recommender_v3_2.joblib',
    modelPath: V3_MODEL_PATH,
    tmdbConfigured: isTmdbConfigured(),
    tmdbAuthMethod: getTmdbAccessToken()
      ? 'Bearer Access Token'
      : getTmdbApiKey()
        ? 'API Key'
        : 'Not configured',
    timestamp: new Date().toISOString()
  });
});

// ============================================================
// PYTHON NEURAL ENGINE
// ============================================================

function executePythonOnce(payload: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonCommand =
      process.platform === 'win32' ? 'python' : 'python3';

    const pythonProcess = spawn(
      pythonCommand,
      [path.resolve(__dirname, 'neural_engine.py')],
      { cwd: __dirname }
    );

    let stdoutData = '';
    let stderrData = '';

    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    pythonProcess.on('error', (error) => {
      reject(
        new Error(
          `Failed to start Python engine: ${error.message}`
        )
      );
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python engine exited with code:', code);
        console.error(stderrData);

        return reject(
          new Error(
            stderrData || `Python exited with code ${code}`
          )
        );
      }

      try {
        const parsed = JSON.parse(stdoutData.trim());
        resolve(parsed);
      } catch (error) {
        console.error('Python raw stdout:', stdoutData);

        reject(
          new Error(`Failed to parse Python output: ${error}`)
        );
      }
    });

    pythonProcess.stdin.write(JSON.stringify(payload));
    pythonProcess.stdin.end();
  });
}

// ============================================================
// HYDRATE RECOMMENDATION LIST
// ============================================================

async function hydrateRecommendations(recommendations: any[]) {
  if (!isTmdbConfigured()) {
    console.warn(
      'TMDB not configured. Returning Python recommendation metadata without hydration.'
    );

    return (recommendations || []).slice(0, 12);
  }

  return Promise.all(
    (recommendations || [])
      .slice(0, 12)
      .map((movie: any) => hydrateRecommendationWithTmdb(movie))
  );
}

// ============================================================
// PERSISTENT PYTHON WORKER (model loaded once)
// ============================================================

const PYTHON_REQUEST_TIMEOUT_MS = 120_000;
const PYTHON_START_TIMEOUT_MS = 180_000;

let pythonWorker: ChildProcessWithoutNullStreams | null = null;
let pythonWorkerReady: Promise<void> | null = null;
let pythonStdoutBuffer = '';
let pythonLineHandler: ((line: string) => void) | null = null;

function killPythonWorker() {
  if (pythonWorker) {
    pythonWorker.removeAllListeners();
    pythonWorker.stdout.removeAllListeners();
    pythonWorker.kill();
  }

  pythonWorker = null;
  pythonWorkerReady = null;
  pythonStdoutBuffer = '';
  pythonLineHandler = null;
}

function ensurePythonWorker(): Promise<void> {
  if (pythonWorker && pythonWorkerReady) return pythonWorkerReady;

  pythonWorkerReady = new Promise<void>((resolve, reject) => {
    const pythonCommand =
      process.platform === 'win32' ? 'python' : 'python3';

    const child = spawn(
      pythonCommand,
      [path.resolve(__dirname, 'neural_engine.py'), '--server'],
      { cwd: __dirname }
    );

    pythonWorker = child;
    pythonStdoutBuffer = '';

    const startTimer = setTimeout(() => {
      killPythonWorker();
      reject(new Error('Python worker did not become ready in time'));
    }, PYTHON_START_TIMEOUT_MS);

    pythonLineHandler = (line: string) => {
      try {
        if (JSON.parse(line)?.ready) {
          clearTimeout(startTimer);
          pythonLineHandler = null;
          console.log('Python V3.2 worker ready (model loaded once).');
          resolve();
        }
      } catch {
        console.warn('Python worker non-JSON output:', line);
      }
    };

    child.stdout.on('data', chunk => {
      pythonStdoutBuffer += chunk.toString('utf8');

      let newline: number;
      while ((newline = pythonStdoutBuffer.indexOf('\n')) >= 0) {
        const line = pythonStdoutBuffer.slice(0, newline).trim();
        pythonStdoutBuffer = pythonStdoutBuffer.slice(newline + 1);
        if (line && pythonLineHandler) pythonLineHandler(line);
      }
    });

    child.stderr.on('data', data => {
      process.stderr.write(`[python] ${data}`);
    });

    child.on('error', error => {
      clearTimeout(startTimer);
      killPythonWorker();
      reject(new Error(`Failed to start Python worker: ${error.message}`));
    });

    child.on('close', code => {
      clearTimeout(startTimer);
      console.warn(`Python worker exited (code ${code}).`);
      const handler = pythonLineHandler;
      killPythonWorker();
      if (handler) handler('{"__workerExit":true}');
      reject(new Error('Python worker exited before becoming ready'));
    });
  });

  // Avoid unhandled rejection noise; callers handle errors themselves.
  pythonWorkerReady.catch(() => {});

  return pythonWorkerReady;
}

function sendToPythonWorker(payload: any): Promise<any> {
  return ensurePythonWorker().then(
    () =>
      new Promise<any>((resolve, reject) => {
        const worker = pythonWorker;

        if (!worker) {
          return reject(new Error('Python worker is not running'));
        }

        const timer = setTimeout(() => {
          pythonLineHandler = null;
          killPythonWorker();
          reject(new Error('Python worker request timed out'));
        }, PYTHON_REQUEST_TIMEOUT_MS);

        pythonLineHandler = (line: string) => {
          clearTimeout(timer);
          pythonLineHandler = null;

          try {
            const parsed = JSON.parse(line);

            if (parsed?.__workerExit) {
              return reject(new Error('Python worker exited unexpectedly'));
            }

            resolve(parsed);
          } catch (error) {
            reject(new Error(`Failed to parse Python output: ${error}`));
          }
        };

        worker.stdin.write(JSON.stringify(payload) + '\n');
      })
  );
}

// Requests are processed one at a time by the single worker.
let pythonQueue: Promise<unknown> = Promise.resolve();

function executePythonNeuralEngine(payload: any): Promise<any> {
  const run = pythonQueue.then(() => sendToPythonWorker(payload));
  pythonQueue = run.catch(() => undefined);

  return run.catch(error => {
    console.warn(
      'Persistent Python worker failed; falling back to one-shot process:',
      error?.message || error
    );

    return executePythonOnce(payload);
  });
}

process.on('exit', () => {
  if (pythonWorker) pythonWorker.kill();
});

// ============================================================
// TMDB LIVE SEARCH FALLBACK
// Used ONLY when the local V3.2 model finds no movie at all
// (e.g. a very narrow combination such as Marathi + Animation).
// Results are real TMDB movies and are labelled as live search.
// ============================================================

const TMDB_GENRE_IDS: Record<string, number> = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  'sci-fi': 878,
  thriller: 53,
  war: 10752
};

const TMDB_GENRE_NAMES: Record<number, string> = Object.fromEntries(
  Object.entries(TMDB_GENRE_IDS).map(([name, id]) => [
    id,
    name === 'sci-fi'
      ? 'Sci-Fi'
      : name.charAt(0).toUpperCase() + name.slice(1)
  ])
);

const MOOD_GENRE_IDS: Record<string, number> = {
  romantic: 10749,
  funny: 35,
  scared: 27,
  excited: 28,
  emotional: 18
};

const TMDB_LANGUAGE_CODES: Record<string, string> = {
  english: 'en',
  en: 'en',
  hindi: 'hi',
  hi: 'hi',
  marathi: 'mr',
  mr: 'mr',
  tamil: 'ta',
  ta: 'ta',
  telugu: 'te',
  telgu: 'te',
  te: 'te',
  kannada: 'kn',
  kn: 'kn',
  odia: 'or',
  odisha: 'or',
  or: 'or'
};

function toStringArray(value: any): string[] {
  if (Array.isArray(value)) return value.map(v => String(v));
  if (value === undefined || value === null || value === '') return [];
  return [String(value)];
}

async function tmdbDiscoverFallback(calibration: any) {
  if (!isTmdbConfigured()) return null;

  const languageNames = [
    ...toStringArray(calibration?.audioLanguages),
    ...toStringArray(calibration?.audioLanguage)
  ].map(l => l.trim().toLowerCase());

  const languageCode = languageNames
    .map(l => TMDB_LANGUAGE_CODES[l])
    .find(Boolean);

  const selectedGenreIds = [
    ...new Set(
      toStringArray(calibration?.genres)
        .map(g => TMDB_GENRE_IDS[g.trim().toLowerCase()])
        .filter(Boolean)
    )
  ];

  const moodGenreIds = [
    ...new Set(
      toStringArray(calibration?.moods)
        .map(m => MOOD_GENRE_IDS[m.trim().toLowerCase()])
        .filter(Boolean)
    )
  ];

  const andGenreIds = [...new Set([...selectedGenreIds, ...moodGenreIds])];

  const ratingMin = Number(calibration?.ratingThreshold) || 0;
  const runtimeMax = Number(calibration?.maxDuration) || 0;

  type Tier = {
    note: string;
    genres: string;
    rating: number;
    runtime: number;
  };

  const tiers: Tier[] = [
    {
      note: 'matched your mood, genres, rating and duration',
      genres: andGenreIds.join(','),
      rating: ratingMin,
      runtime: runtimeMax
    },
    {
      note: 'matched your mood and genres (rating and duration relaxed)',
      genres: andGenreIds.join(','),
      rating: Math.min(ratingMin, 5.5),
      runtime: Math.max(runtimeMax, 180)
    },
    {
      note: 'matched at least one of your selected genres (other limits relaxed)',
      genres: selectedGenreIds.join('|'),
      rating: Math.min(ratingMin, 5.5),
      runtime: Math.max(runtimeMax, 180)
    },
    {
      note: 'matched your language and at least one selected genre (rating and duration ignored)',
      genres: selectedGenreIds.join('|'),
      rating: 0,
      runtime: 0
    }
  ];

  let best: { results: any[]; note: string } | null = null;

  for (const tier of tiers) {
    try {
      const data = await tmdbFetch('/discover/movie', {
        include_adult: 'false',
        language: 'en-US',
        sort_by: 'popularity.desc',
        with_genres: tier.genres || undefined,
        with_original_language: languageCode,
        'vote_average.gte': tier.rating > 0 ? tier.rating : undefined,
        'vote_count.gte': languageCode && languageCode !== 'en' ? 5 : 50,
        'with_runtime.lte': tier.runtime > 0 ? tier.runtime : undefined,
        page: 1
      });

      const results = (data.results || []).filter(
        (m: any) => m && m.id && m.poster_path
      );

      if (results.length > 0 && (!best || results.length > best.results.length)) {
        best = { results, note: tier.note };
      }

      if (results.length >= 5) break;
    } catch (error) {
      console.warn('TMDB discover fallback tier failed:', error);
    }
  }

  if (!best) return null;

  const mapped = best.results.slice(0, 12).map((m: any) =>
    mapTmdbMovie({
      ...m,
      genre_names: (m.genre_ids || [])
        .map((id: number) => TMDB_GENRE_NAMES[id])
        .filter(Boolean),
      source: 'tmdb-live-search'
    })
  );

  const hydrated = await Promise.all(
    mapped.map(async (movie: any) => {
      const detailed: any = await hydrateRecommendationWithTmdb(movie);

      return {
        ...detailed,
        source: 'tmdb-live-search',
        matchScore: Math.round(Number(detailed.rating || 0) * 10),
        aiHypothesisMatch:
          'Live TMDB search result (no match found in the local V3.2 dataset).'
      };
    })
  );

  const languageLabel = languageNames[0] || 'your language';

  return {
    movies: hydrated,
    note:
      `The local V3.2 model had few or no ${languageLabel} movies matching this exact combination, ` +
      `so live TMDB search results were added that ${best.note}.`
  };
}

// ============================================================
// SHARED PYTHON RECOMMENDATION RESPONSE
// ============================================================

async function runPythonRecommendations(
  calibration: any,
  customPrompt: any,
  startTime?: number
) {
  const pythonResult = await executePythonNeuralEngine({
    calibration,
    customPrompt
  });

  let hydratedRecommendations = await hydrateRecommendations(
    pythonResult.recommendations || []
  );

  let source = 'python-neural-engine-v3.2 + TMDB';
  let searchNote: string | undefined;

  // If the local model found nothing, or too few results actually match the
  // selected genres, add real movies from a live TMDB search.
  if (pythonResult.success !== false) {
    const normalizeGenre = (g: string) =>
      g.trim().toLowerCase().replace('science fiction', 'sci-fi');

    const wantedGenres = toStringArray(calibration?.genres).map(normalizeGenre);

    const matchesGenres = (movie: any) =>
      wantedGenres.length === 0 ||
      (movie.genres || []).some((g: string) =>
        wantedGenres.includes(normalizeGenre(String(g)))
      );

    const localMatches = hydratedRecommendations.filter(matchesGenres);
    const needsSearch =
      hydratedRecommendations.length === 0 ||
      (wantedGenres.length > 0 && localMatches.length < 3);

    if (needsSearch) {
      try {
        const fallback = await tmdbDiscoverFallback(calibration);

        if (fallback && fallback.movies.length > 0) {
          const seen = new Set<string>();

          const merged = [...localMatches, ...fallback.movies].filter(
            (m: any) => {
              const key = String(m.tmdbId || m.id);
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            }
          );

          hydratedRecommendations = merged.slice(0, 12);
          source =
            localMatches.length > 0
              ? 'python-neural-engine-v3.2 + tmdb-live-search'
              : 'tmdb-live-search (V3.2 model had no match)';
          searchNote = fallback.note;
        }
      } catch (error) {
        console.warn('TMDB live search fallback failed:', error);
      }
    }
  }

  return {
    success: pythonResult.success !== false,
    source,
    searchNote,
    executionTimeMs: startTime ? Date.now() - startTime : undefined,
    engine: pythonResult.engine,
    modelVersion: pythonResult.modelVersion,
    weightedFeatures: pythonResult.weightedFeatures,
    profileHypothesis: pythonResult.profileHypothesis,
    filtersRelaxed: pythonResult.filtersRelaxed,
    userTensor: pythonResult.userTensor,
    recommendations: hydratedRecommendations
  };
}

// ============================================================
// PYTHON RECOMMENDATIONS API
// ============================================================

app.post(
  '/api/python-recommendations',
  async (req: Request, res: Response) => {
    const startTime = Date.now();

    try {
      const { calibration, customPrompt } = req.body;

      const result = await runPythonRecommendations(
        calibration,
        customPrompt,
        startTime
      );

      return res.json(result);
    } catch (error: any) {
      console.error('Python engine execution error:', error);

      return res.status(500).json({
        success: false,
        error: error?.message || 'Python execution failed',
        recommendations: []
      });
    }
  }
);

// ============================================================
// PRIMARY RECOMMENDATIONS API
// ============================================================

app.post(
  '/api/recommendations',
  async (req: Request, res: Response) => {
    const { calibration, customPrompt, preferEngine } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // Python V3.2 is the default engine.
    if (preferEngine !== 'gemini') {
      try {
        const result = await runPythonRecommendations(
          calibration,
          customPrompt,
          Date.now()
        );

        return res.json(result);
      } catch (error: any) {
        console.error('Python V3.2 recommendation error:', error);

        return res.status(500).json({
          success: false,
          source: 'python-neural-engine-v3.2-error',
          error: error?.message || 'Python recommendation failed',
          recommendations: []
        });
      }
    }

    // Gemini fallback if the key is missing.
    if (!apiKey) {
      console.warn(
        'Gemini requested but GEMINI_API_KEY is missing. Falling back to Python V3.2.'
      );

      try {
        return res.json(
          await runPythonRecommendations(calibration, customPrompt)
        );
      } catch (error: any) {
        return res.status(500).json({
          success: false,
          source: 'fallback-error',
          error: error?.message || 'Python fallback failed',
          recommendations: []
        });
      }
    }

    // Gemini recommendation engine.
    try {
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
You are the neural core of CineMatch AI,
an avant-garde cinema recommendation engine.

Analyze the user's calibration vector and generate
6 highly tailored, critically acclaimed film recommendations.

User Calibration State:

- Moods:
  ${calibration?.moods?.join(', ') || 'Eclectic'}

- Narrative Vectors:
  ${calibration?.narrativeVectors?.join(', ') || 'Any'}

- Genres:
  ${calibration?.genres?.join(', ') || 'Any'}

- Social Dynamic:
  ${calibration?.socialDynamic || 'friends'}

- Max Duration:
  ${calibration?.maxDuration || 135} minutes

- Critic/Audience Threshold:
  ${calibration?.ratingThreshold || 7.5}+

- Preferred Audio Language:
  ${calibration?.audioLanguage || 'EN'}

${customPrompt ? `- Custom User Direct Intent: "${customPrompt}"` : ''}

Respond ONLY with valid JSON in this schema:

{
  "profileHypothesis": "string describing the overarching profile synthesis",
  "recommendations": [
    {
      "id": "slug-year",
      "title": "Movie Title",
      "year": 2020,
      "durationMinutes": 115,
      "rating": 8.1,
      "rottenTomatoes": 93,
      "director": "Director Name",
      "cast": ["Actor 1", "Actor 2", "Actor 3"],
      "genres": ["Sci-Fi", "Thriller"],
      "narrativeVectors": ["Technology", "Mystery"],
      "moodResonances": ["Thoughtful", "Relaxed"],
      "socialFit": ["friends", "solo"],
      "language": "EN",
      "tagline": "The official tagline",
      "synopsis": "Engaging 2-3 sentence synopsis without spoilers.",
      "aiHypothesisMatch": "Explain why this matches the user's preferences.",
      "matchScore": 98,
      "trailerYoutubeId": "youtube_id_here",
      "streamProviders": ["Apple TV"],
      "audioFormats": ["4K HDR", "DOLBY ATMOS"],
      "awardBadges": ["Academy Award Winner"],
      "neuralMetrics": {
        "atmosphericDread": 85,
        "visualSymmetry": 92,
        "existentialDepth": 95,
        "philosophicalResonance": 90,
        "pacingVelocity": 82,
        "collectiveMomentum": 91,
        "speculativeIndex": 96
      }
    }
  ]
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(response.text || '{}');

      return res.json({
        success: true,
        source: 'gemini-ai',
        profileHypothesis: parsed.profileHypothesis,
        recommendations: parsed.recommendations || []
      });
    } catch (error: any) {
      console.error(
        'Gemini error, executing Python V3.2 fallback:',
        error
      );

      try {
        return res.json(
          await runPythonRecommendations(calibration, customPrompt)
        );
      } catch (fallbackErr: any) {
        console.error('Python V3.2 fallback failed:', fallbackErr);

        return res.status(500).json({
          success: false,
          source: 'client-fallback',
          error:
            fallbackErr?.message ||
            'All recommendation engines failed',
          recommendations: []
        });
      }
    }
  }
);

// ============================================================
// START SERVER
// ============================================================

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true
      },
      appType: 'spa'
    });

    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));

    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  // Warm up the Python worker so the first request is fast.
  ensurePythonWorker().catch(error =>
    console.warn('Python worker warm-up failed:', error?.message || error)
  );

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `CineMatch AI server running on http://localhost:${PORT} with Python V3.2 integration`
    );
  });
}

startServer();
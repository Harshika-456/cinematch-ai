/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { StepProgress } from './components/StepProgress';
import { CalibrationScreen } from './components/CalibrationScreen';
import { RecommendationQueue } from './components/RecommendationQueue';
import { WatchlistScreen } from './components/WatchlistScreen';
import { MovieDetailsModal } from './components/MovieDetailsModal';
import { TrailerModal } from './components/TrailerModal';
import { AuthModal } from './components/AuthModal';
import { SynthesisLoading } from './components/SynthesisLoading';
import {
  Movie,
  CalibrationState,
  INITIAL_CALIBRATION
} from './data/movies';

// Same-origin request: server.ts serves both the Vite frontend and the API on port 3000.
const API_URL = '/api/python-recommendations';

const DEFAULT_NEURAL_METRICS = {
  atmosphericDread: 70,
  visualSymmetry: 80,
  existentialDepth: 75,
  philosophicalResonance: 75,
  pacingVelocity: 80,
  collectiveMomentum: 80,
  speculativeIndex: 70
};

const toStringList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map(v => String(v)).filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map(v => v.trim()).filter(Boolean);
  }
  return [];
};

/**
 * Backend movies can come from Python-only metadata, TMDB hydration or TMDB live
 * search, and not every source fills every field. Fill safe defaults once, here,
 * so no component can crash on a missing array or string.
 */
const normalizeMovie = (raw: any): Movie => {
  const num = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);

  return {
    ...raw,
    id: String(raw?.id ?? `tmdb-${raw?.tmdbId ?? Math.random().toString(36).slice(2)}`),
    title: String(raw?.title || 'Untitled'),
    year: num(raw?.year),
    durationMinutes: num(raw?.durationMinutes),
    rating: num(raw?.rating),
    rottenTomatoes: num(raw?.rottenTomatoes),
    director: String(raw?.director || 'Unknown'),
    cast: toStringList(raw?.cast),
    castProfiles: Array.isArray(raw?.castProfiles) ? raw.castProfiles : [],
    genres: toStringList(raw?.genres),
    narrativeVectors: toStringList(raw?.narrativeVectors),
    moodResonances: toStringList(raw?.moodResonances),
    socialFit: toStringList(raw?.socialFit),
    language: String(raw?.language || 'unknown'),
    tagline: String(raw?.tagline || ''),
    synopsis: String(raw?.synopsis || 'No synopsis available.'),
    aiHypothesisMatch: String(raw?.aiHypothesisMatch || ''),
    matchScore: num(raw?.matchScore),
    neuralMetrics: raw?.neuralMetrics || DEFAULT_NEURAL_METRICS,
    posterUrl: String(raw?.posterUrl || ''),
    backdropUrl: String(raw?.backdropUrl || raw?.posterUrl || ''),
    trailerYoutubeId: String(raw?.trailerYoutubeId || ''),
    streamProviders: toStringList(raw?.streamProviders),
    audioFormats: toStringList(raw?.audioFormats),
    audioTracks: toStringList(raw?.audioTracks),
    awardBadges: toStringList(raw?.awardBadges)
  };
};

export default function App() {
  const [currentView, setCurrentView] = useState<
    'landing' | 'calibrate' | 'recommendations' | 'watchlist'
  >('landing');

  const [calibrationState, setCalibrationState] =
    useState<CalibrationState>(INITIAL_CALIBRATION);

  const [customPrompt, setCustomPrompt] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // Recommendations ONLY come from the backend (Python V3.2 + TMDB). Never seeded with demo data.
  const [moviesList, setMoviesList] = useState<Movie[]>([]);
  const [recommendationError, setRecommendationError] =
    useState<string | null>(null);
  const [filtersRelaxedNote, setFiltersRelaxedNote] = useState<string | null>(null);
  const [isFetchingRecs, setIsFetchingRecs] = useState(false);
  const [synthesisAnimationDone, setSynthesisAnimationDone] = useState(false);
  // Every movie ever returned by the backend, so the watchlist can resolve ids without local demo data.
  const [movieCache, setMovieCache] = useState<Record<string, Movie>>(() => {
    try {
      const saved = localStorage.getItem('cinematch_movie_cache_v1');
      if (!saved) return {};
      const parsed = JSON.parse(saved) as Record<string, any>;
      return Object.fromEntries(
        Object.entries(parsed).map(([id, m]) => [id, normalizeMovie(m)])
      );
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cinematch_movie_cache_v1', JSON.stringify(movieCache));
    } catch {
      // ignore quota errors
    }
  }, [movieCache]);

  const cacheMovies = (movies: Movie[]) =>
    setMovieCache(prev => {
      const next = { ...prev };
      movies.forEach(m => { next[m.id] = m; });
      return next;
    });

  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [pythonExecutionTime, setPythonExecutionTime] =
    useState<number | null>(null);

  const [selectedMovieForDetails, setSelectedMovieForDetails] =
    useState<Movie | null>(null);

  const [selectedMovieForTrailer, setSelectedMovieForTrailer] =
    useState<Movie | null>(null);

  // Watchlist
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cinematch_watchlist_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // User session
  const [user, setUser] = useState<{
    email: string;
    name: string;
  } | null>(() => {
    try {
      const savedUser = localStorage.getItem('cinematch_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Persist watchlist
  useEffect(() => {
    try {
      localStorage.setItem(
        'cinematch_watchlist_v2',
        JSON.stringify(watchlist)
      );
    } catch {
      // ignore
    }
  }, [watchlist]);

  // Persist user
  const handleAuthSuccess = (userData: {
    email: string;
    name: string;
  }) => {
    setUser(userData);

    try {
      localStorage.setItem(
        'cinematch_user',
        JSON.stringify(userData)
      );
    } catch {
      // ignore
    }

    setCurrentView('calibrate');
    setIsAuthModalOpen(false);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleSignOut = () => {
    setUser(null);

    try {
      localStorage.removeItem('cinematch_user');
    } catch {
      // ignore
    }
  };

  const handleToggleWatchlist = (movie: Movie) => {
    setWatchlist(prev =>
      prev.includes(movie.id)
        ? prev.filter(id => id !== movie.id)
        : [...prev, movie.id]
    );
  };

  const handleRemoveFromWatchlist = (movieId: string) => {
    setWatchlist(prev => prev.filter(id => id !== movieId));
  };

  const handleClearWatchlist = () => {
    setWatchlist([]);
  };

  // =========================================================
  // Generate AI Recommendations
  // =========================================================

  const fetchRecommendations = async (
    calibration: CalibrationState,
    prompt: string
  ) => {
    setRecommendationError(null);
    setFiltersRelaxedNote(null);
    setIsFetchingRecs(true);
    setSynthesisAnimationDone(false);
    setIsSynthesizing(true);

    try {
      const requestCalibration = {
        ...calibration,
        audioLanguages:
          calibration.audioLanguages && calibration.audioLanguages.length > 0
            ? calibration.audioLanguages
            : calibration.audioLanguage
              ? [calibration.audioLanguage]
              : [],
        audioLanguage:
          calibration.audioLanguage || calibration.audioLanguages?.[0] || ''
      };

      console.log('CineMatch calibration sent to backend:', requestCalibration);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calibration: requestCalibration,
          customPrompt: prompt
        })
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      console.log('CineMatch API response:', data);

      if (
        response.ok &&
        data?.success &&
        Array.isArray(data.recommendations) &&
        data.recommendations.length > 0
      ) {
        const safeMovies: Movie[] = data.recommendations.map(normalizeMovie);
        setMoviesList(safeMovies);
        cacheMovies(safeMovies);
        setIsAiGenerated(true);
        setPythonExecutionTime(data.executionTimeMs || null);
        setFiltersRelaxedNote(
          data.searchNote
            ? data.searchNote
            : data.filtersRelaxed && data.filtersRelaxed !== 'none'
              ? `Few movies matched every filter, so the engine relaxed: ${data.filtersRelaxed}. Language was kept exactly as selected.`
              : null
        );
      } else {
        setMoviesList([]);
        setIsAiGenerated(false);
        setRecommendationError(
          data?.error ||
            data?.message ||
            (response.ok
              ? 'The recommendation engine returned no movies for this selection.'
              : `Recommendation request failed (HTTP ${response.status}).`)
        );
      }
    } catch (err) {
      console.error('Recommendation API error:', err);
      setMoviesList([]);
      setIsAiGenerated(false);
      setRecommendationError(
        'Cannot connect to the CineMatch backend. Start it with "npm run dev" and open http://localhost:3000.'
      );
    } finally {
      setIsFetchingRecs(false);
    }
  };

  const handleGenerateRecommendations = () =>
    fetchRecommendations(calibrationState, customPrompt);

  // =========================================================
  // Synthesis Complete
  // =========================================================

  const handleSynthesisComplete = React.useCallback(() => {
    setSynthesisAnimationDone(true);
  }, []);

  // Only leave the loading screen once the animation is done AND the backend has answered.
  useEffect(() => {
    if (isSynthesizing && synthesisAnimationDone && !isFetchingRecs) {
      setIsSynthesizing(false);
      setSynthesisAnimationDone(false);
      setCurrentView('recommendations');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isSynthesizing, synthesisAnimationDone, isFetchingRecs]);

  // =========================================================
  // Reset Calibration
  // =========================================================

  const handleResetCalibration = () => {
    setCalibrationState(INITIAL_CALIBRATION);
    setCustomPrompt('');

    setMoviesList([]);
    setRecommendationError(null);

    setIsAiGenerated(false);
  };

  // =========================================================
  // More Like This
  // =========================================================

  const handleMoreLikeThis = async (movie: Movie) => {
    const updatedCalibration = {
      ...calibrationState,

      genres: Array.from(
        new Set([
          ...movie.genres,
          ...calibrationState.genres.slice(0, 1)
        ])
      ),

      narrativeVectors: Array.from(
        new Set([
          ...movie.narrativeVectors,
          ...calibrationState.narrativeVectors.slice(0, 2)
        ])
      ),

      moodResonances: movie.moodResonances
    };

    const prompt = `In the vein of ${movie.title} by ${movie.director}`;

    setCalibrationState(updatedCalibration);
    setCustomPrompt(prompt);
    await fetchRecommendations(updatedCalibration, prompt);
  };

  // =========================================================
  // Step Navigation
  // =========================================================

  const handleStepClick = (stepNumber: number) => {
    if (currentView !== 'calibrate') {
      setCurrentView('calibrate');
    }

    const elem = document.getElementById(
      `step-${stepNumber}`
    );

    if (elem) {
      elem.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-[#0b0d13] text-[#e2e2eb] flex flex-col font-sans selection:bg-[#4cd7f6]/30 selection:text-white relative">

      {/* Atmospheric ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#06b6d4]/10 via-[#8b5cf6]/5 to-transparent blur-[120px] pointer-events-none z-0" />

      <div className="fixed bottom-0 right-0 w-[500px] h-[350px] bg-gradient-to-t from-[#8b5cf6]/8 to-transparent blur-[100px] pointer-events-none z-0" />

      {/* Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        watchlistCount={watchlist.length}
        onResetCalibration={handleResetCalibration}
        pythonEngineActive={true}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Content */}
      <main className="flex-1 relative z-10">

        {/* Landing */}
        {currentView === 'landing' && (
          <LandingPage
            onStartCalibration={() => {
              setCurrentView('calibrate');

              window.scrollTo({
                top: 0,
                behavior: 'smooth'
              });
            }}
            onOpenAuth={() =>
              setIsAuthModalOpen(true)
            }
            user={user}
          />
        )}

        {/* Calibration */}
        {currentView === 'calibrate' && (
          <div className="animate-fadeIn">

            <StepProgress
              calibrationState={calibrationState}
              onStepClick={handleStepClick}
            />

            <CalibrationScreen
              state={calibrationState}
              onChange={setCalibrationState}
              customPrompt={customPrompt}
              onCustomPromptChange={setCustomPrompt}
              onGenerate={handleGenerateRecommendations}
            />

          </div>
        )}

        {/* Recommendations */}
        {currentView === 'recommendations' && recommendationError && (
          <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
            <h2 className="text-xl font-bold text-white">
              Could not load recommendations
            </h2>
            <p className="text-sm text-[#bcc9cd] whitespace-pre-line">
              {recommendationError}
            </p>
            <button
              onClick={() => setCurrentView('calibrate')}
              className="px-4 py-2 rounded-lg bg-[#4cd7f6] text-black text-sm font-semibold cursor-pointer"
            >
              Back to calibration
            </button>
          </div>
        )}

        {currentView === 'recommendations' && !recommendationError && filtersRelaxedNote && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
            <div className="p-3 rounded-xl bg-[#1e2230] border border-[#4cd7f6]/30 text-xs text-[#bcc9cd]">
              {filtersRelaxedNote}
            </div>
          </div>
        )}

        {currentView === 'recommendations' && !recommendationError && (
          <RecommendationQueue
            movies={moviesList}
            calibrationState={calibrationState}
            onOpenCalibration={() => {
              setCurrentView('calibrate');

              window.scrollTo({
                top: 0,
                behavior: 'smooth'
              });
            }}
            onSelectMovie={movie =>
              setSelectedMovieForDetails(movie)
            }
            onPlayTrailer={movie =>
              setSelectedMovieForTrailer(movie)
            }
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
            onMoreLikeThis={handleMoreLikeThis}
            isAiGenerated={isAiGenerated}
          />
        )}

        {/* Watchlist */}
        {currentView === 'watchlist' && (
          <WatchlistScreen
            watchlistIds={watchlist}
            allMovies={Object.values(movieCache)}
            onSelectMovie={movie =>
              setSelectedMovieForDetails(movie)
            }
            onPlayTrailer={movie =>
              setSelectedMovieForTrailer(movie)
            }
            onRemoveFromWatchlist={
              handleRemoveFromWatchlist
            }
            onClearWatchlist={handleClearWatchlist}
            onBackToQueue={() =>
              setCurrentView('recommendations')
            }
          />
        )}

      </main>

      {/* Synthesis Loading */}
      {isSynthesizing && (
        <SynthesisLoading
          onComplete={handleSynthesisComplete}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() =>
          setIsAuthModalOpen(false)
        }
        onSuccess={handleAuthSuccess}
      />

      {/* Movie Details */}
      {selectedMovieForDetails && (
        <MovieDetailsModal
          movie={selectedMovieForDetails}
          onClose={() =>
            setSelectedMovieForDetails(null)
          }
          onPlayTrailer={movie =>
            setSelectedMovieForTrailer(movie)
          }
          isWatchlisted={watchlist.includes(
            selectedMovieForDetails.id
          )}
          onToggleWatchlist={
            handleToggleWatchlist
          }
        />
      )}

      {/* Trailer */}
      {selectedMovieForTrailer && (
        <TrailerModal
          movie={selectedMovieForTrailer}
          onClose={() =>
            setSelectedMovieForTrailer(null)
          }
        />
      )}

    </div>
  );
}
export interface NeuralVectorMetrics {
  atmosphericDread: number;
  visualSymmetry: number;
  existentialDepth: number;
  philosophicalResonance: number;
  pacingVelocity: number;
  collectiveMomentum: number;
  speculativeIndex: number;
}

export interface Movie {
  id: string;
  tmdbId?: number;
  title: string;
  year: number;
  durationMinutes: number;
  rating: number; // e.g. 8.2
  rottenTomatoes: number; // e.g. 94
  director: string;
  cast: string[];
  castProfiles?: { name: string; imageUrl: string }[];
  genres: string[];
  narrativeVectors: string[];
  moodResonances: string[];
  socialFit: string[]; // 'solo', 'friends', 'family', 'partner'
  language: string; // 'EN', 'FR', 'JA', etc.
  tagline: string;
  synopsis: string;
  aiHypothesisMatch: string;
  matchScore: number; // 0-100
  neuralMetrics: NeuralVectorMetrics;
  posterUrl: string;
  backdropUrl: string;
  trailerYoutubeId: string;
  streamProviders: string[];
  audioFormats: string[];
  audioTracks?: string[]; // e.g. ['english', 'marathi', 'hindi', 'tamil', 'telgu', 'kannada', 'odisha']
  awardBadges?: string[];
}

export const MOVIES_DATABASE: Movie[] = [
  {
    id: 'arrival-2016',
    title: 'Arrival',
    year: 2016,
    durationMinutes: 116,
    rating: 7.9,
    rottenTomatoes: 94,
    director: 'Denis Villeneuve',
    cast: ['Amy Adams', 'Jeremy Renner', 'Forest Whitaker', 'Michael Stuhlbarg'],
    genres: ['Sci-Fi', 'Mystery', 'Drama'],
    narrativeVectors: ['Technology', 'Space', 'Mystery', 'Science'],
    moodResonances: ['Thoughtful', 'Relaxed', 'Emotional'],
    socialFit: ['friends', 'solo', 'partner'],
    language: 'EN',
    tagline: 'Why are they here?',
    synopsis: 'Linguistics professor Louise Banks leads an elite team of investigators when gigantic extraterrestrial spacecraft touch down across the globe. As nations teeter on the verge of global war, Banks races against time to decrypt their enigmatic language.',
    aiHypothesisMatch: 'Optimal resonance with cerebral speculative fiction. Deep linguistic mystery designed to spark heated philosophical debate among collective viewing groups without sacrificing emotional warmth.',
    matchScore: 99,
    neuralMetrics: {
      atmosphericDread: 76,
      visualSymmetry: 94,
      existentialDepth: 98,
      philosophicalResonance: 96,
      pacingVelocity: 82,
      collectiveMomentum: 92,
      speculativeIndex: 97,
    },
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: 'tFMo3UJ4B4g',
    streamProviders: ['Paramount+', 'Apple TV', 'Prime Video'],
    audioFormats: ['4K HDR', 'DOLBY ATMOS', '5.1 SURROUND'],
    awardBadges: ['Academy Award Winner', 'BAFTA Winner']
  },
  {
    id: 'blade-runner-2049',
    title: 'Blade Runner 2049',
    year: 2017,
    durationMinutes: 164,
    rating: 8.0,
    rottenTomatoes: 88,
    director: 'Denis Villeneuve',
    cast: ['Ryan Gosling', 'Harrison Ford', 'Ana de Armas', 'Sylvia Hoeks'],
    genres: ['Sci-Fi', 'Mystery', 'Thriller'],
    narrativeVectors: ['Technology', 'Mystery', 'Science', 'Crime'],
    moodResonances: ['Thoughtful', 'Relaxed', 'Scared'],
    socialFit: ['solo', 'friends'],
    language: 'EN',
    tagline: 'The key to the future is finally unearthed.',
    synopsis: 'Thirty years after the events of the first film, a new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what is left of society into chaos.',
    aiHypothesisMatch: 'Monumental aesthetic architecture featuring Roger Deakins\' transcendent cinematography. Meshes introspective identity questioning with high-density neo-noir atmosphere.',
    matchScore: 97,
    neuralMetrics: {
      atmosphericDread: 89,
      visualSymmetry: 99,
      existentialDepth: 95,
      philosophicalResonance: 94,
      pacingVelocity: 74,
      collectiveMomentum: 86,
      speculativeIndex: 96,
    },
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: 'gCcx85zbxz4',
    streamProviders: ['Max', 'Apple TV', 'Prime Video'],
    audioFormats: ['4K ULTRA HD', 'DOLBY VISION', 'DOLBY ATMOS'],
    awardBadges: ['2x Academy Award Winner', 'Cinematography Gold']
  },
  {
    id: 'interstellar-2014',
    title: 'Interstellar',
    year: 2014,
    durationMinutes: 169,
    rating: 8.7,
    rottenTomatoes: 73,
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    narrativeVectors: ['Space', 'Science', 'Technology', 'Adventure'],
    moodResonances: ['Excited', 'Thoughtful', 'Emotional'],
    socialFit: ['friends', 'family', 'partner'],
    language: 'EN',
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
    synopsis: 'When Earth becomes uninhabitable, a team of explorers undertakes the most important mission in human history: traveling beyond this galaxy to discover whether mankind has a future among the stars.',
    aiHypothesisMatch: 'Unmatched scale and relativistic quantum physics married to poignant familial devotion. Maximum sensory impact calibrated for group cinematic wonder.',
    matchScore: 98,
    neuralMetrics: {
      atmosphericDread: 78,
      visualSymmetry: 92,
      existentialDepth: 97,
      philosophicalResonance: 90,
      pacingVelocity: 88,
      collectiveMomentum: 98,
      speculativeIndex: 94,
    },
    posterUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: 'zSWdZVtXT7E',
    streamProviders: ['Paramount+', 'Prime Video', 'Apple TV'],
    audioFormats: ['IMAX ENHANCED', '4K HDR', 'DOLBY ATMOS'],
    awardBadges: ['Academy Award Winner - VFX', '5 Oscar Nominations']
  },
  {
    id: 'ex-machina-2014',
    title: 'Ex Machina',
    year: 2014,
    durationMinutes: 108,
    rating: 7.7,
    rottenTomatoes: 92,
    director: 'Alex Garland',
    cast: ['Domhnall Gleeson', 'Alicia Vikander', 'Oscar Isaac', 'Sonoya Mizuno'],
    genres: ['Sci-Fi', 'Thriller', 'Drama'],
    narrativeVectors: ['Technology', 'Science', 'Mystery'],
    moodResonances: ['Thoughtful', 'Scared', 'Relaxed'],
    socialFit: ['friends', 'solo', 'partner'],
    language: 'EN',
    tagline: 'There is nothing more human than the will to survive.',
    synopsis: 'A programmer is selected to participate in a groundbreaking experiment in synthetic intelligence by evaluating the human qualities of a highly advanced humanoid AI.',
    aiHypothesisMatch: 'Hyper-focused chamber-piece thrill. Perfect pacing under 2 hours with razor-sharp dialogue on synthetic consciousness, deception, and architectural minimalism.',
    matchScore: 96,
    neuralMetrics: {
      atmosphericDread: 88,
      visualSymmetry: 96,
      existentialDepth: 93,
      philosophicalResonance: 97,
      pacingVelocity: 85,
      collectiveMomentum: 90,
      speculativeIndex: 95,
    },
    posterUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: 'EoQuVnKhxaM',
    streamProviders: ['Max', 'Apple TV', 'Criterion'],
    audioFormats: ['4K HDR', 'DOLBY 5.1'],
    awardBadges: ['Academy Award Winner - VFX']
  },
  {
    id: 'coherence-2013',
    title: 'Coherence',
    year: 2013,
    durationMinutes: 89,
    rating: 7.2,
    rottenTomatoes: 88,
    director: 'James Ward Byrkit',
    cast: ['Emily Baldoni', 'Maury Sterling', 'Nicholas Brendon', 'Lorene Scafaria'],
    genres: ['Sci-Fi', 'Mystery', 'Thriller'],
    narrativeVectors: ['Science', 'Mystery', 'Space'],
    moodResonances: ['Thoughtful', 'Scared', 'Excited'],
    socialFit: ['friends', 'solo'],
    language: 'EN',
    tagline: 'Rearrange your reality.',
    synopsis: 'On the night of an astronomical anomaly, eight friends at a dinner party experience a troubling chain of reality-bending events as quantum decoherence fractures their timeline.',
    aiHypothesisMatch: 'The pinnacle of collective dinner-party sci-fi. Razor-taut runtime (89 min) that plunges friends into interactive paranoia, theory-crafting, and quantum multiverse dread.',
    matchScore: 95,
    neuralMetrics: {
      atmosphericDread: 94,
      visualSymmetry: 79,
      existentialDepth: 92,
      philosophicalResonance: 91,
      pacingVelocity: 94,
      collectiveMomentum: 99,
      speculativeIndex: 98,
    },
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: 'sPEQc84N14I',
    streamProviders: ['Prime Video', 'Tubi', 'Apple TV'],
    audioFormats: ['HD', 'STEREO UNCOMPRESSED'],
    awardBadges: ['Fantastic Fest Winner', 'Cult Classic Milestone']
  },
  {
    id: 'inception-2010',
    title: 'Inception',
    year: 2010,
    durationMinutes: 148,
    rating: 8.8,
    rottenTomatoes: 87,
    director: 'Christopher Nolan',
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page', 'Tom Hardy'],
    genres: ['Action', 'Sci-Fi', 'Thriller'],
    narrativeVectors: ['Technology', 'Mystery', 'Science', 'Crime'],
    moodResonances: ['Excited', 'Thoughtful', 'Emotional'],
    socialFit: ['friends', 'partner', 'solo'],
    language: 'EN',
    tagline: 'Your mind is the scene of the crime.',
    synopsis: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.',
    aiHypothesisMatch: 'Symphonic structural complexity with visceral heist velocity. High conversational aftermath guaranteed by its iconic ambiguity.',
    matchScore: 94,
    neuralMetrics: {
      atmosphericDread: 73,
      visualSymmetry: 95,
      existentialDepth: 90,
      philosophicalResonance: 88,
      pacingVelocity: 95,
      collectiveMomentum: 96,
      speculativeIndex: 91,
    },
    posterUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: 'YoHD9XEInc0',
    streamProviders: ['Max', 'Apple TV', 'Prime Video'],
    audioFormats: ['4K HDR', 'DOLBY ATMOS', '5.1 SURROUND'],
    awardBadges: ['4x Academy Award Winner']
  },
  {
    id: 'parasite-2019',
    title: 'Parasite',
    year: 2019,
    durationMinutes: 132,
    rating: 8.5,
    rottenTomatoes: 99,
    director: 'Bong Joon-ho',
    cast: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong', 'Choi Woo-shik'],
    genres: ['Drama', 'Thriller', 'Comedy'],
    narrativeVectors: ['Crime', 'Mystery', 'True Stories'],
    moodResonances: ['Excited', 'Thoughtful', 'Scared', 'Funny'],
    socialFit: ['friends', 'partner', 'solo'],
    language: 'KO',
    tagline: 'Act like you own the place.',
    synopsis: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
    aiHypothesisMatch: 'Genre-defying black comedy and suspense masterpiece with impeccable narrative architecture and piercing social commentary.',
    matchScore: 97,
    neuralMetrics: {
      atmosphericDread: 91,
      visualSymmetry: 97,
      existentialDepth: 96,
      philosophicalResonance: 95,
      pacingVelocity: 93,
      collectiveMomentum: 98,
      speculativeIndex: 82,
    },
    posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: '5xH0RZE728I',
    streamProviders: ['Max', 'Hulu', 'Criterion Channel'],
    audioFormats: ['4K DOLBY VISION', 'DOLBY ATMOS'],
    awardBadges: ['4x Academy Award Winner (Best Picture)', 'Palme d\'Or']
  },
  {
    id: 'everything-everywhere-2022',
    title: 'Everything Everywhere All at Once',
    year: 2022,
    durationMinutes: 139,
    rating: 7.8,
    rottenTomatoes: 94,
    director: 'Daniel Kwan, Daniel Scheinert',
    cast: ['Michelle Yeoh', 'Ke Huy Quan', 'Stephanie Hsu', 'Jamie Lee Curtis'],
    genres: ['Sci-Fi', 'Comedy', 'Adventure', 'Drama', 'Action'],
    narrativeVectors: ['Science', 'Technology', 'Adventure', 'Mystery'],
    moodResonances: ['Funny', 'Excited', 'Emotional', 'Thoughtful', 'Happy'],
    socialFit: ['friends', 'family', 'partner'],
    language: 'EN',
    tagline: 'The universe is so much bigger than you realize.',
    synopsis: 'A middle-aged Chinese immigrant is swept up into an adventure in which she alone can save existence by exploring other universes and connecting with the lives she could have led.',
    aiHypothesisMatch: 'Maximalist kinetic humor anchored by deep existential philosophy and generational love. Supercharged group laughter and communal tearfulness.',
    matchScore: 96,
    neuralMetrics: {
      atmosphericDread: 45,
      visualSymmetry: 82,
      existentialDepth: 97,
      philosophicalResonance: 95,
      pacingVelocity: 98,
      collectiveMomentum: 97,
      speculativeIndex: 96,
    },
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: 'wxN1T1uxQ2g',
    streamProviders: ['Netflix', 'Apple TV', 'Paramount+'],
    audioFormats: ['4K HDR', 'DOLBY ATMOS'],
    awardBadges: ['7x Academy Award Winner (Best Picture)']
  },
  {
    id: 'spirited-away-2001',
    title: 'Spirited Away',
    year: 2001,
    durationMinutes: 125,
    rating: 8.6,
    rottenTomatoes: 96,
    director: 'Hayao Miyazaki',
    cast: ['Rumi Hiiragi', 'Miyu Irino', 'Mari Natsuki', 'Takashi Naito'],
    genres: ['Animation', 'Adventure', 'Drama'],
    narrativeVectors: ['Adventure', 'Mystery', 'Music'],
    moodResonances: ['Happy', 'Relaxed', 'Emotional', 'Thoughtful'],
    socialFit: ['family', 'partner', 'solo', 'friends'],
    language: 'JA',
    tagline: 'The tunnel led to a mysterious town...',
    synopsis: 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.',
    aiHypothesisMatch: 'Lush mythical world-building with profound visual poetry. Transcendent comfort cinema suitable for both deeply analytical and family viewing.',
    matchScore: 95,
    neuralMetrics: {
      atmosphericDread: 38,
      visualSymmetry: 95,
      existentialDepth: 94,
      philosophicalResonance: 93,
      pacingVelocity: 84,
      collectiveMomentum: 95,
      speculativeIndex: 91,
    },
    posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: 'ByXuk9QqQkk',
    streamProviders: ['Max', 'Apple TV'],
    audioFormats: ['4K HDR', 'ORIGINAL JAPANESE MASTER'],
    awardBadges: ['Academy Award Winner - Best Animated Feature', 'Golden Bear']
  },
  {
    id: 'the-truman-show-1998',
    title: 'The Truman Show',
    year: 1998,
    durationMinutes: 103,
    rating: 8.2,
    rottenTomatoes: 95,
    director: 'Peter Weir',
    cast: ['Jim Carrey', 'Laura Linney', 'Ed Harris', 'Noah Emmerich'],
    genres: ['Comedy', 'Drama', 'Sci-Fi'],
    narrativeVectors: ['Technology', 'Mystery', 'True Stories'],
    moodResonances: ['Funny', 'Happy', 'Thoughtful', 'Emotional'],
    socialFit: ['friends', 'family', 'partner', 'solo'],
    language: 'EN',
    tagline: 'On the air. Unaware.',
    synopsis: 'An insurance salesman discovers his whole life is actually a reality TV show broadcast live to billions across the world, prompting a desperate bid for existential freedom.',
    aiHypothesisMatch: 'Prophetic media commentary masquerading as high-concept comedy. Compact 103m runtime guaranteed to evoke immediate empathy and fascination.',
    matchScore: 94,
    neuralMetrics: {
      atmosphericDread: 48,
      visualSymmetry: 91,
      existentialDepth: 97,
      philosophicalResonance: 96,
      pacingVelocity: 90,
      collectiveMomentum: 96,
      speculativeIndex: 93,
    },
    posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: 'dlnmQbPGuls',
    streamProviders: ['Paramount+', 'Prime Video'],
    audioFormats: ['4K HDR', 'DOLBY 5.1'],
    awardBadges: ['3 Oscar Nominations', 'Golden Globe Winner']
  },
  {
    id: 'eternal-sunshine-2004',
    title: 'Eternal Sunshine of the Spotless Mind',
    year: 2004,
    durationMinutes: 108,
    rating: 8.3,
    rottenTomatoes: 92,
    director: 'Michel Gondry',
    cast: ['Jim Carrey', 'Kate Winslet', 'Kirsten Dunst', 'Mark Ruffalo'],
    genres: ['Drama', 'Romance', 'Sci-Fi'],
    narrativeVectors: ['Technology', 'Science'],
    moodResonances: ['Romantic', 'Emotional', 'Thoughtful'],
    socialFit: ['partner', 'solo'],
    language: 'EN',
    tagline: 'You can erase someone from your mind. Getting them out of your heart is another story.',
    synopsis: 'When their relationship turns sour, a couple undergoes a medical procedure to have each other erased from their memories forever.',
    aiHypothesisMatch: 'Incomparable emotional resonance and inventive non-linear memory unraveling. The definitive cerebral romance for partners and reflective solo viewing.',
    matchScore: 96,
    neuralMetrics: {
      atmosphericDread: 52,
      visualSymmetry: 86,
      existentialDepth: 98,
      philosophicalResonance: 97,
      pacingVelocity: 86,
      collectiveMomentum: 82,
      speculativeIndex: 94,
    },
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: '0zFywiAh7N0',
    streamProviders: ['Peacock', 'Apple TV', 'Prime Video'],
    audioFormats: ['4K HDR', 'DTS-HD'],
    awardBadges: ['Academy Award Winner - Best Original Screenplay']
  },
  {
    id: 'mad-max-fury-road-2015',
    title: 'Mad Max: Fury Road',
    year: 2015,
    durationMinutes: 120,
    rating: 8.1,
    rottenTomatoes: 97,
    director: 'George Miller',
    cast: ['Tom Hardy', 'Charlize Theron', 'Nicholas Hoult', 'Hugh Keays-Byrne'],
    genres: ['Action', 'Adventure', 'Sci-Fi'],
    narrativeVectors: ['Adventure', 'Technology'],
    moodResonances: ['Excited'],
    socialFit: ['friends', 'solo'],
    language: 'EN',
    tagline: 'What a Lovely Day.',
    synopsis: 'In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search for her homeland with the aid of a group of female prisoners, a psychotic worshiper, and a drifter named Max.',
    aiHypothesisMatch: 'Pure kinetic cinema and unyielding vehicular velocity. Relentless sensory immersion calibrated for adrenaline-fueled group viewing.',
    matchScore: 93,
    neuralMetrics: {
      atmosphericDread: 74,
      visualSymmetry: 96,
      existentialDepth: 84,
      philosophicalResonance: 81,
      pacingVelocity: 100,
      collectiveMomentum: 99,
      speculativeIndex: 88,
    },
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: 'hEJnMQG938g',
    streamProviders: ['Max', 'Apple TV'],
    audioFormats: ['4K DOLBY VISION', 'DOLBY ATMOS'],
    awardBadges: ['6x Academy Award Winner']
  },
  {
    id: 'knives-out-2019',
    title: 'Knives Out',
    year: 2019,
    durationMinutes: 130,
    rating: 7.9,
    rottenTomatoes: 97,
    director: 'Rian Johnson',
    cast: ['Daniel Craig', 'Ana de Armas', 'Chris Evans', 'Jamie Lee Curtis'],
    genres: ['Mystery', 'Comedy', 'Drama', 'Thriller'],
    narrativeVectors: ['Crime', 'Mystery'],
    moodResonances: ['Funny', 'Excited', 'Relaxed', 'Thoughtful'],
    socialFit: ['friends', 'family', 'partner'],
    language: 'EN',
    tagline: 'Hell, any of them could have done it.',
    synopsis: 'A detective investigates the death of a patriarch of an eccentric, combative family in this clever modern reinvention of the classic whodunnit.',
    aiHypothesisMatch: 'Crisp dialogue, buoyant humor, and satisfying labyrinthine plotting designed to keep everyone guessing and cheering.',
    matchScore: 92,
    neuralMetrics: {
      atmosphericDread: 42,
      visualSymmetry: 90,
      existentialDepth: 75,
      philosophicalResonance: 79,
      pacingVelocity: 92,
      collectiveMomentum: 98,
      speculativeIndex: 70,
    },
    posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: 'qGqiHJTsRkQ',
    streamProviders: ['Netflix', 'Apple TV'],
    audioFormats: ['4K HDR', 'DOLBY 5.1'],
    awardBadges: ['Oscar Nominee - Best Original Screenplay'],
    audioTracks: ['english', 'hindi', 'telgu', 'tamil']
  },
  {
    id: 'tumbbad-2018',
    title: 'Tumbbad',
    year: 2018,
    durationMinutes: 104,
    rating: 8.2,
    rottenTomatoes: 88,
    director: 'Rahi Anil Barve, Anand Gandhi',
    cast: ['Sohum Shah', 'Jyoti Malshe', 'Anita Date', 'Ronjini Chakraborty'],
    genres: ['Mystery', 'Thriller', 'Drama'],
    narrativeVectors: ['History', 'Mystery', 'Crime', 'True Stories'],
    moodResonances: ['Scared', 'Thoughtful', 'Excited'],
    socialFit: ['solo', 'friends'],
    language: 'MR',
    tagline: 'Fear greed. Fear Hastar.',
    synopsis: 'A mythological horror masterpiece spanning three generations in 1920s colonial India. A man seeks a cursed ancestral gold treasure guarded by the fallen demon-god Hastar.',
    aiHypothesisMatch: 'Atmospheric horror and mythological dread unmatched in modern cinema. Visceral rain-soaked visuals, psychological obsession, and folk fable resonance.',
    matchScore: 97,
    neuralMetrics: {
      atmosphericDread: 98,
      visualSymmetry: 92,
      existentialDepth: 95,
      philosophicalResonance: 94,
      pacingVelocity: 88,
      collectiveMomentum: 89,
      speculativeIndex: 96,
    },
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: 'sN75MPxgvX8',
    streamProviders: ['Prime Video', 'JioCinema'],
    audioFormats: ['4K DOLBY ATMOS', '5.1 SURROUND'],
    audioTracks: ['marathi', 'hindi', 'tamil', 'telgu', 'english'],
    awardBadges: ['3x Filmfare Award Winner', 'Venice Critics Week Premiere']
  },
  {
    id: 'court-2014',
    title: 'Court',
    year: 2014,
    durationMinutes: 116,
    rating: 7.8,
    rottenTomatoes: 98,
    director: 'Chaitanya Tamhane',
    cast: ['Vira Sathidar', 'Vivek Gomber', 'Geetanjali Kulkarni', 'Pradeep Joshi'],
    genres: ['Drama'],
    narrativeVectors: ['True Stories', 'Crime', 'Music'],
    moodResonances: ['Thoughtful', 'Emotional', 'Relaxed'],
    socialFit: ['solo', 'friends'],
    language: 'MR',
    tagline: 'An indictment of justice.',
    synopsis: 'A quietly devastating examination of the Indian judicial system through the trial of an elderly folk singer accused of inciting a sewage worker\'s suicide through his protest music.',
    aiHypothesisMatch: 'Profound observational realism with dry human irony. Acclaimed by Alfonso Cuarón as one of modern cinema\'s transcendent accomplishments.',
    matchScore: 96,
    neuralMetrics: {
      atmosphericDread: 62,
      visualSymmetry: 91,
      existentialDepth: 97,
      philosophicalResonance: 99,
      pacingVelocity: 72,
      collectiveMomentum: 85,
      speculativeIndex: 82,
    },
    posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: 'T8j-H2g7sJw',
    streamProviders: ['Netflix', 'MUBI'],
    audioFormats: ['HD', '5.1 SURROUND'],
    audioTracks: ['marathi', 'english', 'hindi'],
    awardBadges: ['Venice Lion of the Future', 'National Film Award - Best Feature']
  },
  {
    id: 'sairat-2016',
    title: 'Sairat',
    year: 2016,
    durationMinutes: 174,
    rating: 8.3,
    rottenTomatoes: 95,
    director: 'Nagraj Manjule',
    cast: ['Rinku Rajguru', 'Akash Thosar', 'Tanaji Galgunde', 'Arbaz Shaikh'],
    genres: ['Drama', 'Romance'],
    narrativeVectors: ['True Stories', 'Music'],
    moodResonances: ['Emotional', 'Romantic', 'Excited'],
    socialFit: ['partner', 'friends'],
    language: 'MR',
    tagline: 'Passionate rebellion against the barriers of convention.',
    synopsis: 'A fisherman\'s son and a wealthy politician\'s spirited daughter defy rigid caste conventions in rural Maharashtra, embarking on a turbulent cross-cultural odyssey.',
    aiHypothesisMatch: 'A landmark of modern world cinema. Searing emotional momentum powered by Ajay-Atul\'s orchestral score and unflinching sociological truth.',
    matchScore: 95,
    neuralMetrics: {
      atmosphericDread: 75,
      visualSymmetry: 88,
      existentialDepth: 96,
      philosophicalResonance: 93,
      pacingVelocity: 89,
      collectiveMomentum: 97,
      speculativeIndex: 80,
    },
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: 'wMrQN7q071E',
    streamProviders: ['Zee5', 'Apple TV'],
    audioFormats: ['HD', 'DOLBY 5.1'],
    audioTracks: ['marathi', 'hindi'],
    awardBadges: ['Berlin Film Festival Premiere', 'National Film Award Special Mention']
  },
  {
    id: 'rrr-2022',
    title: 'RRR',
    year: 2022,
    durationMinutes: 187,
    rating: 7.8,
    rottenTomatoes: 95,
    director: 'S.S. Rajamouli',
    cast: ['N.T. Rama Rao Jr.', 'Ram Charan', 'Alia Bhatt', 'Ajay Devgn'],
    genres: ['Action', 'Drama', 'Adventure'],
    narrativeVectors: ['Adventure', 'History', 'Sports'],
    moodResonances: ['Excited', 'Emotional', 'Happy'],
    socialFit: ['friends', 'family', 'partner'],
    language: 'TE',
    tagline: 'Rise. Roar. Revolt.',
    synopsis: 'A fictitious story about two legendary revolutionaries and their journey away from home before they began fighting for their country in the 1920s.',
    aiHypothesisMatch: 'Unfettered maximalist spectacle, kinetic choreography, and mythic brotherhood brotherhood energy.',
    matchScore: 98,
    neuralMetrics: {
      atmosphericDread: 48,
      visualSymmetry: 96,
      existentialDepth: 86,
      philosophicalResonance: 88,
      pacingVelocity: 99,
      collectiveMomentum: 100,
      speculativeIndex: 90,
    },
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: 'NgBoMJy3986',
    streamProviders: ['Netflix', 'Zee5'],
    audioFormats: ['4K DOLBY ATMOS', 'DOLBY VISION'],
    audioTracks: ['telgu', 'hindi', 'tamil', 'kannada', 'marathi', 'english'],
    awardBadges: ['Academy Award Winner - Best Song', 'Golden Globe Winner']
  },
  {
    id: 'kantara-2022',
    title: 'Kantara',
    year: 2022,
    durationMinutes: 148,
    rating: 8.2,
    rottenTomatoes: 91,
    director: 'Rishab Shetty',
    cast: ['Rishab Shetty', 'Sapthami Gowda', 'Kishore', 'Achyuth Kumar'],
    genres: ['Action', 'Thriller', 'Drama'],
    narrativeVectors: ['Mystery', 'History', 'Adventure'],
    moodResonances: ['Excited', 'Scared', 'Emotional'],
    socialFit: ['friends', 'family', 'solo'],
    language: 'KN',
    tagline: 'A legend of divine wrath and ancestral forests.',
    synopsis: 'When greed paves the way for betrayal and murder, a young tribal leader from coastal Karnataka is possessed by the sacred Bhoota Kola spirit to defend his land against oppressive forces.',
    aiHypothesisMatch: 'Hypnotic indigenous folklore infused with volcanic climactic velocity. The raw power of spiritual justice and ritual performance.',
    matchScore: 97,
    neuralMetrics: {
      atmosphericDread: 89,
      visualSymmetry: 93,
      existentialDepth: 94,
      philosophicalResonance: 92,
      pacingVelocity: 94,
      collectiveMomentum: 98,
      speculativeIndex: 95,
    },
    posterUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: '6oKGIdzylu4',
    streamProviders: ['Netflix', 'Prime Video'],
    audioFormats: ['4K ULTRA HD', 'DOLBY 5.1'],
    audioTracks: ['kannada', 'hindi', 'telgu', 'tamil', 'marathi', 'english'],
    awardBadges: ['National Film Award Winner', 'Global Blockbuster']
  },
  {
    id: 'daman-2022',
    title: 'Daman',
    year: 2022,
    durationMinutes: 121,
    rating: 8.8,
    rottenTomatoes: 94,
    director: 'Vishal Mourya, Debi Prasad Lenka',
    cast: ['Babushaan Mohanty', 'Dipanwit Dashmohapatra', 'Manaswini Takri'],
    genres: ['Drama', 'Adventure'],
    narrativeVectors: ['True Stories', 'Science', 'Adventure'],
    moodResonances: ['Emotional', 'Thoughtful', 'Happy'],
    socialFit: ['family', 'friends', 'solo'],
    language: 'OD',
    tagline: 'Durgama Anchalare Malaria Nirakarana.',
    synopsis: 'Based on the inspiring real-life mission of Dr. Siddharth, a young doctor posted to the remote tribal valleys of Malkangiri, Odisha, who travels on foot through uncharted forests to eradicate malaria.',
    aiHypothesisMatch: 'An inspiring triumph of Odisha cinema. Grounded humanitarian empathy, gripping medical adventure, and deep regional authenticity.',
    matchScore: 98,
    neuralMetrics: {
      atmosphericDread: 58,
      visualSymmetry: 91,
      existentialDepth: 97,
      philosophicalResonance: 95,
      pacingVelocity: 88,
      collectiveMomentum: 96,
      speculativeIndex: 86,
    },
    posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: 'OqK5K8mR71Y',
    streamProviders: ['JioCinema', 'Prime Video'],
    audioFormats: ['HD', '5.1 SURROUND'],
    audioTracks: ['odisha', 'hindi', 'english'],
    awardBadges: ['National Film Award Winner (Best Odia Feature)', 'Highest Rated Indian Drama']
  },
  {
    id: 'adieu-godard-2021',
    title: 'Adieu Godard',
    year: 2021,
    durationMinutes: 87,
    rating: 8.1,
    rottenTomatoes: 90,
    director: 'Amartya Bhattacharyya',
    cast: ['Choudhury Bikash Das', 'Dipanwit Dashmohapatra', 'Sudharsan Sahoo'],
    genres: ['Comedy', 'Drama'],
    narrativeVectors: ['True Stories', 'Music', 'History'],
    moodResonances: ['Thoughtful', 'Funny', 'Relaxed'],
    socialFit: ['solo', 'friends'],
    language: 'OD',
    tagline: 'When the French New Wave touches a rural Indian village.',
    synopsis: 'In a conservative Odisha village, an elderly pornography addict mistakenly receives a tape of Jean-Luc Godard\'s Breathless, unwittingly triggering a surreal cultural and cinephile renaissance in the hamlet.',
    aiHypothesisMatch: 'A wondrous meta-cinematic satire from Odisha. Playful existentialism, loving homage to the French New Wave, and witty cultural collision.',
    matchScore: 95,
    neuralMetrics: {
      atmosphericDread: 35,
      visualSymmetry: 94,
      existentialDepth: 93,
      philosophicalResonance: 96,
      pacingVelocity: 83,
      collectiveMomentum: 88,
      speculativeIndex: 94,
    },
    posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: 'n_Xo0bWdE5k',
    streamProviders: ['MUBI', 'Apple TV'],
    audioFormats: ['HD', 'STEREO ORIGINAL'],
    audioTracks: ['odisha', 'english'],
    awardBadges: ['Moscow International Film Festival Selection', 'UK Asian Film Festival Winner']
  },
  {
    id: 'super-deluxe-2019',
    title: 'Super Deluxe',
    year: 2019,
    durationMinutes: 176,
    rating: 8.3,
    rottenTomatoes: 92,
    director: 'Thiagarajan Kumararaja',
    cast: ['Vijay Sethupathi', 'Fahadh Faasil', 'Samantha Ruth Prabhu', 'Ramya Krishnan'],
    genres: ['Drama', 'Thriller', 'Comedy'],
    narrativeVectors: ['Mystery', 'Crime', 'Science'],
    moodResonances: ['Thoughtful', 'Funny', 'Excited'],
    socialFit: ['friends', 'solo', 'partner'],
    language: 'TA',
    tagline: 'An unexpected collision of destiny, alien encounters, and human desire.',
    synopsis: 'An unfaithful wife, an estranged transgender mother, a gang of teens, and a corrupt cop find their lives intertwining on one fateful day in Chennai.',
    aiHypothesisMatch: 'A kaleidoscopic tour de force of modern Indian neo-noir. Quantum randomness, biting humor, and tender familial grace.',
    matchScore: 97,
    neuralMetrics: {
      atmosphericDread: 82,
      visualSymmetry: 98,
      existentialDepth: 96,
      philosophicalResonance: 97,
      pacingVelocity: 91,
      collectiveMomentum: 95,
      speculativeIndex: 96,
    },
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: '3-Xq_ZCXsW4',
    streamProviders: ['Netflix'],
    audioFormats: ['4K DOLBY VISION', 'ATMOS'],
    audioTracks: ['tamil', 'telgu', 'hindi', 'kannada', 'english'],
    awardBadges: ['National Film Award Winner', 'International Cinephile Sensation']
  },
  {
    id: 'jai-bhim-2021',
    title: 'Jai Bhim',
    year: 2021,
    durationMinutes: 164,
    rating: 8.8,
    rottenTomatoes: 96,
    director: 'T.J. Gnanavel',
    cast: ['Suriya', 'Lijomol Jose', 'Manikandan', 'Rajisha Vijayan'],
    genres: ['Drama', 'Mystery'],
    narrativeVectors: ['True Stories', 'Crime', 'Mystery'],
    moodResonances: ['Emotional', 'Thoughtful'],
    socialFit: ['friends', 'solo', 'family'],
    language: 'TA',
    tagline: 'Truth is the ultimate shield.',
    synopsis: 'When a tribal man is falsely accused of theft and disappears from police custody, his pregnant wife seeks the help of an unyielding human rights advocate.',
    aiHypothesisMatch: 'Electrifying courtroom drama anchored by undeniable moral fury and empathetic realism. The highest rated Indian film on global database registries.',
    matchScore: 98,
    neuralMetrics: {
      atmosphericDread: 87,
      visualSymmetry: 91,
      existentialDepth: 98,
      philosophicalResonance: 96,
      pacingVelocity: 92,
      collectiveMomentum: 99,
      speculativeIndex: 78,
    },
    posterUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: 'Gc6dEDnL8JA',
    streamProviders: ['Prime Video'],
    audioFormats: ['4K HDR', 'DOLBY 5.1'],
    audioTracks: ['tamil', 'telgu', 'hindi', 'kannada', 'english'],
    awardBadges: ['Highest-Rated Legal Drama Globally', 'Noida International Film Festival']
  },
  {
    id: 'andhadhun-2018',
    title: 'Andhadhun',
    year: 2018,
    durationMinutes: 139,
    rating: 8.2,
    rottenTomatoes: 93,
    director: 'Sriram Raghavan',
    cast: ['Ayushmann Khurrana', 'Tabu', 'Radhika Apte', 'Anil Dhawan'],
    genres: ['Comedy', 'Thriller', 'Mystery'],
    narrativeVectors: ['Crime', 'Music', 'Mystery'],
    moodResonances: ['Funny', 'Excited', 'Thoughtful'],
    socialFit: ['friends', 'partner', 'solo'],
    language: 'HI',
    tagline: 'He couldn\'t see it coming.',
    synopsis: 'A piano player pretending to be visually impaired unwittingly becomes entangled in the murder of a former film star, sparking a dizzying spiral of deceit and frantic survival.',
    aiHypothesisMatch: 'Flawlessly calibrated dark comedy thriller. Sudden plot swerves, wicked piano pacing, and unpredictable moral ambiguity.',
    matchScore: 97,
    neuralMetrics: {
      atmosphericDread: 78,
      visualSymmetry: 94,
      existentialDepth: 88,
      philosophicalResonance: 90,
      pacingVelocity: 98,
      collectiveMomentum: 97,
      speculativeIndex: 85,
    },
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    trailerYoutubeId: '2TrKsPyeMqs',
    streamProviders: ['Netflix', 'JioCinema'],
    audioFormats: ['4K HDR', 'DOLBY ATMOS'],
    audioTracks: ['hindi', 'telgu', 'tamil', 'marathi', 'english'],
    awardBadges: ['3x National Film Award Winner', 'Critically Acclaimed Thriller']
  }
];

export interface LanguageAudioTrackOption {
  id: string; // 'english' | 'marathi' | 'hindi' | 'tamil' | 'telgu' | 'kannada' | 'odisha'
  label: string;
  badge: string;
  nativeName: string;
}

export const LANGUAGE_AUDIO_TRACKS: LanguageAudioTrackOption[] = [
  { id: 'english', label: 'English', badge: 'ENG', nativeName: 'English' },
  { id: 'marathi', label: 'Marathi', badge: 'MAR', nativeName: 'मराठी' },
  { id: 'hindi', label: 'Hindi', badge: 'HIN', nativeName: 'हिन्दी' },
  { id: 'tamil', label: 'Tamil', badge: 'TAM', nativeName: 'தமிழ்' },
  { id: 'telgu', label: 'Telugu', badge: 'TELGU', nativeName: 'తెలుగు' },
  { id: 'kannada', label: 'Kannada', badge: 'KAN', nativeName: 'ಕನ್ನಡ' },
  { id: 'odisha', label: 'Odisha', badge: 'ODIA', nativeName: 'ଓଡ଼ିଆ' }
];

export interface CalibrationState {
  moods: string[];
  narrativeVectors: string[];
  genres: string[];
  socialDynamic: 'solo' | 'family' | 'friends' | 'partner' | null;
  maxDuration: number; // in minutes, e.g. 135
  ratingThreshold: number; // e.g. 7.5
  audioLanguage: string; // e.g. 'english' | 'marathi' | 'hindi' | 'tamil' | 'telgu' | 'kannada' | 'odisha' | ''
  audioLanguages?: string[];
}

export const INITIAL_CALIBRATION: CalibrationState = {
  moods: [],
  narrativeVectors: [],
  genres: [],
  socialDynamic: null,
  maxDuration: 135, // 2h 15m
  ratingThreshold: 7.5,
  audioLanguage: '',
  audioLanguages: []
};

export function computeProfileHypothesis(state: CalibrationState): string {
  if (state.moods.length === 0 && state.narrativeVectors.length === 0 && state.genres.length === 0 && !state.socialDynamic && (!state.audioLanguages || state.audioLanguages.length === 0) && !state.audioLanguage) {
    return 'Awaiting neural signals. Select your affective resonance, story themes, group dynamic, and language audio tracks to synthesize an uncanny taste profile.';
  }
  const moodStr = state.moods.length > 0 ? state.moods.join(', ').toLowerCase() : 'open affective resonance';
  const dynamicMap: Record<string, string> = {
    solo: 'deep introspective immersion with unrestricted pacing',
    family: 'family-friendly cohesion and accessible wonder',
    friends: 'conversational momentum calibrated for collective viewing',
    partner: 'harmonized intimacy with captivating cinematic romance'
  };
  const socialText = state.socialDynamic ? (dynamicMap[state.socialDynamic] || 'collective viewing') : 'uncalibrated dynamic';

  const vectorHighlight = state.narrativeVectors.length > 0
    ? state.narrativeVectors.slice(0, 2).map(v => v.toLowerCase()).join(' & ')
    : 'open story themes';
  const genreHighlight = state.genres.length > 0
    ? state.genres.slice(0, 2).join('/')
    : 'eclectic cinema';

  const activeAudio = (state.audioLanguages && state.audioLanguages.length > 0)
    ? state.audioLanguages
    : (state.audioLanguage ? [state.audioLanguage] : []);
    
  const audioText = activeAudio.length > 0
    ? ` with ${activeAudio.map(a => a.toUpperCase()).join('/')} audio track affinity`
    : '';
  
  return `Neural matrix projecting toward ${genreHighlight.toLowerCase()} with ${socialText}${audioText}, accentuating ${vectorHighlight} resonance with ${moodStr}.`;
}

/**
 * Calculates a dynamic, authentic mathematical match score (0-100)
 * for a film given any combination of user calibration parameters.
 */
export function calculateMovieMatchScore(movie: Movie, state: CalibrationState, customQuery?: string): { score: number; rationale: string } {
  let score = 70; // baseline foundation

  // 1. Genre alignment (+6 per match, max +20)
  const genreMatches = movie.genres.filter(g => state.genres.includes(g));
  score += Math.min(genreMatches.length * 6, 20);

  // 2. Narrative Vector alignment (+5 per match, max +20)
  const vectorMatches = movie.narrativeVectors.filter(v => state.narrativeVectors.includes(v));
  score += Math.min(vectorMatches.length * 5, 20);

  // 3. Mood Resonance alignment (+4 per match, max +15)
  const moodMatches = movie.moodResonances.filter(m => state.moods.includes(m));
  score += Math.min(moodMatches.length * 4, 15);

  // 4. Social Dynamic fit (+8)
  if (state.socialDynamic && movie.socialFit.includes(state.socialDynamic)) {
    score += 8;
  }

  // 5. Language Audio Tracks alignment (+10 for match, slight penalty if explicit audio track requested and absent)
  const selectedAudio = (state.audioLanguages && state.audioLanguages.length > 0)
    ? state.audioLanguages
    : (state.audioLanguage ? [state.audioLanguage] : []);

  const movieTracks = (movie.audioTracks || ['english']).map(t => t.toLowerCase());

  if (selectedAudio.length > 0) {
    const hasAudioMatch = selectedAudio.some(req => {
      const r = req.toLowerCase();
      if (movieTracks.includes(r)) return true;
      if (r === 'telgu' && (movieTracks.includes('telugu') || movieTracks.includes('telgu'))) return true;
      if (r === 'odisha' && (movieTracks.includes('odia') || movieTracks.includes('odisha'))) return true;
      if (r === 'english' && (movieTracks.includes('en') || movieTracks.includes('english'))) return true;
      return false;
    });

    if (hasAudioMatch) {
      score += 10;
    } else {
      score -= 6;
    }
  }

  // 6. Rating bonus
  if (movie.rating >= state.ratingThreshold) {
    score += Math.min((movie.rating - state.ratingThreshold) * 6, 8);
  } else {
    score -= (state.ratingThreshold - movie.rating) * 8;
  }

  // 7. Runtime penalty if exceeds maxDuration
  if (movie.durationMinutes > state.maxDuration) {
    const overage = movie.durationMinutes - state.maxDuration;
    score -= Math.min(overage * 0.25, 12);
  } else {
    score += 3;
  }

  // 8. Custom query semantic keyword bonus
  if (customQuery && customQuery.trim().length > 0) {
    const q = customQuery.toLowerCase();
    const movieText = `${movie.title} ${movie.tagline} ${movie.synopsis} ${movie.director} ${movie.genres.join(' ')} ${movie.narrativeVectors.join(' ')} ${movieTracks.join(' ')}`.toLowerCase();
    const keywords = q.split(/\s+/).filter(w => w.length > 2);
    let keywordHits = 0;
    for (const kw of keywords) {
      if (movieText.includes(kw)) keywordHits++;
    }
    score += Math.min(keywordHits * 8, 22);
  }

  // Cap between 65 and 99
  const finalScore = Math.min(Math.max(Math.round(score), 68), 99);

  // Generate dynamic rationale
  const matchPoints: string[] = [];
  if (genreMatches.length > 0) matchPoints.push(`genre affinity for ${genreMatches.join(' & ')}`);
  if (vectorMatches.length > 0) matchPoints.push(`narrative vectors in ${vectorMatches.join(', ')}`);
  if (moodMatches.length > 0) matchPoints.push(`emotional tone matching ${moodMatches.join(', ')}`);
  if (selectedAudio.length > 0) {
    const matchingAudio = selectedAudio.filter(r => movieTracks.includes(r.toLowerCase()));
    if (matchingAudio.length > 0) {
      matchPoints.push(`${matchingAudio.map(a => a.toUpperCase()).join('/')} audio track availability`);
    }
  }

  const rationale = matchPoints.length > 0
    ? `Direct alignment with your ${matchPoints.join(', ')}.${state.socialDynamic ? ` Calibrated for ${state.socialDynamic} viewing dynamics.` : ''}`
    : movie.aiHypothesisMatch;

  return { score: finalScore, rationale };
}

/**
 * Returns movies re-ranked and re-scored dynamically against the calibration state
 */
export function getScoredRecommendations(movies: Movie[], state: CalibrationState, customQuery?: string): Movie[] {
  return movies.map(movie => {
    const { score, rationale } = calculateMovieMatchScore(movie, state, customQuery);
    return {
      ...movie,
      matchScore: score,
      aiHypothesisMatch: rationale
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}
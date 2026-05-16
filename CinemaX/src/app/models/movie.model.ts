export type MovieStatus = 'now_showing' | 'coming_soon' | 'archived';
export type MovieAgeRating = 'G' | 'PG' | 'PG-13' | '16+' | '18+';

export const MOVIE_STATUS_LABELS: Record<MovieStatus, string> = {
  now_showing: 'Now Showing',
  coming_soon: 'Coming Soon',
  archived: 'Archived',
};

export interface IMovieShowTime {
  id?: string;
  date?: string;
  time: string;
  endTime?: string;
  hall: string;
  seats: number;
  price: number;
  format: string;
  tag: string;
  pricing?: {
    standard: number;
    premium: number;
    vip: number;
  };
}

export interface IMovie {
  // MongoDB _id
  id: string;

  title: string;
  description?: string;

  // backend returns number (e.g., 169)
  duration?: number;

  rating: number;

  // backend uses machine values like: "now_showing"
  status: MovieStatus | string;

  // backend field is `genre: string[]`
  // (your backend sometimes returns `genres`)
  genres?: string[];

  // backend uses `posterUrl`
  image?: string;
  posterUrl?: string;

  // additional backend fields (optional in UI)
  releaseDate?: string;
  language?: string;
  trailerUrl?: string;
  ageRating?: MovieAgeRating;
}

export interface IMovieDetails extends IMovie {
  tagline: string;
  releaseDate: string;
  format: string;
  startingPrice: number;
  description: string;
  synopsis: string;
  director: string;
  cast: string;
  showtimes: IMovieShowTime[];
}

export interface ICreateMovieDto {
  title: string;
  tagline: string;
  duration: string;
  rating: string;
  status: MovieStatus;
  genres: string[];
  image: string;
  releaseDate: string;
  format: string;
  startingPrice: number;
  description: string;
  synopsis: string;
  director: string;
  cast: string;
}

export interface IUpdateMovieDto extends Partial<ICreateMovieDto> {
  id: string;
}

export interface IMoviesResponse {
  movies: IMovie[];
  total: number;
}

export interface IMovieResponse {
  movie: IMovieDetails;
  success: boolean;
  message?: string;
}

export const MOVIE_GENRES: string[] = [
  'Sci-Fi',
  'Adventure',
  'Thriller',
  'Action',
  'Drama',
  'Comedy',
  'Horror',
  'Romance',
  'Mystery',
  'Crime',
  'Sports',
  'Supernatural',
];

export const MOVIE_AGE_RATINGS: MovieAgeRating[] = ['G', 'PG', 'PG-13', '16+', '18+'];

export const FALLBACK_MOVIE_DETAILS: IMovieDetails = {
  id: 'fallback',
  title: 'CinemaX Feature',
  tagline: 'A cinematic story about discovery and connection.',
  status: 'now_showing',
  duration: 120,
  releaseDate: 'May 10, 2026',
  rating: 8.0,
  ageRating: 'PG',
  genres: ['Drama', 'Adventure'],
  format: 'Standard',
  image: 'https://images.unsplash.com/photo-1497032205916-ac775f0649ae?auto=format&fit=crop&w=900&q=80',
  startingPrice: 11,
  description: 'A cinematic story about discovery, connection, and the power of hope in a changing world.',
  synopsis:
    'A group of strangers discover their lives are more connected than they imagined. Through unexpected friendships and difficult choices, they learn how to move forward together.',
  director: 'A. Patel',
  cast: 'C. Johnson, E. Morales, K. Lee',
  showtimes: [
    { time: '1:30 PM', hall: 'Hall A', seats: 28, price: 11, format: '2D', tag: 'SCHEDULED' },
    { time: '5:00 PM', hall: 'Hall B', seats: 37, price: 13, format: '3D', tag: 'SCHEDULED' },
  ],
};

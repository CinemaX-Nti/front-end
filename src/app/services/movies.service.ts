import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';

// This interface represents the movie object used across the UI.
// It is mapped from the backend response (e.g. _id, genre, posterUrl).
export interface iMovie {
  id: string;
  title: string;
  duration: string;
  rating: string;
  status: 'Now Showing' | 'Coming Soon' | 'New' | string;
  genres: string[];
  image: string;
}

export interface iMovieShowtime {
  id: string;
  time: string;
  hall: string;
  seats: number;
  price: number;
  format: string;
  tag: string;
}

export interface iMovieDetails {
  id: string;
  title: string;
  status: string;
  duration: string;
  releaseDate: string;
  rating: string;
  genres: string[];
  image: string;
  startingPrice: number;
  description: string;
  synopsis: string;
  showtimes: iMovieShowtime[];
  trailerUrl: string;
}

interface MoviesResponse {
  success: boolean;
  data: unknown[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class MoviesService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private apiUrl = 'http://localhost:3000/movies';

  getMovies(): Observable<iMovie[]> {
    return this.http.get<MoviesResponse | unknown[]>(`${this.apiUrl}?limit=100`, this.requestOptions()).pipe(
      map((response) =>
        this.extractMovieArray(response)
          .map((movie) => this.toiMovie(movie))
          .filter((movie) => Boolean(movie.id && movie.title))
      )
    );
  }

  getMovieDetails(movieId: string): Observable<iMovieDetails> {
    return this.http.get<{ success: boolean; data: any }>(
      `${this.apiUrl}/${movieId}/showtimes`,
      this.requestOptions(),
    ).pipe(
      map((response) => this.toMovieDetails(response.data?.movie, response.data?.showTimes ?? [])),
    );
  }

  private toiMovie(m: any): iMovie {
    return {
      id: String(m?.id ?? m?._id ?? ''),
      title: this.toDisplayTitle(String(m?.title ?? m?.name ?? '')),
      duration: `${String(m?.duration ?? m?.runtime ?? '')} min`,
      rating: String(m?.rating ?? m?.score ?? ''),
      status: this.toDisplayStatus(String(m?.status ?? 'now_showing')),
      genres: Array.isArray(m?.genres)
        ? m.genres.map((g: any) => this.toDisplayGenre(String(g)))
        : Array.isArray(m?.genre)
          ? m.genre.map((g: any) => this.toDisplayGenre(String(g)))
          : [],
      image: String(m?.image ?? m?.poster ?? m?.posterUrl ?? ''),
    };
  }

  private toMovieDetails(movie: any, showtimes: any[]): iMovieDetails {
    const mappedShowtimes = Array.isArray(showtimes)
      ? showtimes.map((showtime) => this.toMovieShowtime(showtime))
      : [];

    const startingPrice = mappedShowtimes.length > 0
      ? Math.min(...mappedShowtimes.map((showtime) => showtime.price))
      : 0;

    return {
      id: String(movie?._id ?? movie?.id ?? ''),
      title: this.toDisplayTitle(String(movie?.title ?? '')),
      status: this.toDisplayStatus(String(movie?.status ?? 'now_showing')),
      duration: `${String(movie?.duration ?? '')} min`,
      releaseDate: movie?.releaseDate ? new Date(movie.releaseDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) : 'TBA',
      rating: String(movie?.rating ?? 'N/A'),
      genres: Array.isArray(movie?.genre)
        ? movie.genre.map((genre: string) => this.toDisplayGenre(genre))
        : [],
      image: String(movie?.posterUrl ?? movie?.image ?? ''),
      startingPrice,
      description: String(movie?.description ?? ''),
      synopsis: String(movie?.description ?? ''),
      showtimes: mappedShowtimes,
      trailerUrl: String(movie?.trailerUrl ?? ''),
    };
  }

  private toMovieShowtime(showtime: any): iMovieShowtime {
    const prices = [
      Number(showtime?.pricing?.standard ?? Number.MAX_SAFE_INTEGER),
      Number(showtime?.pricing?.premium ?? Number.MAX_SAFE_INTEGER),
      Number(showtime?.pricing?.vip ?? Number.MAX_SAFE_INTEGER),
    ].filter((value) => Number.isFinite(value) && value > 0);

    return {
      id: String(showtime?._id ?? ''),
      time: showtime?.startTime ? new Date(showtime.startTime).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      }) : 'TBA',
      hall: String(showtime?.hallId?.name ?? 'Unknown hall'),
      seats: Number(showtime?.availableSeats ?? 0),
      price: prices.length > 0 ? Math.min(...prices) : 0,
      format: String(showtime?.format ?? '2D'),
      tag: this.toShowtimeTag(String(showtime?.status ?? 'scheduled')),
    };
  }

  private toDisplayStatus(status: string): iMovie['status'] {
    switch (status) {
      case 'coming_soon':
        return 'Coming Soon';
      case 'archived':
        return 'Archived';
      default:
        return 'Now Showing';
    }
  }

  private toDisplayGenre(genre: string): string {
    if (!genre) {
      return '';
    }

    return genre
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('-');
  }

  private toDisplayTitle(title: string): string {
    if (!title) {
      return '';
    }

    return title.replace(/\b\w/g, (character) => character.toUpperCase());
  }

  private toShowtimeTag(status: string): string {
    switch (status) {
      case 'running':
        return 'LIVE';
      case 'finished':
        return 'FINISHED';
      case 'cancelled':
        return 'CANCELLED';
      default:
        return 'SCHEDULED';
    }
  }

  private extractMovieArray(response: MoviesResponse | unknown[]): any[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data as any[];
    }

    if (
      response &&
      typeof response === 'object' &&
      'data' in response &&
      response.data &&
      typeof response.data === 'object' &&
      'data' in (response.data as Record<string, unknown>) &&
      Array.isArray((response.data as Record<string, unknown>)['data'])
    ) {
      return (response.data as Record<string, unknown>)['data'] as any[];
    }

    return [];
  }

  private requestOptions(): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders(this.authService.getAuthHeaders()),
    };
  }
}


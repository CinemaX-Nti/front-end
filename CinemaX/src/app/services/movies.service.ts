import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { shareReplay } from 'rxjs/operators';
import { IMovie, IMovieDetails, IMovieShowTime } from '../models/movie.model';
import { environment } from '../../environments/environment';

interface BackendShowtime {
  _id: string;
  startTime: string;
  endTime: string;
  format?: '2D' | '3D' | 'IMAX';
  status: 'scheduled' | 'running' | 'finished' | 'cancelled';
  availableSeats?: number;
  pricing?: {
    standard: number;
    premium: number;
    vip: number;
  };
  hallId?: {
    _id: string;
    name: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class MoviesService {
  private http = inject(HttpClient);

  private apiUrl = `${environment.api.baseUrl}/movies`;

  private movies$?: Observable<IMovie[]>;

  getMovies(): Observable<IMovie[]> {
    if (!this.movies$) {
      this.movies$ = this.http.get<IMovie[]>(this.apiUrl).pipe(
        map((response: any) => {
          const rawMovies = Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : [];
          return (rawMovies ?? []).map((movie: any) => this.normalizeMovie(movie));
        }),
        shareReplay(1),
      );
    }
    return this.movies$;
  }

  getMovieById(id: string): Observable<IMovieDetails> {
    return forkJoin({
      movies: this.getMovies(),
      showtimes: this.getShowtimesByMovieId(id),
    }).pipe(
      map(({ movies, showtimes }) => {
        const movie = movies.find((entry) => entry.id === id);
        return this.enrichMovieDetails(movie ?? this.createFallbackMovie(id), showtimes);
      }),
    );
  }

  getShowtimesByMovieId(movieId: string): Observable<IMovieShowTime[]> {
    return this.http.get<BackendShowtime[]>(`${environment.api.baseUrl}/showtimes?movieId=${movieId}`).pipe(
      map((response) => {
        const rawShowtimes = Array.isArray(response) ? response : [];
        return rawShowtimes.map((showtime) => this.normalizeShowtime(showtime));
      }),
    );
  }

  private normalizeMovie(movie: any): IMovie {
    return {
      ...movie,
      id: movie.id ?? movie._id,
      genres: movie.genres ?? movie.genre ?? [],
      image: movie.image ?? movie.posterUrl ?? 'images/layout-landingpage.png',
      language: movie.language ?? 'English',
      duration: typeof movie.duration === 'number' ? movie.duration : undefined,
      rating: typeof movie.rating === 'number' ? movie.rating : movie.rating ? Number(movie.rating) : 0,
      status: movie.status ?? 'now_showing',
    } as IMovie;
  }

  private enrichMovieDetails(movie: IMovie, showtimes: IMovieShowTime[]): IMovieDetails {
    const titleSeed = movie.title || 'CinemaX Feature';
    const primaryGenre = movie.genres?.[0] ?? 'Sci-Fi';
    const description =
      movie.description ??
      `An epic ${primaryGenre.toLowerCase()} experience filled with atmosphere, momentum, and a night worth booking early.`;
    const normalizedShowtimes = showtimes.length > 0 ? showtimes : this.buildFallbackShowtimes(movie);
    const startingPrice = normalizedShowtimes.length > 0
      ? Math.min(...normalizedShowtimes.map((showtime) => showtime.pricing?.standard ?? showtime.price))
      : 0;

    return {
      ...movie,
      title: titleSeed,
      tagline: `${titleSeed} lights up the screen with a premium cinematic event.`,
      releaseDate: movie.releaseDate ?? 'May 1, 2026',
      format: normalizedShowtimes[0]?.format ?? '2D',
      startingPrice,
      description,
      synopsis: `${description} Discover a richly crafted story, immersive visuals, and performances designed for the big screen.`,
      director: 'CinemaX Studio',
      cast: 'Lead Cast Ensemble',
      showtimes: normalizedShowtimes,
    };
  }

  private normalizeShowtime(showtime: BackendShowtime): IMovieShowTime {
    const startTime = new Date(showtime.startTime);
    const endTime = new Date(showtime.endTime);

    return {
      id: showtime._id,
      date: showtime.startTime,
      time: this.formatClockTime(startTime),
      endTime: this.formatClockTime(endTime),
      hall: showtime.hallId?.name ?? 'Main Hall',
      seats: showtime.availableSeats ?? 0,
      price: showtime.pricing?.standard ?? 0,
      format: showtime.format ?? '2D',
      tag: this.formatShowtimeStatus(showtime.status),
      pricing: showtime.pricing,
    };
  }

  private buildFallbackShowtimes(movie: IMovie): IMovieShowTime[] {
    const releaseBase = movie.releaseDate ?? '2026-05-15';
    const dates = ['2026-05-15', '2026-05-16', '2026-05-17'];
    const normalizedDates = dates.includes(releaseBase) ? dates : [releaseBase, '2026-05-16', '2026-05-17'];

    const templates = [
      { time: '14:00', endTime: '16:30', hall: 'Hall 1', format: '2D', seats: 45, pricing: { standard: 12, premium: 18, vip: 25 } },
      { time: '17:00', endTime: '19:30', hall: 'Hall 2', format: 'IMAX', seats: 28, pricing: { standard: 15, premium: 22, vip: 30 } },
      { time: '20:00', endTime: '22:30', hall: 'Hall 1', format: '3D', seats: 52, pricing: { standard: 14, premium: 20, vip: 28 } },
      { time: '15:00', endTime: '17:30', hall: 'Hall 1', format: '2D', seats: 67, pricing: { standard: 12, premium: 18, vip: 25 } },
      { time: '18:30', endTime: '21:00', hall: 'Hall 2', format: 'IMAX', seats: 15, pricing: { standard: 15, premium: 22, vip: 30 } },
    ];

    return templates.map((template, index) => {
      const date = normalizedDates[index < 3 ? 0 : 1];
      return {
        id: `${movie.id}-showtime-${index + 1}`,
        date,
        time: template.time,
        endTime: template.endTime,
        hall: template.hall,
        seats: template.seats,
        price: template.pricing.standard,
        format: template.format,
        tag: 'Scheduled',
        pricing: template.pricing,
      };
    });
  }

  private createFallbackMovie(id: string): IMovie {
    return {
      id,
      title: 'Stellar Odyssey',
      description:
        'An epic journey through the cosmos as a crew of astronauts discover ancient alien technology that holds the key to humanity’s survival.',
      duration: 150,
      rating: 8.5,
      status: 'now_showing',
      genres: ['Sci-Fi', 'Adventure', 'Drama'],
      image: 'images/movies-1.png',
      releaseDate: '2026-05-01',
      language: 'English',
      trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    };
  }

  private formatClockTime(value: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(value);
  }

  private formatShowtimeStatus(status: BackendShowtime['status']): string {
    if (status === 'running') {
      return 'Now Running';
    }

    if (status === 'finished') {
      return 'Finished';
    }

    if (status === 'cancelled') {
      return 'Cancelled';
    }

    return 'Scheduled';
  }
}

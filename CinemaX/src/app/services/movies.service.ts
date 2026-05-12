import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

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


@Injectable({
  providedIn: 'root',
})
export class MoviesService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:5000/movies';

  getMovies(): Observable<iMovie[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((items) =>
        (items ?? []).map((m) => this.toiMovie(m))
      )
    );
  }

  private toiMovie(m: any): iMovie {
    return {
      id: String(m?.id ?? m?._id ?? ''),
      title: String(m?.title ?? m?.name ?? ''),
      duration: String(m?.duration ?? m?.runtime ?? ''),
      rating: String(m?.rating ?? m?.score ?? ''),
      status: (m?.status ?? 'Now Showing') as iMovie['status'],
      genres: Array.isArray(m?.genres)
        ? m.genres.map((g: any) => String(g))
        : Array.isArray(m?.genre)
          ? m.genre.map((g: any) => String(g))
          : [],
    
      image: String(m?.image ?? m?.poster ?? ''),
    };
  }
}


import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MoviesService, iMovieDetails } from '../../services/movies.service';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './movie-details.html',
  styleUrls: ['./movie-details.css'],
})
export class MovieDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly moviesService = inject(MoviesService);

  protected movieId: string | null = null;
  protected isLoading = true;
  protected errorMessage = '';
  protected movie: iMovieDetails = this.createFallbackMovie();

  ngOnInit(): void {
    this.movieId = this.route.snapshot.paramMap.get('id');

    if (!this.movieId) {
      this.isLoading = false;
      this.errorMessage = 'Movie not found.';
      return;
    }

    this.loadMovieDetails(this.movieId);
  }

  protected openTrailer(): void {
    if (!this.movie.trailerUrl) {
      this.errorMessage = 'No trailer link is saved for this movie yet.';
      return;
    }

    window.open(this.movie.trailerUrl, '_blank', 'noopener,noreferrer');
  }

  private loadMovieDetails(movieId: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.moviesService.getMovieDetails(movieId).subscribe({
      next: (movie) => {
        this.movie = movie;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to load movie details.';
        this.isLoading = false;
      },
    });
  }

  private createFallbackMovie(): iMovieDetails {
    return {
      id: '',
      title: 'CinemaX Feature',
      status: 'Now Showing',
      duration: '120 min',
      releaseDate: 'TBA',
      rating: 'N/A',
      genres: ['Drama'],
      image: 'https://images.unsplash.com/photo-1497032205916-ac775f0649ae?auto=format&fit=crop&w=900&q=80',
      startingPrice: 0,
      description: 'Movie details will appear here once the backend data is loaded.',
      synopsis: 'Movie details will appear here once the backend data is loaded.',
      showtimes: [],
      trailerUrl: '',
    };
  }
}

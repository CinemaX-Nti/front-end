import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  AdminDashboardService,
  AdminMovie,
  CreateMoviePayload,
} from '../../../services/admin-dashboard.service';

@Component({
  selector: 'app-admin-movies-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-movies-management.html',
  styleUrl: './admin-movies-management.css',
})
export class AdminMoviesManagementPage implements OnInit {
  private readonly adminService = inject(AdminDashboardService);

  protected readonly languageOptions = ['English', 'Arabic'];
  protected readonly movieGenreOptions = [
    'action', 'adventure', 'animation', 'biography', 'comedy', 'crime', 'documentary',
    'drama', 'family', 'fantasy', 'history', 'horror', 'music', 'mystery', 'romance',
    'sci-fi', 'sport', 'thriller', 'war', 'western',
  ];

  protected movies: AdminMovie[] = [];
  protected isLoading = true;
  protected isSubmitting = false;
  protected feedbackMessage = '';
  protected feedbackTone: 'success' | 'error' = 'success';

  protected movieForm = {
    title: '',
    description: '',
    duration: 120,
    genreInput: 'action',
    language: 'English',
    releaseDate: '',
    trailerUrl: '',
    posterUrl: '',
    rating: 8,
    status: 'now_showing' as 'now_showing' | 'coming_soon' | 'archived',
  };

  ngOnInit(): void {
    this.loadMovies();
  }

  protected loadMovies(): void {
    this.isLoading = true;
    this.adminService.getMovies().subscribe({
      next: (movies) => {
        this.movies = movies;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showError('Unable to load movies.');
      },
    });
  }

  protected submitMovie(): void {
    const payload: CreateMoviePayload = {
      title: this.movieForm.title.trim(),
      description: this.movieForm.description.trim(),
      duration: Number(this.movieForm.duration),
      genre: this.movieForm.genreInput.split(',').map((genre) => genre.trim().toLowerCase()).filter(Boolean),
      language: this.movieForm.language.trim() || undefined,
      releaseDate: this.movieForm.releaseDate || undefined,
      trailerUrl: this.movieForm.trailerUrl.trim() || undefined,
      posterUrl: this.movieForm.posterUrl.trim(),
      rating: Number(this.movieForm.rating),
      status: this.movieForm.status,
    };

    if (!payload.title || !payload.description || !payload.posterUrl || payload.genre.length === 0) {
      this.showError('Title, description, poster URL, and at least one genre are required.');
      return;
    }

    this.isSubmitting = true;
    this.adminService.createMovie(payload).subscribe({
      next: (movie) => {
        this.movies = [movie, ...this.movies];
        this.resetForm();
        this.isSubmitting = false;
        this.showSuccess(`Movie "${movie.title}" was created.`);
      },
      error: (error: unknown) => {
        this.isSubmitting = false;
        this.showError(this.extractErrorMessage(error, 'Movie creation failed.'));
      },
    });
  }

  protected deleteMovie(movie: AdminMovie): void {
    if (!window.confirm(`Delete "${movie.title}" from the active catalog?`)) {
      return;
    }

    this.adminService.deleteMovie(movie.id).subscribe({
      next: () => {
        this.movies = this.movies.filter((item) => item.id !== movie.id);
        this.showSuccess(`Movie "${movie.title}" was deleted.`);
      },
      error: () => {
        this.showError('Movie deletion failed.');
      },
    });
  }

  protected toggleGenre(genre: string): void {
    const selectedGenres = this.movieForm.genreInput
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    this.movieForm.genreInput = selectedGenres.includes(genre)
      ? selectedGenres.filter((item) => item !== genre).join(', ')
      : [...selectedGenres, genre].join(', ');
  }

  protected hasGenre(genre: string): boolean {
    return this.movieForm.genreInput
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
      .includes(genre);
  }

  protected statusLabel(status: string): string {
    return status.replace(/_/g, ' ');
  }

  protected trackById(_index: number, item: { id: string }): string {
    return item.id;
  }

  private resetForm(): void {
    this.movieForm = {
      title: '',
      description: '',
      duration: 120,
      genreInput: 'action',
      language: 'English',
      releaseDate: '',
      trailerUrl: '',
      posterUrl: '',
      rating: 8,
      status: 'now_showing',
    };
  }

  private showSuccess(message: string): void {
    this.feedbackMessage = message;
    this.feedbackTone = 'success';
  }

  private showError(message: string): void {
    this.feedbackMessage = message;
    this.feedbackTone = 'error';
  }

  private extractErrorMessage(error: unknown, fallback: string): string {
    if (
      typeof error === 'object' &&
      error !== null &&
      'error' in error &&
      typeof error.error === 'object' &&
      error.error !== null &&
      'errors' in error.error &&
      Array.isArray(error.error.errors) &&
      error.error.errors.length > 0
    ) {
      const firstError = error.error.errors[0];
      if (typeof firstError === 'object' && firstError !== null && 'message' in firstError && typeof firstError.message === 'string') {
        return firstError.message;
      }
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'error' in error &&
      typeof error.error === 'object' &&
      error.error !== null &&
      'message' in error.error &&
      typeof error.error.message === 'string'
    ) {
      return error.error.message;
    }

    return fallback;
  }
}

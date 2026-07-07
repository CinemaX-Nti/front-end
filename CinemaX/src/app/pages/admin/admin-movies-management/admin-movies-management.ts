import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  AdminDashboardService,
  AdminMovie,
  CreateMoviePayload,
  UpdateMoviePayload,
} from '../../../services/admin-dashboard.service';
import { MOVIE_AGE_RATINGS, MovieAgeRating } from '../../../models/movie.model';

@Component({
  selector: 'app-admin-movies-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-movies-management.html',
  styleUrl: './admin-movies-management.css',
})
export class AdminMoviesManagementPage implements OnInit {
  private readonly adminService = inject(AdminDashboardService);

  protected readonly languageOptions = ['english', 'arabic'];
  protected readonly ageRatingOptions = MOVIE_AGE_RATINGS;
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
  protected editingMovieId: string | null = null;

  protected movieForm = {
    title: '',
    description: '',
    duration: 120,
    genreInput: 'action',
    language: 'english',
    releaseDate: '',
    trailerUrl: '',
    posterUrl: '',
    rating: 8,
    ageRating: 'PG' as MovieAgeRating,
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
      language: this.normalizeLanguage(this.movieForm.language) || undefined,
      releaseDate: this.movieForm.releaseDate || undefined,
      trailerUrl: this.movieForm.trailerUrl.trim() || undefined,
      posterUrl: this.movieForm.posterUrl.trim(),
      rating: Number(this.movieForm.rating),
      ageRating: this.movieForm.ageRating,
      status: this.movieForm.status,
    };

    if (!payload.title || !payload.description || !payload.posterUrl || payload.genre.length === 0) {
      this.showError('Title, description, poster URL, and at least one genre are required.');
      return;
    }

    this.isSubmitting = true;
    if (this.editingMovieId) {
      const updatePayload: UpdateMoviePayload = payload;
      this.adminService.updateMovie(this.editingMovieId, updatePayload).subscribe({
        next: (movie) => {
          this.movies = this.movies.map((item) => item.id === movie.id ? movie : item);
          this.resetForm();
          this.isSubmitting = false;
          this.showSuccess(`Movie "${movie.title}" was updated.`);
        },
        error: (error: unknown) => {
          this.isSubmitting = false;
          this.showError(this.extractErrorMessage(error, 'Movie update failed.'));
        },
      });
      return;
    }

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

  protected editMovie(movie: AdminMovie): void {
    this.editingMovieId = movie.id;
    this.movieForm = {
      title: movie.title,
      description: movie.description,
      duration: movie.duration,
      genreInput: movie.genres.join(', '),
      language: this.normalizeLanguage(movie.language),
      releaseDate: this.normalizeDateInput(movie.releaseDate),
      trailerUrl: movie.trailerUrl,
      posterUrl: movie.posterUrl,
      rating: movie.rating ?? 0,
      ageRating: movie.ageRating,
      status: movie.status,
    };
    this.feedbackMessage = '';
  }

  protected cancelEdit(): void {
    this.resetForm();
    this.feedbackMessage = '';
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
    this.editingMovieId = null;
    this.movieForm = {
      title: '',
      description: '',
      duration: 120,
      genreInput: 'action',
      language: 'english',
      releaseDate: '',
      trailerUrl: '',
      posterUrl: '',
      rating: 8,
      ageRating: 'PG',
      status: 'now_showing',
    };
  }

  private normalizeDateInput(dateValue: string): string {
    if (!dateValue) {
      return '';
    }

    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) {
      return '';
    }

    return parsedDate.toISOString().split('T')[0];
  }

  private normalizeLanguage(language?: string): string {
    const normalized = (language ?? '').trim().toLowerCase();

    if (['english', 'en'].includes(normalized)) {
      return 'english';
    }

    if (['arabic', 'ar', 'العربية', 'عربي', 'arab'].includes(normalized)) {
      return 'arabic';
    }

    return 'english';
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

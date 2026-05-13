import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  AdminDashboardService,
  AdminHall,
  AdminMovie,
  AdminShowtime,
  CreateShowtimePayload,
} from '../../../services/admin-dashboard.service';

@Component({
  selector: 'app-admin-showtimes-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-showtimes-management.html',
  styleUrl: './admin-showtimes-management.css',
})
export class AdminShowtimesManagementPage implements OnInit {
  private readonly adminService = inject(AdminDashboardService);

  protected movies: AdminMovie[] = [];
  protected halls: AdminHall[] = [];
  protected showtimes: AdminShowtime[] = [];
  protected isLoading = true;
  protected isSubmitting = false;
  protected feedbackMessage = '';
  protected feedbackTone: 'success' | 'error' = 'success';

  protected showtimeForm = {
    movieId: '',
    hallId: '',
    startTime: '',
    endTime: '',
    format: '2D' as '2D' | '3D' | 'IMAX',
    standardPrice: 120,
    premiumPrice: 180,
    vipPrice: 250,
  };

  ngOnInit(): void {
    this.loadData();
  }

  protected loadData(): void {
    this.isLoading = true;
    forkJoin({
      movies: this.adminService.getMovies(),
      halls: this.adminService.getHalls(),
      showtimes: this.adminService.getShowtimes(),
    }).subscribe({
      next: ({ movies, halls, showtimes }) => {
        this.movies = movies;
        this.halls = halls;
        this.showtimes = showtimes;
        this.showtimeForm.movieId = this.movies[0]?.id ?? '';
        this.showtimeForm.hallId = this.halls[0]?.id ?? '';
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showError('Unable to load showtime data.');
      },
    });
  }

  protected submitShowtime(): void {
    const payload: CreateShowtimePayload = {
      movieId: this.showtimeForm.movieId,
      hallId: this.showtimeForm.hallId,
      startTime: this.toIsoDateTime(this.showtimeForm.startTime),
      endTime: this.toIsoDateTime(this.showtimeForm.endTime),
      format: this.showtimeForm.format,
      pricing: {
        standard: Number(this.showtimeForm.standardPrice),
        premium: Number(this.showtimeForm.premiumPrice),
        vip: Number(this.showtimeForm.vipPrice),
      },
    };

    if (!payload.movieId || !payload.hallId || !payload.startTime || !payload.endTime) {
      this.showError('Movie, hall, start time, and end time are required.');
      return;
    }

    this.isSubmitting = true;
    this.adminService.createShowtime(payload).subscribe({
      next: (showtime) => {
        this.showtimes = [...this.showtimes, showtime].sort((left, right) => left.startTime.localeCompare(right.startTime));
        this.resetForm();
        this.isSubmitting = false;
        this.showSuccess(`Showtime for "${showtime.movieTitle}" was scheduled.`);
      },
      error: (error: unknown) => {
        this.isSubmitting = false;
        this.showError(this.extractErrorMessage(error, 'Showtime creation failed.'));
      },
    });
  }

  protected statusLabel(status: string): string {
    return status.replace(/_/g, ' ');
  }

  protected formatDate(value: string): string {
    return new Date(value).toLocaleString();
  }

  protected trackById(_index: number, item: { id: string }): string {
    return item.id;
  }

  private toIsoDateTime(value: string): string {
    return value ? new Date(value).toISOString() : '';
  }

  private resetForm(): void {
    this.showtimeForm = {
      movieId: this.movies[0]?.id ?? '',
      hallId: this.halls[0]?.id ?? '',
      startTime: '',
      endTime: '',
      format: '2D',
      standardPrice: 120,
      premiumPrice: 180,
      vipPrice: 250,
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
      'message' in error.error &&
      typeof error.error.message === 'string'
    ) {
      return error.error.message;
    }
    return fallback;
  }
}

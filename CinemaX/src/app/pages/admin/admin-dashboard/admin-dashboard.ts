import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  AdminDashboardService,
  AdminHall,
  AdminMenuItem,
  AdminMovie,
  AdminPendingBooking,
  AdminShowtime,
  AdminUserRecord,
  CreateHallPayload,
  CreateMenuItemPayload,
  CreateMoviePayload,
  CreateShowtimePayload,
} from '../../../services/admin-dashboard.service';

type DashboardStat = {
  label: string;
  value: string;
  accent: 'blue' | 'green' | 'purple' | 'amber';
};

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboardPage implements OnInit {
  private readonly adminService = inject(AdminDashboardService);

  protected readonly languageOptions = ['English', 'Arabic'];
  protected readonly movieGenreOptions = [
    'action',
    'adventure',
    'animation',
    'biography',
    'comedy',
    'crime',
    'documentary',
    'drama',
    'family',
    'fantasy',
    'history',
    'horror',
    'music',
    'mystery',
    'romance',
    'sci-fi',
    'sport',
    'thriller',
    'war',
    'western',
  ];
  protected readonly menuCategoryOptions = ['snacks', 'beverages', 'combo', 'desserts'];
  protected readonly hallTemplates = [
    { label: 'Small Hall', rows: 6, cols: 10, standardRows: 'A,B,C,D', premiumRows: 'E', vipRows: 'F' },
    { label: 'Standard Hall', rows: 8, cols: 12, standardRows: 'A,B,C,D', premiumRows: 'E,F', vipRows: 'G,H' },
    { label: 'Large Hall', rows: 10, cols: 14, standardRows: 'A,B,C,D,E,F', premiumRows: 'G,H', vipRows: 'I,J' },
  ];
  protected readonly dashboardLinks = [
    { label: 'Movies', href: '#movies-section', action: 'Add movie', accent: 'blue' as const, section: 'movies' as const },
    { label: 'Halls', href: '#halls-section', action: 'Add hall', accent: 'green' as const, section: 'halls' as const },
    { label: 'Showtimes', href: '#showtimes-section', action: 'Schedule', accent: 'purple' as const, section: 'showtimes' as const },
    { label: 'Menu', href: '#menu-section', action: 'Add item', accent: 'amber' as const, section: 'menu' as const },
    { label: 'Users', href: '#users-section', action: 'Review', accent: 'slate' as const, section: 'users' as const },
  ];

  protected isLoading = true;
  protected isSubmittingMovie = false;
  protected isSubmittingHall = false;
  protected isSubmittingShowtime = false;
  protected isSubmittingMenuItem = false;
  protected feedbackMessage = '';
  protected feedbackTone: 'success' | 'error' = 'success';

  protected movies: AdminMovie[] = [];
  protected halls: AdminHall[] = [];
  protected showtimes: AdminShowtime[] = [];
  protected menuItems: AdminMenuItem[] = [];
  protected users: AdminUserRecord[] = [];
  protected pendingPayments: AdminPendingBooking[] = [];

  protected stats: DashboardStat[] = [];

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

  protected hallForm = {
    template: 'Standard Hall',
    name: '',
    rows: 8,
    cols: 12,
    availability: true,
    standardRows: 'A,B,C,D',
    premiumRows: 'E,F',
    vipRows: 'G,H',
  };

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

  protected menuForm = {
    name: '',
    description: '',
    category: 'snacks',
    price: 75,
    isAvailable: true,
  };

  ngOnInit(): void {
    this.loadDashboard();
  }

  protected loadDashboard(): void {
    this.isLoading = true;
    this.clearFeedback();

    forkJoin({
      movies: this.adminService.getMovies(),
      halls: this.adminService.getHalls(),
      showtimes: this.adminService.getShowtimes(),
      menuItems: this.adminService.getMenuItems(),
      users: this.adminService.getUsers(),
      pendingPayments: this.adminService.getPendingPayments(),
    }).subscribe({
      next: ({ movies, halls, showtimes, menuItems, users, pendingPayments }) => {
        this.movies = movies;
        this.halls = halls;
        this.showtimes = showtimes;
        this.menuItems = menuItems;
        this.users = users;
        this.pendingPayments = pendingPayments;
        this.stats = this.buildStats();
        this.prefillShowtimeSelectors();
        this.isLoading = false;
      },
      error: (error: unknown) => {
        this.isLoading = false;
        this.showError(this.extractErrorMessage(error, 'Unable to load admin dashboard data.'));
      },
    });
  }

  protected submitMovie(): void {
    const payload: CreateMoviePayload = {
      title: this.movieForm.title.trim(),
      description: this.movieForm.description.trim(),
      duration: Number(this.movieForm.duration),
      genre: this.movieForm.genreInput
        .split(',')
        .map((genre) => genre.trim().toLowerCase())
        .filter((genre) => genre.length > 0),
      language: this.movieForm.language.trim() || undefined,
      releaseDate: this.movieForm.releaseDate || undefined,
      trailerUrl: this.movieForm.trailerUrl.trim() || undefined,
      posterUrl: this.movieForm.posterUrl.trim(),
      rating: Number(this.movieForm.rating),
      status: this.movieForm.status,
    };

    if (!payload.title || !payload.description || !payload.posterUrl || payload.genre.length === 0) {
      this.showError('Movie title, description, poster URL, and at least one genre are required.');
      return;
    }

    if (payload.description.length < 10) {
      this.showError('Description must be at least 10 characters.');
      return;
    }

    if (!this.isValidUrl(payload.posterUrl)) {
      this.showError('Poster URL must be a valid full link.');
      return;
    }

    if (payload.trailerUrl && !this.isValidUrl(payload.trailerUrl)) {
      this.showError('Trailer URL must be a valid full link.');
      return;
    }

    this.isSubmittingMovie = true;
    this.adminService.createMovie(payload).subscribe({
      next: (movie) => {
        this.movies = [movie, ...this.movies];
        this.stats = this.buildStats();
        this.resetMovieForm();
        this.isSubmittingMovie = false;
        this.showSuccess(`Movie "${movie.title}" was created.`);
      },
      error: (error: unknown) => {
        this.isSubmittingMovie = false;
        this.showError(this.extractErrorMessage(error, 'Movie creation failed.'));
      },
    });
  }

  protected submitHall(): void {
    const payload: CreateHallPayload = {
      name: this.hallForm.name.trim(),
      rows: Number(this.hallForm.rows),
      cols: Number(this.hallForm.cols),
      availability: this.hallForm.availability,
      seatLayout: this.buildSeatLayout(),
    };

    if (!payload.name) {
      this.showError('Hall name is required.');
      return;
    }

    this.isSubmittingHall = true;
    this.adminService.createHall(payload).subscribe({
      next: (hall) => {
        this.halls = [hall, ...this.halls];
        this.stats = this.buildStats();
        if (!this.showtimeForm.hallId) {
          this.showtimeForm.hallId = hall.id;
        }
        this.resetHallForm();
        this.isSubmittingHall = false;
        this.showSuccess(`Hall "${hall.name}" was added.`);
      },
      error: (error: unknown) => {
        this.isSubmittingHall = false;
        this.showError(this.extractErrorMessage(error, 'Hall creation failed.'));
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
      this.showError('Movie, hall, start time, and end time are required for a showtime.');
      return;
    }

    this.isSubmittingShowtime = true;
    this.adminService.createShowtime(payload).subscribe({
      next: (showtime) => {
        this.showtimes = [...this.showtimes, showtime].sort((left, right) =>
          left.startTime.localeCompare(right.startTime),
        );
        this.stats = this.buildStats();
        this.resetShowtimeForm();
        this.isSubmittingShowtime = false;
        this.showSuccess(`Showtime for "${showtime.movieTitle}" was scheduled.`);
      },
      error: (error: unknown) => {
        this.isSubmittingShowtime = false;
        this.showError(this.extractErrorMessage(error, 'Showtime creation failed.'));
      },
    });
  }

  protected submitMenuItem(): void {
    const payload: CreateMenuItemPayload = {
      name: this.menuForm.name.trim(),
      description: this.menuForm.description.trim(),
      category: this.menuForm.category.trim(),
      price: Number(this.menuForm.price),
      isAvailable: this.menuForm.isAvailable,
    };

    if (!payload.name) {
      this.showError('Menu item name is required.');
      return;
    }

    this.isSubmittingMenuItem = true;
    this.adminService.createMenuItem(payload).subscribe({
      next: (item) => {
        this.menuItems = [item, ...this.menuItems];
        this.stats = this.buildStats();
        this.resetMenuForm();
        this.isSubmittingMenuItem = false;
        this.showSuccess(`Menu item "${item.name}" was created.`);
      },
      error: (error: unknown) => {
        this.isSubmittingMenuItem = false;
        this.showError(this.extractErrorMessage(error, 'Menu item creation failed.'));
      },
    });
  }

  protected approvePayment(booking: AdminPendingBooking): void {
    this.adminService.approvePayment(booking.id).subscribe({
      next: () => {
        this.pendingPayments = this.pendingPayments.filter((item) => item.id !== booking.id);
        this.stats = this.buildStats();
        this.showSuccess(`Payment approved for "${booking.filmName}".`);
      },
      error: (error: unknown) => {
        this.showError(this.extractErrorMessage(error, 'Could not approve payment.'));
      },
    });
  }

  protected deleteMovie(movie: AdminMovie): void {
    const confirmed = window.confirm(`Delete "${movie.title}" from the active catalog?`);
    if (!confirmed) {
      return;
    }

    this.adminService.deleteMovie(movie.id).subscribe({
      next: () => {
        this.movies = this.movies.filter((item) => item.id !== movie.id);
        this.stats = this.buildStats();
        this.showSuccess(`Movie "${movie.title}" was deleted.`);
      },
      error: (error: unknown) => {
        this.showError(this.extractErrorMessage(error, 'Movie deletion failed.'));
      },
    });
  }

  protected deleteHall(hall: AdminHall): void {
    const confirmed = window.confirm(`Delete hall "${hall.name}"?`);
    if (!confirmed) {
      return;
    }

    this.adminService.deleteHall(hall.id).subscribe({
      next: () => {
        this.halls = this.halls.filter((item) => item.id !== hall.id);
        this.stats = this.buildStats();
        this.prefillShowtimeSelectors();
        this.showSuccess(`Hall "${hall.name}" was deleted.`);
      },
      error: (error: unknown) => {
        this.showError(this.extractErrorMessage(error, 'Hall deletion failed.'));
      },
    });
  }

  protected toggleMenuAvailability(item: AdminMenuItem): void {
    this.adminService.updateMenuAvailability(item, !item.isAvailable).subscribe({
      next: (updatedItem) => {
        this.menuItems = this.menuItems.map((menuItem) =>
          menuItem.id === updatedItem.id ? updatedItem : menuItem,
        );
        this.showSuccess(`"${updatedItem.name}" availability was updated.`);
      },
      error: (error: unknown) => {
        this.showError(this.extractErrorMessage(error, 'Menu item update failed.'));
      },
    });
  }

  protected deleteMenuItem(item: AdminMenuItem): void {
    const confirmed = window.confirm(`Delete menu item "${item.name}"?`);
    if (!confirmed) {
      return;
    }

    this.adminService.deleteMenuItem(item.id).subscribe({
      next: () => {
        this.menuItems = this.menuItems.filter((menuItem) => menuItem.id !== item.id);
        this.stats = this.buildStats();
        this.showSuccess(`Menu item "${item.name}" was deleted.`);
      },
      error: (error: unknown) => {
        this.showError(this.extractErrorMessage(error, 'Menu item deletion failed.'));
      },
    });
  }

  protected statusLabel(status: string): string {
    return status.replace(/_/g, ' ');
  }

  protected formatMoney(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  protected formatDate(dateValue: string): string {
    if (!dateValue) {
      return 'N/A';
    }

    return new Date(dateValue).toLocaleString();
  }

  protected trackById(_index: number, item: { id: string }): string {
    return item.id;
  }

  protected sectionCount(section: 'movies' | 'halls' | 'showtimes' | 'menu' | 'users'): number {
    switch (section) {
      case 'movies':
        return this.movies.length;
      case 'halls':
        return this.halls.length;
      case 'showtimes':
        return this.showtimes.length;
      case 'menu':
        return this.menuItems.length;
      case 'users':
        return this.users.length;
    }
  }

  protected toggleGenre(genre: string): void {
    const selectedGenres = this.movieForm.genreInput
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter((item) => item.length > 0);

    if (selectedGenres.includes(genre)) {
      this.movieForm.genreInput = selectedGenres.filter((item) => item !== genre).join(', ');
      return;
    }

    this.movieForm.genreInput = [...selectedGenres, genre].join(', ');
  }

  protected hasGenre(genre: string): boolean {
    return this.movieForm.genreInput
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter((item) => item.length > 0)
      .includes(genre);
  }

  protected applyHallTemplate(templateLabel: string): void {
    const template = this.hallTemplates.find((item) => item.label === templateLabel);
    if (!template) {
      return;
    }

    this.hallForm = {
      ...this.hallForm,
      template: template.label,
      rows: template.rows,
      cols: template.cols,
      standardRows: template.standardRows,
      premiumRows: template.premiumRows,
      vipRows: template.vipRows,
    };
  }

  private buildStats(): DashboardStat[] {
    const activeShowtimes = this.showtimes.filter((showtime) =>
      ['scheduled', 'running'].includes(showtime.status),
    ).length;
    const revenueWaitingApproval = this.pendingPayments.reduce(
      (sum, booking) => sum + booking.totalAmount,
      0,
    );

    return [
      { label: 'Total Movies', value: String(this.movies.length), accent: 'blue' },
      { label: 'Active Showtimes', value: String(activeShowtimes), accent: 'green' },
      { label: 'Pending Payments', value: String(this.pendingPayments.length), accent: 'purple' },
      { label: 'Awaiting Revenue', value: this.formatMoney(revenueWaitingApproval), accent: 'amber' },
    ];
  }

  private buildSeatLayout(): CreateHallPayload['seatLayout'] {
    const seatLayout: CreateHallPayload['seatLayout'] = [];

    const groups: Array<{
      type: 'standard' | 'premium' | 'vip';
      input: string;
    }> = [
      { type: 'standard', input: this.hallForm.standardRows },
      { type: 'premium', input: this.hallForm.premiumRows },
      { type: 'vip', input: this.hallForm.vipRows },
    ];

    groups.forEach((group) => {
      const rows = group.input
        .split(',')
        .map((row) => row.trim().toUpperCase())
        .filter((row) => row.length > 0)
        .sort();

      if (rows.length > 0) {
        seatLayout.push({
          type: group.type,
          rows,
        });
      }
    });

    return seatLayout;
  }

  private prefillShowtimeSelectors(): void {
    if (!this.showtimeForm.movieId && this.movies.length > 0) {
      this.showtimeForm.movieId = this.movies[0].id;
    }

    if (!this.showtimeForm.hallId && this.halls.length > 0) {
      this.showtimeForm.hallId = this.halls[0].id;
    }
  }

  private toIsoDateTime(value: string): string {
    if (!value) {
      return '';
    }

    return new Date(value).toISOString();
  }

  private resetMovieForm(): void {
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

  private resetHallForm(): void {
    this.hallForm = {
      template: 'Standard Hall',
      name: '',
      rows: 8,
      cols: 12,
      availability: true,
      standardRows: 'A,B,C,D',
      premiumRows: 'E,F',
      vipRows: 'G,H',
    };
  }

  private resetShowtimeForm(): void {
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

  private resetMenuForm(): void {
    this.menuForm = {
      name: '',
      description: '',
      category: 'snacks',
      price: 75,
      isAvailable: true,
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

  private clearFeedback(): void {
    this.feedbackMessage = '';
    this.feedbackTone = 'success';
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

      if (
        typeof firstError === 'object' &&
        firstError !== null &&
        'message' in firstError &&
        typeof firstError.message === 'string'
      ) {
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

  private isValidUrl(value: string): boolean {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }
}

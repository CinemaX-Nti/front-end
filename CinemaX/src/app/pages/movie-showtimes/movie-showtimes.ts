import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AppLoadingComponent } from '../../components/app-loading/app-loading';
import { BookingFlowService } from '../../services/booking-flow.service';
import { IMovieDetails, IMovieShowTime } from '../../models/movie.model';
import { MoviesService } from '../../services/movies.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-movie-showtimes',
  standalone: true,
  imports: [CommonModule, RouterModule, AppLoadingComponent, DatePipe],
  templateUrl: './movie-showtimes.html',
  styleUrl: './movie-showtimes.css',
})
export class MovieShowtimesPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly moviesService = inject(MoviesService);
  private readonly bookingFlow = inject(BookingFlowService);
  private readonly authService = inject(AuthService);

  isLoading = true;
  movie: IMovieDetails | null = null;
  selectedDate = 'all';
  ageGateMessage = '';

  ngOnInit(): void {
    const movieId = this.route.snapshot.paramMap.get('id');
    if (!movieId) {
      this.router.navigate(['/movies']);
      return;
    }

    this.moviesService.getMovieById(movieId).subscribe({
      next: (movie) => {
        this.movie = movie;
        this.isLoading = false;
      },
      error: () => {
        this.router.navigate(['/movies']);
      },
    });
  }

  get dateOptions(): string[] {
    return Array.from(new Set((this.movie?.showtimes ?? []).map((showtime) => showtime.date ?? '')));
  }

  get groupedShowtimes(): Array<{ date: string; showtimes: IMovieShowTime[] }> {
    const showtimes = this.movie?.showtimes ?? [];
    const filtered = this.selectedDate === 'all' ? showtimes : showtimes.filter((showtime) => showtime.date === this.selectedDate);
    return Array.from(new Set(filtered.map((showtime) => showtime.date ?? ''))).map((date) => ({
      date,
      showtimes: filtered.filter((showtime) => showtime.date === date),
    }));
  }

  selectDate(date: string): void {
    this.selectedDate = date;
  }

  goToSeats(showtime: IMovieShowTime): void {
    if (!this.movie || !showtime.id || !this.isBookableShowtime(showtime)) {
      return;
    }

    const ageGateMessage = this.getAgeGateMessage(this.movie.ageRating);
    if (ageGateMessage) {
      this.ageGateMessage = ageGateMessage;
      return;
    }

    this.ageGateMessage = '';

    this.bookingFlow.startSession(this.movie, showtime);
    this.router.navigate(['/movies', this.movie.id, 'showtimes', showtime.id, 'seats']);
  }

  isBookableShowtime(showtime: IMovieShowTime): boolean {
    return this.isMongoObjectId(showtime.id);
  }

  formatMetaDate(date?: string): string {
    if (!date) {
      return 'Date TBA';
    }

    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  }

  private getAgeGateMessage(ageRating?: string): string {
    const minimumAge = this.getMinimumRequiredAge(ageRating);

    if (minimumAge === 0) {
      return '';
    }

    const currentUser = this.authService.currentUserValue;
    const userAge = this.calculateAge(currentUser?.dateOfBirth);

    if (!currentUser?.dateOfBirth) {
      return `This movie is rated ${ageRating}. Add your date of birth in your profile before booking.`;
    }

    if (userAge === null || userAge < minimumAge) {
      return `This movie is rated ${ageRating}. You must be at least ${minimumAge} years old to continue with booking.`;
    }

    return '';
  }

  private getMinimumRequiredAge(ageRating?: string): number {
    if (ageRating === '18+') {
      return 18;
    }

    if (ageRating === '16+') {
      return 16;
    }

    if (ageRating === 'PG-13') {
      return 13;
    }

    return 0;
  }

  private calculateAge(dateOfBirth?: string): number | null {
    if (!dateOfBirth) {
      return null;
    }

    const dob = new Date(dateOfBirth);
    if (Number.isNaN(dob.getTime())) {
      return null;
    }

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age -= 1;
    }

    return age;
  }

  private isMongoObjectId(value?: string): boolean {
    return typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);
  }
}

import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AppLoadingComponent } from '../../components/app-loading/app-loading';
import { BookingFlowService } from '../../services/booking-flow.service';
import { IMovieDetails, IMovieShowTime } from '../../models/movie.model';
import { MoviesService } from '../../services/movies.service';

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

  isLoading = true;
  movie: IMovieDetails | null = null;
  selectedDate = 'all';

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
    if (!this.movie || !showtime.id) {
      return;
    }

    this.bookingFlow.startSession(this.movie, showtime);
    this.router.navigate(['/movies', this.movie.id, 'showtimes', showtime.id, 'seats']);
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
}

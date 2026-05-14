import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AppLoadingComponent } from '../../components/app-loading/app-loading';
import { IMovieDetails, IMovieShowTime } from '../../models/movie.model';
import { Seat, SeatState } from '../../models/seats-layout.model';
import {
  BookingFlowService,
  SelectedSeat,
  SeatTier,
} from '../../services/booking-flow.service';
import { BookingService } from '../../services/booking.service';
import { MoviesService } from '../../services/movies.service';
import {
  DEFAULT_ROWS,
  SEATS_LAYOUT_CONFIG,
  rowSeatId,
} from './seats-layout.constants';

@Component({
  selector: 'app-seats-management',
  standalone: true,
  imports: [CommonModule, RouterModule, AppLoadingComponent, DatePipe],
  templateUrl: './seats-management.html',
  styleUrl: './seats-management.css',
})
export class SeatsManagement implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly moviesService = inject(MoviesService);
  private readonly bookingService = inject(BookingService);
  private readonly bookingFlow = inject(BookingFlowService);

  readonly rows = DEFAULT_ROWS;
  readonly layout = SEATS_LAYOUT_CONFIG;

  isLoading = true;
  movie: IMovieDetails | null = null;
  showtime: IMovieShowTime | null = null;
  seats: Seat[] = [];
  selectedSeatIds = new Set<string>();

  ngOnInit(): void {
    const movieId = this.route.snapshot.paramMap.get('id');
    const showtimeId = this.route.snapshot.paramMap.get('showtimeId');

    if (!movieId || !showtimeId) {
      this.router.navigate(['/movies']);
      return;
    }

    forkJoin({
      movie: this.moviesService.getMovieById(movieId),
      bookings: this.bookingService.getBookings(),
    }).subscribe({
      next: ({ movie, bookings }) => {
        const showtime = movie.showtimes.find((entry) => entry.id === showtimeId);
        if (!showtime) {
          this.router.navigate(['/movies', movieId, 'showtimes']);
          return;
        }

        this.movie = movie;
        this.showtime = showtime;
        this.bookingFlow.ensureSession(movie, showtime);
        this.selectedSeatIds = new Set(this.bookingFlow.snapshot.seats.map((seat) => seat.id));
        this.seats = this.buildSeats(bookings.flatMap((booking) => booking.seats));
        this.isLoading = false;
      },
      error: () => {
        this.router.navigate(['/movies', movieId, 'showtimes']);
      },
    });
  }

  get selectedSeats(): SelectedSeat[] {
    return this.seats
      .filter((seat) => this.selectedSeatIds.has(seat.id))
      .map((seat) => ({
        id: seat.id,
        row: seat.row,
        number: seat.number,
        tier: seat.tier,
        price: this.priceForTier(seat.tier),
      }));
  }

  get total(): number {
    return this.selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  }

  get seatCountLabel(): string {
    const count = this.selectedSeats.length;
    return `${count} seat${count === 1 ? '' : 's'} selected`;
  }

  get standardCount(): number {
    return this.selectedSeats.filter((seat) => seat.tier === 'standard').length;
  }

  get premiumCount(): number {
    return this.selectedSeats.filter((seat) => seat.tier === 'premium').length;
  }

  get vipCount(): number {
    return this.selectedSeats.filter((seat) => seat.tier === 'vip').length;
  }

  seatLabel(row: string, seatNumber: number): string {
    return rowSeatId(row, seatNumber);
  }

  isAisleAfter(seatNumber: number): boolean {
    return (this.layout.aisleAfterSeatNumbers ?? []).includes(seatNumber);
  }

  toggleSeat(seat: Seat): void {
    if (seat.state === 'booked' || seat.state === 'reserved') {
      return;
    }

    if (this.selectedSeatIds.has(seat.id)) {
      this.selectedSeatIds.delete(seat.id);
      seat.state = 'available';
    } else {
      this.selectedSeatIds.add(seat.id);
      seat.state = 'selected';
    }

    this.bookingFlow.setSeats(this.selectedSeats);
  }

  continueToSnacks(): void {
    if (!this.movie || !this.showtime || this.selectedSeats.length === 0) {
      return;
    }

    this.bookingFlow.setSeats(this.selectedSeats);
    this.router.navigate(['/movies', this.movie.id, 'showtimes', this.showtime.id, 'snacks']);
  }

  getSeatsForRow(row: string): Seat[] {
    return this.seats.filter((seat) => seat.row === row);
  }

  getRowRenderCells(row: string): Array<Seat | null> {
    const rowSeats = this.getSeatsForRow(row);
    const rendered: Array<Seat | null> = [];

    for (const seat of rowSeats) {
      rendered.push(seat);
      if (this.isAisleAfter(seat.number)) {
        rendered.push(null);
      }
    }

    return rendered;
  }

  private buildSeats(bookedSeats: string[]): Seat[] {
    const bookedSet = new Set(bookedSeats);
    const selectedSet = this.selectedSeatIds;
    const seats: Seat[] = [];

    for (let rowIndex = 0; rowIndex < this.layout.rows.length; rowIndex++) {
      const row = this.layout.rows[rowIndex];
      const seatsInRow = this.layout.seatsPerRow[rowIndex] ?? 0;

      for (let number = 1; number <= seatsInRow; number++) {
        const id = rowSeatId(row, number);
        let state: SeatState = 'available';

        if (bookedSet.has(id)) {
          state = 'booked';
        } else if (selectedSet.has(id)) {
          state = 'selected';
        }

        seats.push({
          id,
          row,
          number,
          state,
          tier: this.getSeatTier(row),
        });
      }
    }

    return seats;
  }

  private getSeatTier(row: string): SeatTier {
    if (['F', 'G', 'H'].includes(row)) {
      return 'vip';
    }

    if (['C', 'D', 'E'].includes(row)) {
      return 'premium';
    }

    return 'standard';
  }

  private priceForTier(tier: SeatTier): number {
    return this.showtime?.pricing?.[tier] ?? this.showtime?.price ?? 0;
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IMovieDetails, IMovieShowTime } from '../models/movie.model';
import { MenuItem } from './menu.service';

export type SeatTier = 'standard' | 'premium' | 'vip';

export interface SelectedSeat {
  id: string;
  row: string;
  number: number;
  tier: SeatTier;
  price: number;
}

export interface SelectedSnackItem {
  item: MenuItem;
  quantity: number;
}

export interface BookingSession {
  movie: IMovieDetails | null;
  showtime: IMovieShowTime | null;
  seats: SelectedSeat[];
  snacks: SelectedSnackItem[];
}

const INITIAL_SESSION: BookingSession = {
  movie: null,
  showtime: null,
  seats: [],
  snacks: [],
};

@Injectable({
  providedIn: 'root',
})
export class BookingFlowService {
  private readonly sessionSubject = new BehaviorSubject<BookingSession>(INITIAL_SESSION);

  readonly session$ = this.sessionSubject.asObservable();

  get snapshot(): BookingSession {
    return this.sessionSubject.value;
  }

  startSession(movie: IMovieDetails, showtime: IMovieShowTime): void {
    this.sessionSubject.next({
      movie,
      showtime,
      seats: [],
      snacks: [],
    });
  }

  ensureSession(movie: IMovieDetails, showtime: IMovieShowTime): void {
    const current = this.snapshot;
    const isSameMovie = current.movie?.id === movie.id;
    const isSameShowtime = current.showtime?.id === showtime.id;

    if (isSameMovie && isSameShowtime) {
      this.sessionSubject.next({
        ...current,
        movie,
        showtime,
      });
      return;
    }

    this.startSession(movie, showtime);
  }

  setSeats(seats: SelectedSeat[]): void {
    this.sessionSubject.next({
      ...this.snapshot,
      seats,
    });
  }

  updateSnack(item: MenuItem, quantity: number): void {
    const snacks = this.snapshot.snacks.filter((entry) => entry.item.id !== item.id);

    if (quantity > 0) {
      snacks.push({ item, quantity });
    }

    this.sessionSubject.next({
      ...this.snapshot,
      snacks,
    });
  }

  getSnackQuantity(itemId: string): number {
    return this.snapshot.snacks.find((entry) => entry.item.id === itemId)?.quantity ?? 0;
  }

  resetSnacks(): void {
    this.sessionSubject.next({
      ...this.snapshot,
      snacks: [],
    });
  }

  clearSession(): void {
    this.sessionSubject.next(INITIAL_SESSION);
  }

  getSeatTotal(): number {
    return this.snapshot.seats.reduce((total, seat) => total + seat.price, 0);
  }

  getSnackTotal(): number {
    return this.snapshot.snacks.reduce((total, snack) => total + snack.item.price * snack.quantity, 0);
  }

  getGrandTotal(): number {
    return this.getSeatTotal() + this.getSnackTotal();
  }
}

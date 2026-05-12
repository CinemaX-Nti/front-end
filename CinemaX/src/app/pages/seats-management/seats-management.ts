import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { Seat, SeatState } from '../../models/seats-layout.model';

import {
  DEFAULT_ROWS,
  SEATS_LAYOUT_CONFIG,
  rowSeatId,
  seatStateClass,
} from './seats-layout.constants';

@Component({
  selector: 'app-seats-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seats-management.html',
  styleUrl: './seats-management.css',
})
export class SeatsManagement {
  readonly rows = DEFAULT_ROWS;
  readonly layout = SEATS_LAYOUT_CONFIG;

  // seatNumber is 1-based within a row
  seats: Seat[] = [];

  selectedSeatIds = new Set<string>();

  constructor(private bookingService: BookingService) {}

  ngOnInit() {
    this.seats = this.buildSeats();

    // mock booked seats from existing booking service (deterministic UI)
    this.bookingService.getBookings().subscribe(bookings => {
      const booked = new Set<string>();
      for (const b of bookings) {
        for (const s of b.seats) booked.add(s);
      }

      this.seats = this.seats.map(seat => {
        if (booked.has(seat.id)) return { ...seat, state: 'booked' };
        return seat;
      });
    });
  }

  seatLabel(row: string, seatNumber: number) {
    return rowSeatId(row, seatNumber);
  }

  isAisleAfter(seatNumber: number): boolean {
    return (this.layout.aisleAfterSeatNumbers ?? []).includes(seatNumber);
  }

  toggleSeat(seat: Seat) {
    if (seat.state === 'booked') return;

    const nextState: SeatState = this.selectedSeatIds.has(seat.id) ? 'available' : 'selected';

    if (nextState === 'selected') this.selectedSeatIds.add(seat.id);
    else this.selectedSeatIds.delete(seat.id);

    seat.state = nextState;
  }

  stateClass(seat: Seat) {
    return seatStateClass(seat.state);
  }

  private buildSeats(): Seat[] {
    const seats: Seat[] = [];

    for (let r = 0; r < this.layout.rows.length; r++) {
      const row = this.layout.rows[r];
      const seatsInRow = this.layout.seatsPerRow[r] ?? 0;

      for (let n = 1; n <= seatsInRow; n++) {
        seats.push({
          id: rowSeatId(row, n),
          row,
          number: n,
          state: 'available',
        });
      }
    }

    return seats;
  }

  getSeatsForRow(row: string): Seat[] {
    return this.seats.filter(s => s.row === row);
  }

  // Used by template for rendering aisle gaps.
  // Returns an array containing either a Seat or null at each position.
  getRowRenderCells(row: string): Array<Seat | null> {
    const rowSeats = this.getSeatsForRow(row);
    const rendered: Array<Seat | null> = [];

    // seat numbers are 1..N
    for (const seat of rowSeats) {
      rendered.push(seat);
      if (this.isAisleAfter(seat.number)) rendered.push(null);
    }

    return rendered;
  }
}



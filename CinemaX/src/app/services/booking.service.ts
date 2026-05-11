import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Booking {
  id: string;
  customerName: string;
  movieName: string;
  hallName: string;
  showtime: string;
  seats: string[];
  totalTickets: number;
  totalFood: number;
  bookingStatus: 'CONFIRMED' | 'CANCELLED' | 'PENDING';
  paymentStatus: 'PAID' | 'UNPAID' | 'REFUNDED';
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private mockBookings: Booking[] = [
    { id: 'BKG-1001', customerName: 'Jane Smith', movieName: 'Dune: Part Two', hallName: 'IMAX 1', showtime: 'Today, 19:30', seats: ['J12', 'J13'], totalTickets: 30, totalFood: 15.5, bookingStatus: 'CONFIRMED', paymentStatus: 'PAID', createdAt: '2026-05-11T10:00:00Z' },
    { id: 'BKG-1002', customerName: 'Mike Johnson', movieName: 'Oppenheimer', hallName: 'Standard 3', showtime: 'Today, 20:00', seats: ['F05'], totalTickets: 12, totalFood: 0, bookingStatus: 'PENDING', paymentStatus: 'UNPAID', createdAt: '2026-05-11T14:30:00Z' },
    { id: 'BKG-1003', customerName: 'Sarah Williams', movieName: 'Interstellar Re-release', hallName: 'VIP Lounge', showtime: 'Tomorrow, 18:00', seats: ['A01', 'A02'], totalTickets: 50, totalFood: 45, bookingStatus: 'CONFIRMED', paymentStatus: 'PAID', createdAt: '2026-05-10T09:15:00Z' },
    { id: 'BKG-1004', customerName: 'David Brown', movieName: 'The Batman', hallName: 'Standard 2', showtime: 'Today, 22:30', seats: ['H08', 'H09', 'H10'], totalTickets: 36, totalFood: 25, bookingStatus: 'CANCELLED', paymentStatus: 'REFUNDED', createdAt: '2026-05-09T16:45:00Z' },
  ];

  constructor() {}

  getBookings(): Observable<Booking[]> {
    return of(this.mockBookings);
  }

  updateBookingStatus(id: string, status: 'CONFIRMED' | 'CANCELLED' | 'PENDING'): Observable<boolean> {
    const booking = this.mockBookings.find(b => b.id === id);
    if (booking) {
      booking.bookingStatus = status;
      return of(true);
    }
    return of(false);
  }
}

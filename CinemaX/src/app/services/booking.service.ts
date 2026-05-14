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
  bookingStatus: 'CONFIRMED' | 'CANCELLED' | 'PENDING' | 'EXPIRED';
  paymentStatus: 'PAID' | 'UNPAID' | 'REFUNDED' | 'WAITING_TRANSFER' | 'WAITING_APPROVAL' | 'FAILED';
  createdAt: string;
  canApprovePayment: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private mockBookings: Booking[] = [
    { id: 'BKG-1001', customerName: 'Jane Smith', movieName: 'Dune: Part Two', hallName: 'IMAX 1', showtime: '2026-05-14T19:30:00Z', seats: ['J12', 'J13'], totalTickets: 30, totalFood: 15.5, bookingStatus: 'CONFIRMED', paymentStatus: 'PAID', createdAt: '2026-05-11T10:00:00Z', canApprovePayment: false },
    { id: 'BKG-1002', customerName: 'Mike Johnson', movieName: 'Oppenheimer', hallName: 'Standard 3', showtime: '2026-05-14T20:00:00Z', seats: ['F05'], totalTickets: 12, totalFood: 0, bookingStatus: 'PENDING', paymentStatus: 'WAITING_APPROVAL', createdAt: '2026-05-11T14:30:00Z', canApprovePayment: true },
    { id: 'BKG-1003', customerName: 'Sarah Williams', movieName: 'Interstellar Re-release', hallName: 'VIP Lounge', showtime: '2026-05-15T18:00:00Z', seats: ['A01', 'A02'], totalTickets: 50, totalFood: 45, bookingStatus: 'PENDING', paymentStatus: 'WAITING_TRANSFER', createdAt: '2026-05-10T09:15:00Z', canApprovePayment: false },
    { id: 'BKG-1004', customerName: 'David Brown', movieName: 'The Batman', hallName: 'Standard 2', showtime: '2026-05-14T22:30:00Z', seats: ['H08', 'H09', 'H10'], totalTickets: 36, totalFood: 25, bookingStatus: 'CANCELLED', paymentStatus: 'REFUNDED', createdAt: '2026-05-09T16:45:00Z', canApprovePayment: false },
    { id: 'BKG-1005', customerName: 'Lina Hassan', movieName: 'Mission: Impossible', hallName: 'Standard 5', showtime: '2026-05-13T17:00:00Z', seats: ['C04', 'C05'], totalTickets: 24, totalFood: 8, bookingStatus: 'EXPIRED', paymentStatus: 'FAILED', createdAt: '2026-05-08T12:20:00Z', canApprovePayment: false },
  ];

  constructor() {}

  getBookings(): Observable<Booking[]> {
    return of(this.mockBookings);
  }

  updateBookingStatus(id: string, status: Booking['bookingStatus']): Observable<boolean> {
    const booking = this.mockBookings.find(b => b.id === id);
    if (booking) {
      booking.bookingStatus = status;
      return of(true);
    }
    return of(false);
  }

  approvePayment(id: string): Observable<boolean> {
    const booking = this.mockBookings.find((b) => b.id === id);
    if (booking) {
      booking.paymentStatus = 'PAID';
      booking.bookingStatus = 'CONFIRMED';
      booking.canApprovePayment = false;
      return of(true);
    }
    return of(false);
  }
}

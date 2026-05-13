import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';
import { API_ENDPOINTS } from './api-endpoints';

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
  paymentStatus: 'PAID' | 'WAITING_TRANSFER' | 'WAITING_APPROVAL' | 'REFUNDED' | 'FAILED';
  createdAt: string;
  canApprovePayment: boolean;
}

interface BookingsResponse {
  success: boolean;
  data: Array<{
    _id: string;
    filmName: string;
    seats: string[];
    ticketTotal: number;
    foodTotal: number;
    status: 'pending' | 'confirmed' | 'cancelled' | 'expired';
    paymentStatus: 'waiting_transfer' | 'waiting_approval' | 'paid' | 'failed' | 'refunded';
    createdAt: string;
    userId?: { name: string };
    hallId?: { name: string };
    showTimeId?: { startTime: string };
  }>;
}

type BackendBooking = BookingsResponse['data'][number];

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly bookingsApiUrl = API_ENDPOINTS.bookings;
  private readonly adminApiUrl = API_ENDPOINTS.admin;

  getBookings(): Observable<Booking[]> {
    return this.http.get<BookingsResponse>(`${this.bookingsApiUrl}?limit=100`, this.requestOptions()).pipe(
      map((response) => response.data.map((booking) => this.mapBooking(booking))),
    );
  }

  approvePayment(id: string): Observable<void> {
    return this.http.patch<void>(`${this.adminApiUrl}/approve-payment/${id}`, {}, this.requestOptions());
  }

  private mapBooking(booking: BackendBooking): Booking {
    return {
      id: booking._id,
      customerName: booking.userId?.name ?? 'Unknown customer',
      movieName: booking.filmName,
      hallName: booking.hallId?.name ?? 'Unknown hall',
      showtime: booking.showTimeId?.startTime ?? 'Unknown showtime',
      seats: booking.seats,
      totalTickets: booking.ticketTotal,
      totalFood: booking.foodTotal,
      bookingStatus: this.toUiBookingStatus(booking.status),
      paymentStatus: this.toUiPaymentStatus(booking.paymentStatus),
      createdAt: booking.createdAt,
      canApprovePayment: booking.status === 'pending' && booking.paymentStatus === 'waiting_approval',
    };
  }

  private toUiBookingStatus(status: BackendBooking['status']): Booking['bookingStatus'] {
    switch (status) {
      case 'confirmed':
        return 'CONFIRMED';
      case 'cancelled':
        return 'CANCELLED';
      case 'expired':
        return 'EXPIRED';
      default:
        return 'PENDING';
    }
  }

  private toUiPaymentStatus(status: BackendBooking['paymentStatus']): Booking['paymentStatus'] {
    switch (status) {
      case 'paid':
        return 'PAID';
      case 'waiting_transfer':
        return 'WAITING_TRANSFER';
      case 'waiting_approval':
        return 'WAITING_APPROVAL';
      case 'refunded':
        return 'REFUNDED';
      default:
        return 'FAILED';
    }
  }

  private requestOptions(): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders(this.authService.getAuthHeaders()),
    };
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

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

export interface ShowtimeSeat {
  id: string;
  seatNumber: string;
  status: 'available' | 'reserved' | 'locked' | 'booked';
  type: 'standard' | 'premium' | 'vip';
  price: number;
}

export interface CreateBookingPayload {
  userId: string;
  showTimeId: string;
  seats: string[];
  foodItems: Array<{
    itemId: string;
    quantity: number;
  }>;
  paymentReference?: string;
}

export interface BookingReceipt {
  id: string;
  filmName: string;
  seats: string[];
  totalAmount: number;
  ticketTotal: number;
  foodTotal: number;
  status: string;
  paymentStatus: string;
  paymentReference: string | null;
  expiresAt: string | null;
  qrCodeDataUrl: string | null;
}

export interface BookingInstructions {
  walletQrImageUrl: string | null;
  accountName: string | null;
  accountNumber: string | null;
  bankName: string | null;
  note: string;
}

export interface CreateBookingResult {
  message: string;
  booking: BookingReceipt;
  qrReviewLink: string;
  paymentInstructions: BookingInstructions;
  expiresInMinutes: number;
}

interface BackendSeat {
  _id: string;
  seatNumber: string;
  status: 'available' | 'reserved' | 'locked' | 'booked';
  type: 'standard' | 'premium' | 'vip';
  price: number;
}

interface BackendBooking {
  _id: string;
  filmName: string;
  seats: string[];
  ticketTotal?: number;
  foodTotal?: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired';
  paymentStatus: 'waiting_transfer' | 'waiting_approval' | 'paid' | 'failed' | 'refunded';
  paymentReference?: string | null;
  createdAt?: string;
  expiresAt?: string | null;
  qrCodeDataUrl?: string | null;
  userId?: {
    name?: string;
  };
  hallId?: {
    name?: string;
  };
  showTimeId?: {
    startTime?: string;
  };
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
}

interface CreateBookingResponse {
  message: string;
  booking: BackendBooking;
  qrReviewLink: string;
  paymentInstructions: BookingInstructions;
  expiresInMinutes: number;
}

interface ConfirmBookingResponse {
  message: string;
  booking: BackendBooking;
}

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  getBookings(): Observable<Booking[]> {
    return this.http
      .get<PaginatedResponse<BackendBooking>>(`${environment.api.baseUrl}/bookings?limit=100`, this.requestOptions())
      .pipe(map((response) => (response.data ?? []).map((booking) => this.mapBooking(booking))));
  }

  getSeatsForShowtime(showtimeId: string): Observable<ShowtimeSeat[]> {
    return this.http
      .get<BackendSeat[]>(`${environment.api.baseUrl}/showtimes/${showtimeId}/seats`)
      .pipe(map((response) => (response ?? []).map((seat) => this.mapSeat(seat))));
  }

  createBooking(payload: CreateBookingPayload): Observable<CreateBookingResult> {
    return this.http
      .post<CreateBookingResponse>(`${environment.api.baseUrl}/bookings`, payload, this.requestOptions())
      .pipe(
        map((response) => ({
          message: response.message,
          booking: this.mapBookingReceipt(response.booking),
          qrReviewLink: response.qrReviewLink,
          paymentInstructions: response.paymentInstructions,
          expiresInMinutes: response.expiresInMinutes,
        })),
      );
  }

  submitBookingForReview(bookingId: string): Observable<{ message: string; booking: BookingReceipt }> {
    return this.http
      .get<ConfirmBookingResponse>(`${environment.api.baseUrl}/api/bookings/confirm-scan/${bookingId}`)
      .pipe(
        map((response) => ({
          message: response.message,
          booking: this.mapBookingReceipt(response.booking),
        })),
      );
  }

  approvePayment(id: string): Observable<boolean> {
    return this.http
      .patch<void>(`${environment.api.baseUrl}/admin/approve-payment/${id}`, {}, this.requestOptions())
      .pipe(map(() => true));
  }

  private requestOptions(): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders(this.authService.getAuthHeaders()),
    };
  }

  private mapSeat(seat: BackendSeat): ShowtimeSeat {
    return {
      id: seat._id,
      seatNumber: seat.seatNumber,
      status: seat.status,
      type: seat.type,
      price: seat.price,
    };
  }

  private mapBooking(booking: BackendBooking): Booking {
    return {
      id: booking._id,
      customerName: booking.userId?.name ?? 'You',
      movieName: booking.filmName,
      hallName: booking.hallId?.name ?? 'Main Hall',
      showtime: booking.showTimeId?.startTime ?? booking.createdAt ?? '',
      seats: booking.seats,
      totalTickets: booking.ticketTotal ?? 0,
      totalFood: booking.foodTotal ?? 0,
      bookingStatus: this.mapBookingStatus(booking.status),
      paymentStatus: this.mapPaymentStatus(booking.paymentStatus),
      createdAt: booking.createdAt ?? '',
      canApprovePayment: booking.status === 'pending' && ['waiting_transfer', 'waiting_approval'].includes(booking.paymentStatus),
    };
  }

  private mapBookingReceipt(booking: BackendBooking): BookingReceipt {
    return {
      id: booking._id,
      filmName: booking.filmName,
      seats: booking.seats,
      totalAmount: booking.totalAmount,
      ticketTotal: booking.ticketTotal ?? 0,
      foodTotal: booking.foodTotal ?? 0,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      paymentReference: booking.paymentReference ?? null,
      expiresAt: booking.expiresAt ?? null,
      qrCodeDataUrl: booking.qrCodeDataUrl ?? null,
    };
  }

  private mapBookingStatus(status: BackendBooking['status']): Booking['bookingStatus'] {
    if (status === 'confirmed') {
      return 'CONFIRMED';
    }

    if (status === 'cancelled') {
      return 'CANCELLED';
    }

    if (status === 'expired') {
      return 'EXPIRED';
    }

    return 'PENDING';
  }

  private mapPaymentStatus(status: BackendBooking['paymentStatus']): Booking['paymentStatus'] {
    if (status === 'paid') {
      return 'PAID';
    }

    if (status === 'refunded') {
      return 'REFUNDED';
    }

    if (status === 'waiting_approval') {
      return 'WAITING_APPROVAL';
    }

    if (status === 'failed') {
      return 'FAILED';
    }

    if (status === 'waiting_transfer') {
      return 'WAITING_TRANSFER';
    }

    return 'UNPAID';
  }
}

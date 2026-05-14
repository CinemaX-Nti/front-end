import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface WrappedResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface BackendMovie {
  _id: string;
  title: string;
  description: string;
  duration: number;
  genre: string[];
  language?: string;
  releaseDate?: string;
  trailerUrl?: string;
  posterUrl: string;
  rating?: number;
  status: 'now_showing' | 'coming_soon' | 'archived';
  createdAt: string;
}

interface BackendHall {
  _id: string;
  name: string;
  rows: number;
  cols: number;
  availability: boolean;
  seatLayout: Array<{
    rows: string[];
    type: 'standard' | 'premium' | 'vip';
  }>;
  createdAt: string;
}

interface BackendShowtime {
  _id: string;
  movieId: {
    _id: string;
    title: string;
  };
  hallId: {
    _id: string;
    name: string;
  };
  startTime: string;
  endTime: string;
  format?: '2D' | '3D' | 'IMAX';
  status: 'scheduled' | 'running' | 'finished' | 'cancelled';
  availableSeats: number;
  pricing: {
    standard: number;
    premium: number;
    vip: number;
  };
}

interface BackendMenuItem {
  _id: string;
  name: string;
  description: string;
  imageUrl?: string;
  category: string;
  price: number;
  isAvailable: boolean;
  createdAt: string;
}

interface BackendUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  provider: 'local' | 'google';
  confirmed: boolean;
  phoneNumber?: string;
  createdAt: string;
}

interface BackendBooking {
  _id: string;
  filmName: string;
  seats: string[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired';
  paymentStatus: 'waiting_transfer' | 'waiting_approval' | 'paid' | 'failed' | 'refunded';
  paymentReference?: string | null;
  createdAt: string;
  expiresAt?: string | null;
  userId?: {
    _id: string;
    name: string;
    email: string;
  };
  hallId?: {
    _id: string;
    name: string;
  };
  showTimeId?: {
    _id: string;
    startTime: string;
  };
}

export interface AdminMovie {
  id: string;
  title: string;
  description: string;
  duration: number;
  genres: string[];
  language: string;
  releaseDate: string;
  posterUrl: string;
  trailerUrl: string;
  rating: number | null;
  status: 'now_showing' | 'coming_soon' | 'archived';
  createdAt: string;
}

export interface AdminHall {
  id: string;
  name: string;
  rows: number;
  cols: number;
  availability: boolean;
  seatLayout: Array<{
    rows: string[];
    type: 'standard' | 'premium' | 'vip';
  }>;
  createdAt: string;
}

export interface AdminShowtime {
  id: string;
  movieId: string;
  movieTitle: string;
  hallId: string;
  hallName: string;
  startTime: string;
  endTime: string;
  format: '2D' | '3D' | 'IMAX' | '';
  status: 'scheduled' | 'running' | 'finished' | 'cancelled';
  availableSeats: number;
  pricing: {
    standard: number;
    premium: number;
    vip: number;
  };
}

export interface AdminMenuItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  price: number;
  isAvailable: boolean;
  createdAt: string;
}

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  provider: 'local' | 'google';
  confirmed: boolean;
  phoneNumber: string;
  createdAt: string;
}

export interface AdminPendingBooking {
  id: string;
  filmName: string;
  customerName: string;
  customerEmail: string;
  hallName: string;
  showtime: string;
  seats: string[];
  totalAmount: number;
  paymentStatus: string;
  paymentReference: string;
  createdAt: string;
  expiresAt: string;
}

export interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  activeShowtimes: number;
  recentBookings: AdminPendingBooking[];
}

export interface CreateMoviePayload {
  title: string;
  description: string;
  duration: number;
  genre: string[];
  language?: string;
  releaseDate?: string;
  trailerUrl?: string;
  posterUrl: string;
  rating?: number;
  status: 'now_showing' | 'coming_soon' | 'archived';
}

export interface UpdateMoviePayload extends Partial<CreateMoviePayload> {}

export interface CreateHallPayload {
  name: string;
  rows: number;
  cols: number;
  availability: boolean;
  seatLayout: Array<{
    rows: string[];
    type: 'standard' | 'premium' | 'vip';
  }>;
}

export interface CreateShowtimePayload {
  movieId: string;
  hallId: string;
  startTime: string;
  endTime: string;
  format: '2D' | '3D' | 'IMAX';
  pricing: {
    standard: number;
    premium: number;
    vip: number;
  };
}

export interface CreateMenuItemPayload {
  name: string;
  description: string;
  imageUrl?: string;
  category: string;
  price: number;
  isAvailable: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AdminDashboardService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiBaseUrl = 'http://localhost:3000';

  getMovies(): Observable<AdminMovie[]> {
    return this.http
      .get<PaginatedResponse<BackendMovie>>(`${this.apiBaseUrl}/movies`, this.requestOptions())
      .pipe(map((response) => response.data.map((movie) => this.mapMovie(movie))));
  }

  createMovie(payload: CreateMoviePayload): Observable<AdminMovie> {
    return this.http
      .post<WrappedResponse<BackendMovie>>(`${this.apiBaseUrl}/movies`, payload, this.requestOptions())
      .pipe(map((response) => this.mapMovie(response.data)));
  }

  updateMovie(movieId: string, payload: UpdateMoviePayload): Observable<AdminMovie> {
    return this.http
      .patch<WrappedResponse<BackendMovie>>(`${this.apiBaseUrl}/movies/${movieId}`, payload, this.requestOptions())
      .pipe(map((response) => this.mapMovie(response.data)));
  }

  deleteMovie(movieId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/movies/${movieId}`, this.requestOptions());
  }

  getHalls(): Observable<AdminHall[]> {
    return this.http
      .get<PaginatedResponse<BackendHall>>(`${this.apiBaseUrl}/halls`, this.requestOptions())
      .pipe(map((response) => response.data.map((hall) => this.mapHall(hall))));
  }

  createHall(payload: CreateHallPayload): Observable<AdminHall> {
    return this.http
      .post<BackendHall>(`${this.apiBaseUrl}/halls`, payload, this.requestOptions())
      .pipe(map((hall) => this.mapHall(hall)));
  }

  deleteHall(hallId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/halls/${hallId}`, this.requestOptions());
  }

  getShowtimes(): Observable<AdminShowtime[]> {
    return this.http
      .get<BackendShowtime[]>(`${this.apiBaseUrl}/showtimes`, this.requestOptions())
      .pipe(map((showtimes) => showtimes.map((showtime) => this.mapShowtime(showtime))));
  }

  createShowtime(payload: CreateShowtimePayload): Observable<AdminShowtime> {
    return this.http
      .post<BackendShowtime>(`${this.apiBaseUrl}/showtimes`, payload, this.requestOptions())
      .pipe(map((showtime) => this.mapShowtime(showtime)));
  }

  getMenuItems(): Observable<AdminMenuItem[]> {
    return this.http
      .get<PaginatedResponse<BackendMenuItem>>(
        `${this.apiBaseUrl}/restaurant/menu?isAvailable=false&limit=100`,
        this.requestOptions(),
      )
      .pipe(map((response) => response.data.map((item) => this.mapMenuItem(item))));
  }

  createMenuItem(payload: CreateMenuItemPayload): Observable<AdminMenuItem> {
    return this.http
      .post<BackendMenuItem>(`${this.apiBaseUrl}/restaurant/menu`, payload, this.requestOptions())
      .pipe(map((item) => this.mapMenuItem(item)));
  }

  updateMenuAvailability(item: AdminMenuItem, isAvailable: boolean): Observable<AdminMenuItem> {
    return this.http
      .put<BackendMenuItem>(
        `${this.apiBaseUrl}/restaurant/menu/${item.id}`,
        {
          name: item.name,
          description: item.description,
          imageUrl: item.imageUrl,
          category: item.category,
          price: item.price,
          isAvailable,
        },
        this.requestOptions(),
      )
      .pipe(map((updatedItem) => this.mapMenuItem(updatedItem)));
  }

  deleteMenuItem(itemId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/restaurant/menu/${itemId}`, this.requestOptions());
  }

  getUsers(): Observable<AdminUserRecord[]> {
    return this.http
      .get<WrappedResponse<BackendUser[]>>(`${this.apiBaseUrl}/users`, this.requestOptions())
      .pipe(map((response) => response.data.map((user) => this.mapUser(user))));
  }

  getPendingPayments(): Observable<AdminPendingBooking[]> {
    return this.http
      .get<PaginatedResponse<BackendBooking>>(
        `${this.apiBaseUrl}/admin/pending-payments?limit=20`,
        this.requestOptions(),
      )
      .pipe(map((response) => response.data.map((booking) => this.mapPendingBooking(booking))));
  }

  approvePayment(bookingId: string): Observable<void> {
    return this.http.patch<void>(
      `${this.apiBaseUrl}/admin/approve-payment/${bookingId}`,
      {},
      this.requestOptions(),
    );
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http
      .get<WrappedResponse<DashboardStats>>(`${this.apiBaseUrl}/admin/dashboard-stats`, this.requestOptions())
      .pipe(map((response) => response.data));
  }

  private requestOptions(): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders(this.authService.getAuthHeaders()),
    };
  }

  private mapMovie(movie: BackendMovie): AdminMovie {
    return {
      id: movie._id,
      title: movie.title,
      description: movie.description,
      duration: movie.duration,
      genres: movie.genre,
      language: movie.language ?? 'Unknown',
      releaseDate: movie.releaseDate ?? '',
      posterUrl: movie.posterUrl,
      trailerUrl: movie.trailerUrl ?? '',
      rating: movie.rating ?? null,
      status: movie.status,
      createdAt: movie.createdAt,
    };
  }

  private mapHall(hall: BackendHall): AdminHall {
    return {
      id: hall._id,
      name: hall.name,
      rows: hall.rows,
      cols: hall.cols,
      availability: hall.availability,
      seatLayout: hall.seatLayout ?? [],
      createdAt: hall.createdAt,
    };
  }

  private mapShowtime(showtime: BackendShowtime): AdminShowtime {
    return {
      id: showtime._id,
      movieId: showtime.movieId._id,
      movieTitle: showtime.movieId.title,
      hallId: showtime.hallId._id,
      hallName: showtime.hallId.name,
      startTime: showtime.startTime,
      endTime: showtime.endTime,
      format: showtime.format ?? '',
      status: showtime.status,
      availableSeats: showtime.availableSeats,
      pricing: showtime.pricing,
    };
  }

  private mapMenuItem(item: BackendMenuItem): AdminMenuItem {
    return {
      id: item._id,
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl ?? '',
      category: item.category,
      price: item.price,
      isAvailable: item.isAvailable,
      createdAt: item.createdAt,
    };
  }

  private mapUser(user: BackendUser): AdminUserRecord {
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      provider: user.provider,
      confirmed: user.confirmed,
      phoneNumber: user.phoneNumber ?? 'N/A',
      createdAt: user.createdAt,
    };
  }

  private mapPendingBooking(booking: BackendBooking): AdminPendingBooking {
    return {
      id: booking._id,
      filmName: booking.filmName,
      customerName: booking.userId?.name ?? 'Unknown customer',
      customerEmail: booking.userId?.email ?? 'No email',
      hallName: booking.hallId?.name ?? 'Unknown hall',
      showtime: booking.showTimeId?.startTime ?? '',
      seats: booking.seats,
      totalAmount: booking.totalAmount,
      paymentStatus: booking.paymentStatus,
      paymentReference: booking.paymentReference ?? 'No reference',
      createdAt: booking.createdAt,
      expiresAt: booking.expiresAt ?? '',
    };
  }
}

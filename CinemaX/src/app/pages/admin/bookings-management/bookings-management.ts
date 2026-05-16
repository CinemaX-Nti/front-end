import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService, Booking } from '../../../services/booking.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-bookings-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bookings-management.html',
  styleUrl: './bookings-management.css',
})
export class BookingsManagementPage implements OnInit {
  private bookingService = inject(BookingService);

  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  selectedBooking: Booking | null = null;
  
  searchQuery: string = '';
  statusFilter: string = 'ALL';
  paymentFilter: string = 'ALL';
  errorMessage: string = '';

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.errorMessage = '';
    this.bookingService.getBookings().subscribe({
      next: (data) => {
        this.bookings = data;
        this.applyFilters();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error?.error?.message || 'Failed to load bookings from the backend.';
      }
    });
  }

  applyFilters(): void {
    let filtered = this.bookings;

    if (this.statusFilter !== 'ALL') {
      filtered = filtered.filter((booking) => booking.bookingStatus === this.statusFilter);
    }

    if (this.paymentFilter !== 'ALL') {
      filtered = filtered.filter((booking) => booking.paymentStatus === this.paymentFilter);
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter((booking) => 
        this.getBookingNumber(booking).toString().includes(query) ||
        booking.id.toLowerCase().includes(query) || 
        booking.customerName.toLowerCase().includes(query) ||
        booking.movieName.toLowerCase().includes(query)
      );
    }

    this.filteredBookings = filtered;
  }

  getBookingNumber(booking: Booking): number {
    const bookingIndex = this.bookings.findIndex((item) => item.id === booking.id);
    return bookingIndex >= 0 ? bookingIndex + 1 : 0;
  }

  approvePayment(booking: Booking): void {
    this.bookingService.approvePayment(booking.id).subscribe({
      next: () => {
        booking.bookingStatus = 'CONFIRMED';
        booking.paymentStatus = 'PAID';
        booking.canApprovePayment = false;
        this.applyFilters();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error?.error?.message || 'Failed to approve payment.';
      }
    });
  }

  actionLabel(booking: Booking): string {
    if (booking.paymentStatus === 'WAITING_TRANSFER') {
      return 'Confirm Booking';
    }

    if (booking.paymentStatus === 'WAITING_APPROVAL') {
      return 'Approve Payment';
    }

    return 'View Only';
  }

  openBookingDetails(booking: Booking): void {
    this.selectedBooking = booking;
  }

  closeBookingDetails(): void {
    this.selectedBooking = null;
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService, Booking } from '../../../services/booking.service';

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
      error: (error) => {
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
        booking.id.toLowerCase().includes(query) || 
        booking.customerName.toLowerCase().includes(query) ||
        booking.movieName.toLowerCase().includes(query)
      );
    }

    this.filteredBookings = filtered;
  }

  approvePayment(booking: Booking): void {
    this.bookingService.approvePayment(booking.id).subscribe({
      next: () => {
        booking.bookingStatus = 'CONFIRMED';
        booking.paymentStatus = 'PAID';
        booking.canApprovePayment = false;
        this.applyFilters();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to approve payment.';
      }
    });
  }

  explainUnavailableActions(): void {
    this.errorMessage = 'The backend currently supports payment approval only for bookings waiting for admin approval.';
  }
}

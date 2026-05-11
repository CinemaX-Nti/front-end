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

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.bookingService.getBookings().subscribe(data => {
      this.bookings = data;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    let filtered = this.bookings;

    if (this.statusFilter !== 'ALL') {
      filtered = filtered.filter(b => b.bookingStatus === this.statusFilter);
    }

    if (this.paymentFilter !== 'ALL') {
      filtered = filtered.filter(b => b.paymentStatus === this.paymentFilter);
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(b => 
        b.id.toLowerCase().includes(query) || 
        b.customerName.toLowerCase().includes(query) ||
        b.movieName.toLowerCase().includes(query)
      );
    }

    this.filteredBookings = filtered;
  }

  updateStatus(booking: Booking, newStatus: 'CONFIRMED' | 'CANCELLED' | 'PENDING'): void {
    this.bookingService.updateBookingStatus(booking.id, newStatus).subscribe(success => {
      if (success) {
        booking.bookingStatus = newStatus;
        this.applyFilters();
      }
    });
  }
}


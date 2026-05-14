import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  AdminDashboardService,
  AdminPendingBooking,
} from '../../../services/admin-dashboard.service';

type DashboardStat = {
  label: string;
  value: string;
  accent: 'blue' | 'green' | 'purple' | 'amber';
};

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboardPage implements OnInit {
  private readonly adminService = inject(AdminDashboardService);

  protected readonly dashboardLinks = [
    { label: 'Movies', route: '/admin/movies', action: 'Manage catalog', accent: 'blue' as const, section: 'movies' as const, icon: 'MV' },
    { label: 'Halls', route: '/admin/halls', action: 'Manage halls', accent: 'green' as const, section: 'halls' as const, icon: 'HL' },
    { label: 'Showtimes', route: '/admin/showtimes', action: 'Schedule shows', accent: 'purple' as const, section: 'showtimes' as const, icon: 'ST' },
    { label: 'Menu', route: '/admin/menu', action: 'Manage items', accent: 'amber' as const, section: 'menu' as const, icon: 'MN' },
    { label: 'Bookings', route: '/admin/bookings', action: 'Review payments', accent: 'rose' as const, section: 'bookings' as const, icon: 'BK' },
    { label: 'Users', route: '/admin/users', action: 'Review accounts', accent: 'slate' as const, section: 'users' as const, icon: 'US' },
  ];

  protected isLoading = true;
  protected feedbackMessage = '';
  protected feedbackTone: 'success' | 'error' = 'success';

  protected moviesCount = 0;
  protected hallsCount = 0;
  protected showtimesCount = 0;
  protected menuItemsCount = 0;
  protected usersCount = 0;
  protected pendingPayments: AdminPendingBooking[] = [];
  protected totalBookings = 0;
  protected totalRevenue = 0;
  protected activeShowtimes = 0;
  protected recentBookings: AdminPendingBooking[] = [];

  protected stats: DashboardStat[] = [];

  ngOnInit(): void {
    this.loadDashboard();
  }

  protected loadDashboard(): void {
    this.isLoading = true;
    this.clearFeedback();

    forkJoin({
      movies: this.adminService.getMovies(),
      halls: this.adminService.getHalls(),
      showtimes: this.adminService.getShowtimes(),
      menuItems: this.adminService.getMenuItems(),
      users: this.adminService.getUsers(),
      pendingPayments: this.adminService.getPendingPayments(),
      dashboardStats: this.adminService.getDashboardStats(),
    }).subscribe({
      next: ({ movies, halls, showtimes, menuItems, users, pendingPayments, dashboardStats }) => {
        this.moviesCount = movies.length;
        this.hallsCount = halls.length;
        this.showtimesCount = showtimes.length;
        this.menuItemsCount = menuItems.length;
        this.usersCount = users.length;
        this.pendingPayments = pendingPayments;
        this.totalBookings = dashboardStats.totalBookings;
        this.totalRevenue = dashboardStats.totalRevenue;
        this.activeShowtimes = dashboardStats.activeShowtimes;
        this.recentBookings = dashboardStats.recentBookings;
        this.stats = this.buildStats();
        this.isLoading = false;
      },
      error: (error: unknown) => {
        this.isLoading = false;
        this.showError(this.extractErrorMessage(error, 'Unable to load admin dashboard data.'));
      },
    });
  }

  protected approvePayment(booking: AdminPendingBooking): void {
    this.adminService.approvePayment(booking.id).subscribe({
      next: () => {
        this.pendingPayments = this.pendingPayments.filter((item) => item.id !== booking.id);
        this.stats = this.buildStats();
        this.showSuccess(`Payment approved for "${booking.filmName}".`);
      },
      error: (error: unknown) => {
        this.showError(this.extractErrorMessage(error, 'Could not approve payment.'));
      },
    });
  }

  protected formatMoney(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  protected formatDate(dateValue: string): string {
    if (!dateValue) {
      return 'N/A';
    }

    return new Date(dateValue).toLocaleString();
  }

  protected trackById(_index: number, item: { id: string }): string {
    return item.id;
  }

  protected sectionCount(section: 'movies' | 'halls' | 'showtimes' | 'menu' | 'bookings' | 'users'): number {
    switch (section) {
      case 'movies':
        return this.moviesCount;
      case 'halls':
        return this.hallsCount;
      case 'showtimes':
        return this.showtimesCount;
      case 'menu':
        return this.menuItemsCount;
      case 'bookings':
        return this.pendingPayments.length;
      case 'users':
        return this.usersCount;
    }
  }

  private buildStats(): DashboardStat[] {
    const revenueWaitingApproval = this.pendingPayments.reduce(
      (sum, booking) => sum + booking.totalAmount,
      0,
    );

    return [
      { label: 'Total Movies', value: String(this.moviesCount), accent: 'blue' },
      { label: 'Halls', value: String(this.hallsCount), accent: 'green' },
      { label: 'Active Showtimes', value: String(this.activeShowtimes), accent: 'purple' },
      { label: 'Total Bookings', value: String(this.totalBookings), accent: 'amber' },
      { label: 'Total Revenue', value: this.formatMoney(this.totalRevenue), accent: 'blue' },
      { label: 'Pending Payments', value: String(this.pendingPayments.length), accent: 'green' },
      { label: 'Awaiting Revenue', value: this.formatMoney(revenueWaitingApproval), accent: 'purple' },
    ];
  }

  private showSuccess(message: string): void {
    this.feedbackMessage = message;
    this.feedbackTone = 'success';
  }

  private showError(message: string): void {
    this.feedbackMessage = message;
    this.feedbackTone = 'error';
  }

  private clearFeedback(): void {
    this.feedbackMessage = '';
    this.feedbackTone = 'success';
  }

  private extractErrorMessage(error: unknown, fallback: string): string {
    if (
      typeof error === 'object' &&
      error !== null &&
      'error' in error &&
      typeof error.error === 'object' &&
      error.error !== null &&
      'message' in error.error &&
      typeof error.error.message === 'string'
    ) {
      return error.error.message;
    }

    return fallback;
  }
}

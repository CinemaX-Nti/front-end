import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  BookingInstructions,
  BookingReceipt,
  BookingService,
  CreateBookingResult,
} from '../../services/booking.service';
import { BookingFlowService } from '../../services/booking-flow.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, FormsModule],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.css',
})
export class CheckoutPage implements OnInit {
  private readonly router = inject(Router);
  private readonly bookingService = inject(BookingService);
  private readonly authService = inject(AuthService);
  readonly bookingFlow = inject(BookingFlowService);

  paymentReference = '';
  isSubmitting = false;
  isSubmittingForReview = false;
  feedbackMessage = '';
  feedbackTone: 'success' | 'error' = 'success';
  bookingResult: CreateBookingResult | null = null;
  confirmedReceipt: BookingReceipt | null = null;

  ngOnInit(): void {
    const session = this.bookingFlow.snapshot;
    if (!session.movie || !session.showtime || session.seats.length === 0) {
      this.router.navigate(['/movies']);
    }
  }

  get ticketTotal(): number {
    return this.bookingFlow.getSeatTotal();
  }

  get snackTotal(): number {
    return this.bookingFlow.getSnackTotal();
  }

  get total(): number {
    return this.bookingFlow.getGrandTotal();
  }

  get paymentInstructions(): BookingInstructions | null {
    return this.bookingResult?.paymentInstructions ?? null;
  }

  get receipt(): BookingReceipt | null {
    return this.confirmedReceipt ?? this.bookingResult?.booking ?? null;
  }

  confirmBooking(): void {
    const session = this.bookingFlow.snapshot;
    const user = this.authService.currentUserValue;

    if (!session.showtime || !user) {
      sessionStorage.setItem('authRedirectUrl', this.router.url);
      this.router.navigate(['/sign-in']);
      return;
    }

    this.isSubmitting = true;
    this.feedbackMessage = '';

    this.bookingService.createBooking({
      userId: user._id,
      showTimeId: session.showtime.id ?? '',
      seats: session.seats.map((seat) => seat.id),
      foodItems: session.snacks.map((snack) => ({
        itemId: snack.item.id,
        quantity: snack.quantity,
      })),
      paymentReference: this.paymentReference.trim() || undefined,
    }).subscribe({
      next: (result) => {
        this.bookingResult = result;
        this.confirmedReceipt = null;
        this.isSubmitting = false;
        this.setFeedback(result.message, 'success');
      },
      error: (error) => {
        this.isSubmitting = false;
        this.setFeedback(error?.error?.message || 'We could not create your booking right now.', 'error');
      },
    });
  }

  submitForReview(): void {
    const bookingId = this.bookingResult?.booking.id;
    if (!bookingId) {
      return;
    }

    this.isSubmittingForReview = true;
    this.feedbackMessage = '';

    this.bookingService.submitBookingForReview(bookingId).subscribe({
      next: (response) => {
        this.confirmedReceipt = response.booking;
        this.isSubmittingForReview = false;
        this.setFeedback(response.message, 'success');
      },
      error: (error) => {
        this.isSubmittingForReview = false;
        this.setFeedback(error?.error?.message || 'We could not submit your payment for review.', 'error');
      },
    });
  }

  private setFeedback(message: string, tone: 'success' | 'error'): void {
    this.feedbackMessage = message;
    this.feedbackTone = tone;
  }
}

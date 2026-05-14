import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { BookingFlowService } from '../../services/booking-flow.service';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.css',
})
export class CheckoutPage implements OnInit {
  private readonly router = inject(Router);
  readonly bookingFlow = inject(BookingFlowService);

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
}

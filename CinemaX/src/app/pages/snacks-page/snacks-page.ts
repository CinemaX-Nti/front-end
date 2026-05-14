import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookingFlowService } from '../../services/booking-flow.service';
import { MenuItem, MenuService } from '../../services/menu.service';

type SnackFilter = 'ALL' | MenuItem['category'];

@Component({
  selector: 'app-snacks-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './snacks-page.html',
  styleUrl: './snacks-page.css',
})
export class SnacksPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly menuService = inject(MenuService);
  readonly bookingFlow = inject(BookingFlowService);

  items: MenuItem[] = [];
  activeFilter: SnackFilter = 'ALL';

  ngOnInit(): void {
    const movieId = this.route.snapshot.paramMap.get('id');
    const showtimeId = this.route.snapshot.paramMap.get('showtimeId');
    const session = this.bookingFlow.snapshot;

    if (!movieId || !showtimeId || !session.movie || !session.showtime || session.seats.length === 0) {
      this.router.navigate(['/movies']);
      return;
    }

    this.menuService.getMenuItems().subscribe((items) => {
      this.items = items;
    });
  }

  get filteredItems(): MenuItem[] {
    return this.activeFilter === 'ALL'
      ? this.items
      : this.items.filter((item) => item.category === this.activeFilter);
  }

  get selectedSeatLabels(): string[] {
    return this.bookingFlow.snapshot.seats.map((seat) => seat.id);
  }

  get snackTotal(): number {
    return this.bookingFlow.getSnackTotal();
  }

  get ticketTotal(): number {
    return this.bookingFlow.getSeatTotal();
  }

  get grandTotal(): number {
    return this.bookingFlow.getGrandTotal();
  }

  get selectedSnacks() {
    return this.bookingFlow.snapshot.snacks;
  }

  getQuantity(itemId: string): number {
    return this.bookingFlow.getSnackQuantity(itemId);
  }

  setFilter(filter: SnackFilter): void {
    this.activeFilter = filter;
  }

  addItem(item: MenuItem): void {
    if (!item.isAvailable) {
      return;
    }

    this.bookingFlow.updateSnack(item, this.getQuantity(item.id) + 1);
  }

  decreaseItem(item: MenuItem): void {
    const current = this.getQuantity(item.id);
    if (current <= 0) {
      return;
    }

    this.bookingFlow.updateSnack(item, current - 1);
  }

  continueToCheckout(): void {
    const session = this.bookingFlow.snapshot;
    this.router.navigate(['/movies', session.movie?.id, 'showtimes', session.showtime?.id, 'checkout']);
  }
}

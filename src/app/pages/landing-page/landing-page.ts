import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {
  private readonly authService = inject(AuthService);

  protected get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  protected get isAdmin(): boolean {
    return this.authService.currentUserValue?.role === 'admin';
  }
}

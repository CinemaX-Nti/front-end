import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, UserRole } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  protected get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  protected get isUser(): boolean {
    return this.authService.isUser();
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/landing']);
  }
}

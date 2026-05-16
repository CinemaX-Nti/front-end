import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected isMenuOpen = false;

  protected get isAuthenticated(): boolean {
    const auth = this.authService.isAuthenticated();
    console.log('Navbar isAuthenticated:', auth);
    return auth;
  }

  protected get isAdmin(): boolean {
    const admin = this.authService.currentUserValue?.role === 'admin';
    console.log('Navbar isAdmin:', admin, 'User:', this.authService.currentUserValue);
    return admin;
  }

  protected toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  protected closeMenu(): void {
    this.isMenuOpen = false;
  }

  protected openSearch(): void {
    this.closeMenu();
    this.router.navigate(['/movies']);
  }

  protected logout(): void {
    this.closeMenu();
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
})
export class SignInPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  email: string = '';
  password: string = '';
  isSubmitting: boolean = false;
  errorMessage: string = '';

  onSignIn(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Email and password are required';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    // Mock authentication - determine role based on email domain
    setTimeout(() => {
      const role = this.email.includes('admin') ? 'admin' : 'user';
      this.authService.login(role);
      this.router.navigate([`/${role}`]);
    }, 1000);
  }
}

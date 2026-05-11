import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.html',
  styleUrls: ['./auth.css']
})
export class AuthComponent implements OnDestroy {
  private authService = inject(AuthService);
  // View toggles
  isLoginView = true;
  isForgotPasswordView = false;
  resetStep: 1 | 2 | 3 = 1;
  days = Array.from({ length: 31 }, (_, i) => i + 1);
  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  years: number[] = [];
  constructor() {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 100; i--) {
      this.years.push(i);
    }
  }
  // Password visibility toggles
  showPassword = false;
  showRegisterPassword = false;
  showConfirmPassword = false;
  showNewPassword = false;
  showConfirmNewPassword = false;

  // Loading states
  isLoading = false;
  isResendLoading = false;
  isGoogleLoading = false;
  resendTimer = 0;
  private timerInterval: any;

  // Login form
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  // Registration form with password match validator
  registerForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required]),
    birthDay: new FormControl('', [Validators.required]),
    birthMonth: new FormControl('', [Validators.required]),
    birthYear: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required])
  }, { validators: this.passwordMatchValidator });

  // Forgot Password Step 1: Request verification code
  forgotPasswordStep1Form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  // Forgot Password Step 2: Verify PIN
  forgotPasswordStep2Form = new FormGroup({
    pin: new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(6)])
  });

  // Forgot Password Step 3: Reset password
  forgotPasswordStep3Form = new FormGroup({
    newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmNewPassword: new FormControl('', [Validators.required])
  }, { validators: this.passwordMatchValidator });

  // Password match validator
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password') || control.get('newPassword');
    const confirmPassword = control.get('confirmPassword') || control.get('confirmNewPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  // Toggle methods
  toggleView(): void {
    this.isLoginView = !this.isLoginView;
    this.isForgotPasswordView = false;
    this.resetStep = 1;
  }

  togglePassword(field: string): void {
    switch (field) {
      case 'login': this.showPassword = !this.showPassword; break;
      case 'register': this.showRegisterPassword = !this.showRegisterPassword; break;
      case 'confirm': this.showConfirmPassword = !this.showConfirmPassword; break;
      case 'new': this.showNewPassword = !this.showNewPassword; break;
      case 'confirmNew': this.showConfirmNewPassword = !this.showConfirmNewPassword; break;
    }
  }

  // Forgot password navigation
  showForgotPassword(): void {
    this.isForgotPasswordView = true;
    this.resetStep = 1;
    this.forgotPasswordStep1Form.reset();
    this.forgotPasswordStep2Form.reset();
    this.forgotPasswordStep3Form.reset();
  }

  backToLogin(): void {
    this.isForgotPasswordView = false;
    this.resetStep = 1;
    this.stopResendTimer();
  }

  // Form submission handlers
  onSubmit(): void {
    if (this.isLoginView) {
      if (this.loginForm.valid) {
        this.isLoading = true;
        console.log('Login Form Value:', this.loginForm.value);
        setTimeout(() => this.isLoading = false, 2000);
      } else {
        this.loginForm.markAllAsTouched();
      }
    } else {
      if (this.registerForm.valid) {
        this.isLoading = true;
        console.log('Register Form Value:', this.registerForm.value);
        setTimeout(() => this.isLoading = false, 2000);
      } else {
        this.registerForm.markAllAsTouched();
      }
    }
  }

  sendVerificationCode(): void {
    if (this.forgotPasswordStep1Form.valid) {
      this.isLoading = true;
      console.log('Sending verification code to:', this.forgotPasswordStep1Form.value.email);
      setTimeout(() => {
        this.isLoading = false;
        this.resetStep = 2;
        this.startResendTimer();
      }, 1500);
    } else {
      this.forgotPasswordStep1Form.markAllAsTouched();
    }
  }

  verifyCode(): void {
    if (this.forgotPasswordStep2Form.valid) {
      this.isLoading = true;
      console.log('Verifying PIN:', this.forgotPasswordStep2Form.value.pin);
      setTimeout(() => {
        this.isLoading = false;
        this.resetStep = 3;
        this.stopResendTimer();
      }, 1500);
    } else {
      this.forgotPasswordStep2Form.markAllAsTouched();
    }
  }

  resetPassword(): void {
    if (this.forgotPasswordStep3Form.valid) {
      this.isLoading = true;
      console.log('Resetting password with:', this.forgotPasswordStep3Form.value);
      setTimeout(() => {
        this.isLoading = false;
        this.backToLogin();
        alert('Password reset successful! Please sign in with your new password.');
      }, 1500);
    } else {
      this.forgotPasswordStep3Form.markAllAsTouched();
    }
  }

  resendCode(): void {
    if (this.resendTimer > 0) return;
    this.isResendLoading = true;
    console.log('Resending verification code...');
    setTimeout(() => {
      this.isResendLoading = false;
      this.startResendTimer();
    }, 1000);
  }

  private startResendTimer(): void {
    this.resendTimer = 60;
    this.stopResendTimer();
    this.timerInterval = setInterval(() => {
      this.resendTimer--;
      if (this.resendTimer <= 0) {
        this.stopResendTimer();
      }
    }, 1000);
  }

  private stopResendTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.resendTimer = 0;
  }

  // Google Sign-In
  signInWithGoogle(): void {
    this.isGoogleLoading = true;
    this.authService.signInWithGoogle().subscribe({
      next: (response) => {
        console.log('Google sign-in successful:', response);
        this.isGoogleLoading = false;
      },
      error: (error) => {
        console.error('Google sign-in failed:', error);
        this.isGoogleLoading = false;
        alert('Google sign-in failed. Please try again.');
      }
    });
  }

  ngOnDestroy(): void {
    this.stopResendTimer();
  }
}

import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
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
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private readonly destroy$ = new Subject<void>();
  private resetEmail = '';

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

    this.setAuthViewFromUrl();
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => this.setAuthViewFromUrl());
  }
  // Password visibility toggles
  showPassword = false;
  showRegisterPassword = false;
  showConfirmPassword = false;
  showNewPassword = false;
  showConfirmNewPassword = false;
  isConfirmEmailView = false;
  authMessage = '';
  authMessageType: 'success' | 'error' = 'success';
  otpIndexes = [0, 1, 2, 3, 4, 5];


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

  confirmEmailForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    otp: new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(6)]),
  });

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
    const target = this.isLoginView ? '/sign-up' : '/sign-in';
    this.router.navigate([target]);
    this.isForgotPasswordView = false;
    this.isConfirmEmailView = false;
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

  private setAuthViewFromUrl(): void {
    const url = this.router.url;
    if (url.startsWith('/confirm-email')) {
      this.isConfirmEmailView = true;
      this.isLoginView = false;
      this.isForgotPasswordView = false;
      const email = this.route.snapshot.queryParamMap.get('email') ?? '';
      this.confirmEmailForm.patchValue({ email });
    } else if (url.startsWith('/sign-up')) {
      this.isConfirmEmailView = false;
      this.isLoginView = false;
      this.isForgotPasswordView = false;
    } else {
      this.isConfirmEmailView = false;
      this.isLoginView = true;
      this.isForgotPasswordView = false;
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
    this.router.navigate(['/sign-in']);
    this.isForgotPasswordView = false;
    this.isConfirmEmailView = false;
    this.resetStep = 1;
    this.stopResendTimer();
  }

  // Form submission handlers
  onSubmit(): void {
    if (this.isLoginView) {
      if (this.loginForm.valid) {
        this.isLoading = true;
        this.clearMessage();
        this.authService.signIn({
          email: this.loginForm.value.email ?? '',
          password: this.loginForm.value.password ?? ''
        }).subscribe({
          next: (response) => {
            this.isLoading = false;
            this.setMessage(response.message || 'Signed in successfully.', 'success');
          },
          error: (error) => {
            this.isLoading = false;
            this.setMessage(error?.error?.message || 'Sign in failed.', 'error');
          }
        });
      } else {
        this.loginForm.markAllAsTouched();
      }
    } else {
      if (this.registerForm.valid) {
        this.isLoading = true;
        this.clearMessage();
        const birthDay = Number(this.registerForm.value.birthDay ?? 1);
        const birthMonth = Number(this.registerForm.value.birthMonth ?? 1);
        const birthYear = Number(this.registerForm.value.birthYear ?? new Date().getFullYear());
        const dateOfBirth = `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;

        this.authService.signUp({
          firstName: this.registerForm.value.firstName ?? '',
          lastName: this.registerForm.value.lastName ?? '',
          email: this.registerForm.value.email ?? '',
          password: this.registerForm.value.password ?? '',
          phoneNumber: this.registerForm.value.phone ?? '',
          dateOfBirth,
        }).subscribe({
          next: (response) => {
            this.isLoading = false;
            const email = this.registerForm.value.email ?? '';
            const requiresEmailConfirmation = response.data?.requiresEmailConfirmation ?? true;

            if (requiresEmailConfirmation) {
              this.setMessage(response.message || 'Account created. Please confirm your email.', 'success');
              void this.router.navigate(['/confirm-email'], { queryParams: { email } });
              this.startResendTimer();
            } else {
              this.setMessage(response.message || 'Account created successfully. Please sign in.', 'success');
              void this.router.navigate(['/sign-in']);
            }
          },
          error: (error) => {
            this.isLoading = false;
            this.setMessage(error?.error?.message || 'Sign up failed.', 'error');
          }
        });
      } else {
        this.registerForm.markAllAsTouched();
      }
    }
  }

  sendVerificationCode(): void {
    if (this.forgotPasswordStep1Form.valid) {
      this.isLoading = true;
      this.clearMessage();
      const email = this.forgotPasswordStep1Form.value.email ?? '';
      this.authService.requestPasswordReset(email).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.resetEmail = email;
          this.resetStep = 2;
          this.startResendTimer();
          this.setMessage(response.message || 'Verification code sent.', 'success');
        },
        error: (error) => {
          this.isLoading = false;
          this.setMessage(error?.error?.message || 'Could not send verification code.', 'error');
        }
      });
    } else {
      this.forgotPasswordStep1Form.markAllAsTouched();
    }
  }

  verifyCode(): void {
    if (this.forgotPasswordStep2Form.valid) {
      this.clearMessage();
      this.resetStep = 3;
      this.stopResendTimer();
    } else {
      this.forgotPasswordStep2Form.markAllAsTouched();
    }
  }

  resetPassword(): void {
    if (this.forgotPasswordStep3Form.valid) {
      this.isLoading = true;
      this.clearMessage();
      this.authService.resetPassword({
        email: this.resetEmail,
        otp: this.forgotPasswordStep2Form.value.pin ?? '',
        newPassword: this.forgotPasswordStep3Form.value.newPassword ?? '',
      }).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.backToLogin();
          this.setMessage(response.message || 'Password reset successful. Please sign in.', 'success');
        },
        error: (error) => {
          this.isLoading = false;
          this.setMessage(error?.error?.message || 'Password reset failed.', 'error');
        }
      });
    } else {
      this.forgotPasswordStep3Form.markAllAsTouched();
    }
  }

  resendCode(): void {
    if (this.resendTimer > 0) return;
    this.isResendLoading = true;
    this.clearMessage();
    this.authService.resendPasswordResetOtp(this.resetEmail).subscribe({
      next: (response) => {
        this.isResendLoading = false;
        this.startResendTimer();
        this.setMessage(response.message || 'Verification code resent.', 'success');
      },
      error: (error) => {
        this.isResendLoading = false;
        this.setMessage(error?.error?.message || 'Could not resend verification code.', 'error');
      }
    });
  }

  confirmEmail(): void {
    if (!this.confirmEmailForm.valid) {
      this.confirmEmailForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.clearMessage();
    this.authService.confirmEmail({
      email: this.confirmEmailForm.value.email ?? '',
      otp: this.confirmEmailForm.value.otp ?? '',
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.stopResendTimer();
        this.setMessage(response.message || 'Email confirmed successfully.', 'success');
        this.router.navigate(['/sign-in']);
      },
      error: (error) => {
        this.isLoading = false;
        this.setMessage(error?.error?.message || 'Email confirmation failed.', 'error');
      }
    });
  }

  resendConfirmationCode(): void {
    if (this.resendTimer > 0) return;
    if (!this.confirmEmailForm.value.email) {
      this.setMessage('Email is required to resend the confirmation code.', 'error');
      return;
    }

    this.isResendLoading = true;
    this.clearMessage();
    this.authService.resendConfirmationOtp(this.confirmEmailForm.value.email).subscribe({
      next: (response) => {
        this.isResendLoading = false;
        this.startResendTimer();
        this.setMessage(response.message || 'Confirmation code resent.', 'success');
      },
      error: (error) => {
        this.isResendLoading = false;
        this.setMessage(error?.error?.message || 'Could not resend confirmation code.', 'error');
      }
    });
  }

  onOtpBoxInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '').slice(-1);
    const otpChars = this.confirmOtpSlots();
    otpChars[index] = value;
    this.confirmEmailForm.patchValue({ otp: otpChars.join('') }, { emitEvent: false });
    input.value = value;

    if (value && input.nextElementSibling instanceof HTMLInputElement) {
      input.nextElementSibling.focus();
      input.nextElementSibling.select();
    }
  }

  onOtpBoxKeydown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
    const otpChars = this.confirmOtpSlots();

    if (event.key === 'Backspace' && !input.value && index > 0) {
      const previous = input.previousElementSibling;
      if (previous instanceof HTMLInputElement) {
        otpChars[index - 1] = '';
        this.confirmEmailForm.patchValue({ otp: otpChars.join('') }, { emitEvent: false });
        previous.focus();
        previous.value = '';
      }
    }
  }

  onOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedValue = event.clipboardData?.getData('text')?.replace(/\D/g, '').slice(0, 6) ?? '';
    this.confirmEmailForm.patchValue({ otp: pastedValue }, { emitEvent: false });
  }

  confirmOtpSlots(): string[] {
    const otp = this.confirmEmailForm.value.otp ?? '';
    return Array.from({ length: 6 }, (_, index) => otp[index] ?? '');
  }

  private setMessage(message: string, type: 'success' | 'error'): void {
    this.authMessage = message;
    this.authMessageType = type;
  }

  private clearMessage(): void {
    this.authMessage = '';
    this.authMessageType = 'success';
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
        this.isGoogleLoading = false;
        this.setMessage(response.message || 'Google sign-in successful.', 'success');
      },
      error: (error) => {
        this.isGoogleLoading = false;
        this.setMessage(error?.error?.message || 'Google sign-in failed. Please try again.', 'error');
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopResendTimer();
  }
}

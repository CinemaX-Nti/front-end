import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.html',
  styleUrls: ['./auth.css']
})
export class AuthComponent {
  isLoginView = true;
  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  onForgotPassword(event: Event) {
    event.preventDefault();
    console.log('Forgot password clicked! Redirect to recovery page...');

  }

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  registerForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required]),
    dob: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  toggleView(): void {
    this.isLoginView = !this.isLoginView;
  }

  onSubmit(): void {
    if (this.isLoginView) {
      if (this.loginForm.valid) {
        console.log('Login Form Value:', this.loginForm.value);
      } else {
        console.log('Login form is invalid');
        this.loginForm.markAllAsTouched();
      }
    } else {
      if (this.registerForm.valid) {
        console.log('Register Form Value:', this.registerForm.value);
      } else {
        console.log('Register form is invalid');
        this.registerForm.markAllAsTouched();
      }
    }
  }
}

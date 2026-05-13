import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, from, BehaviorSubject } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';

// Firebase imports
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';

// Environment config - Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCU21oo8BxUbW9uNYpjh-S8Y-61SRZrSw8",
  authDomain: "cinemax-2bfad.firebaseapp.com",
  projectId: "cinemax-2bfad",
  storageBucket: "cinemax-2bfad.firebasestorage.app",
  messagingSenderId: "518922036535",
  appId: "1:518922036535:web:10dbf01048033cee5966b2",
  measurementId: "G-WBF5RPRFDZ"
};
export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  provider: string;
  photoUrl?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  dateOfBirth?: string;
}

export interface BasicResponse {
  success: boolean;
  message: string;
}

export interface SignUpResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    requiresEmailConfirmation?: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private app: FirebaseApp;
  private auth: ReturnType<typeof getAuth>;
  private googleProvider: GoogleAuthProvider;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private apiUrl = 'http://localhost:3000/users';

  private isGoogleLoadingSubject = new BehaviorSubject<boolean>(false);
  public isGoogleLoading$ = this.isGoogleLoadingSubject.asObservable();

  constructor() {
    // Initialize Firebase
    this.app = initializeApp(firebaseConfig);
    this.auth = getAuth(this.app);
    this.googleProvider = new GoogleAuthProvider();

    // Listen to auth state changes
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        // User is signed in
        console.log('Firebase user:', user);
      } else {
        // User is signed out
        this.currentUserSubject.next(null);
      }
    });

    // Check for stored token on init
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  /**
   * Sign in with Google using Firebase popup
   */
  signInWithGoogle(): Observable<AuthResponse> {
    this.isGoogleLoadingSubject.next(true);

    return from(signInWithPopup(this.auth, this.googleProvider)).pipe(
      switchMap((result) => {
        const user = result.user;
        return this.handleGoogleLogin(user);
      }),
      tap((response) => {
        this.handleAuthSuccess(response);
        this.isGoogleLoadingSubject.next(false);
      }),
      catchError((error) => {
        this.isGoogleLoadingSubject.next(false);
        console.error('Google sign-in error:', error);
        throw error;
      })
    );
  }

  signIn(payload: SignInPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signin`, payload).pipe(
      tap((response) => {
        this.handleAuthSuccess(response);
      }),
    );
  }

  signUp(payload: SignUpPayload): Observable<SignUpResponse> {
    return this.http.post<SignUpResponse>(`${this.apiUrl}/signup`, payload);
  }

  requestPasswordReset(email: string): Observable<BasicResponse> {
    return this.http.post<BasicResponse>(`${this.apiUrl}/forget-password`, { email });
  }

  resendPasswordResetOtp(email: string): Observable<BasicResponse> {
    return this.http.post<BasicResponse>(`${this.apiUrl}/resend-password-reset-otp`, { email });
  }

  resetPassword(payload: { email: string; otp: string; newPassword: string }): Observable<BasicResponse> {
    return this.http.post<BasicResponse>(`${this.apiUrl}/reset-password`, payload);
  }

  confirmEmail(payload: { email: string; otp: string }): Observable<BasicResponse> {
    return this.http.post<BasicResponse>(`${this.apiUrl}/confirm-email`, payload);
  }

  resendConfirmationOtp(email: string): Observable<BasicResponse> {
    return this.http.post<BasicResponse>(`${this.apiUrl}/resend-confirmation-otp`, { email });
  }

  /**
   * Send Google user data to backend
   */
  private handleGoogleLogin(firebaseUser: FirebaseUser): Observable<AuthResponse> {
    // Get the ID token from Firebase
    return from(firebaseUser.getIdToken()).pipe(
      switchMap((idToken) => {
        // Send the token to your backend
        return this.http.post<AuthResponse>(`${this.apiUrl}/google`, {
          idToken
        });
      })
    );
  }

  /**
   * Handle successful authentication
   */
  private handleAuthSuccess(response: AuthResponse): void {
    if (response.success && response.data) {
      const { user, token } = response.data;

      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Update current user subject
      this.currentUserSubject.next(user);

      console.log('Login successful:', user);

      this.router.navigate([user.role === 'admin' ? '/admin' : '/']);
    }
  }

  /**
   * Mock login for development
   */
  mockLogin(role: string): void {
    const mockUser: User = {
      _id: 'mock-123',
      name: 'Mock User',
      email: 'mock@example.com',
      role: role,
      provider: 'local'
    };
    
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    this.currentUserSubject.next(mockUser);
  }

  /**
   * Get current user value
   */
  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get auth token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Logout user
   */
  logout(): void {
    // Sign out from Firebase
    signOut(this.auth).then(() => {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Update subject
      this.currentUserSubject.next(null);

      // Redirect to auth page
      this.router.navigate(['/']);
    });
  }

  /**
   * Get auth headers for HTTP requests
   */
  getAuthHeaders(): { [header: string]: string } {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

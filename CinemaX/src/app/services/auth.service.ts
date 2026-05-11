import { Injectable, computed, signal } from '@angular/core';

export type UserRole = 'admin' | 'user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly roleState = signal<UserRole>('user');
  private readonly authState = signal<boolean>(false);

  readonly role = this.roleState.asReadonly();
  readonly isAdmin = computed(() => this.roleState() === 'admin');
  readonly isUser = computed(() => this.roleState() === 'user');
  readonly isAuthenticated = computed(() => this.authState());

  setRole(role: UserRole): void {
    this.roleState.set(role);
  }

  login(role: UserRole): void {
    this.roleState.set(role);
    this.authState.set(true);
  }

  logout(): void {
    this.authState.set(false);
    this.roleState.set('user');
  }
}

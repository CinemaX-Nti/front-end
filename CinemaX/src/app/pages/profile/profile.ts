import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class ProfilePage implements OnInit, OnDestroy {
  constructor() {
    console.log('Profile component constructor called');
  }
  private readonly authService = inject(AuthService);

  protected user: User | null = null;
  protected isLoading = true;
  protected isEditing = false;
  protected isSubmitting = false;
  protected feedbackMessage = '';
  protected feedbackTone: 'success' | 'error' = 'success';

  protected profileForm = {
    name: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
  };

  ngOnInit(): void {
    console.log('Profile component initialized - ngOnInit called');
    console.log('Current route:', window.location.pathname);
    this.loadUserProfile();
  }

  protected loadUserProfile(): void {
    console.log('Loading user profile...');
    console.log('Auth service token:', this.authService.getToken());
    console.log('Auth service current user:', this.authService.currentUserValue);

    this.user = this.authService.currentUserValue;
    console.log('User from auth service:', this.user);

    // For testing, if no user, create a mock user
    if (!this.user) {
      console.log('No user found, creating mock user for testing');
      this.user = {
        _id: 'mock-user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        provider: 'local',
        confirmed: true,
        phoneNumber: '+1234567890',
        dateOfBirth: '1990-01-01T00:00:00.000Z',
        createdAt: new Date().toISOString()
      };
    }

    if (this.user) {
      this.profileForm = {
        name: this.user.name || '',
        email: this.user.email || '',
        phoneNumber: this.user.phoneNumber || '',
        dateOfBirth: this.user.dateOfBirth ? new Date(this.user.dateOfBirth).toISOString().split('T')[0] : '',
      };
      console.log('Profile form set:', this.profileForm);
    }
    this.isLoading = false;
  }

  ngOnDestroy(): void {
    console.log('Profile component destroyed');
  }

  protected toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.loadUserProfile(); // Reset form
    }
  }

  protected saveProfile(): void {
    if (!this.user) return;

    // Basic validation
    if (!this.profileForm.name.trim()) {
      this.showError('Name is required');
      return;
    }

    this.isSubmitting = true;
    this.clearFeedback();

    // For now, just update locally since we don't have a backend endpoint for profile updates
    // In a real app, you'd call an API to update the user profile
    const updatedUser = {
      ...this.user,
      name: this.profileForm.name.trim(),
      phoneNumber: this.profileForm.phoneNumber.trim(),
      dateOfBirth: this.profileForm.dateOfBirth ? new Date(this.profileForm.dateOfBirth).toISOString() : undefined,
    };

    // Update the auth service user
    this.authService.updateCurrentUser(updatedUser);
    this.user = updatedUser;
    this.isEditing = false;
    this.isSubmitting = false;
    this.showSuccess('Profile updated successfully');
  }

  protected formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  }

  private showSuccess(message: string): void {
    this.feedbackMessage = message;
    this.feedbackTone = 'success';
  }

  private showError(message: string): void {
    this.feedbackMessage = message;
    this.feedbackTone = 'error';
  }

  private clearFeedback(): void {
    this.feedbackMessage = '';
  }
}

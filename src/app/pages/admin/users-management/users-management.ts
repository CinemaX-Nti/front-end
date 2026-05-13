import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, AdminUser } from '../../../services/user.service';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-management.html',
  styleUrl: './users-management.css',
})
export class UsersManagementPage implements OnInit {
  private userService = inject(UserService);
  
  users: AdminUser[] = [];
  filteredUsers: AdminUser[] = [];
  searchQuery: string = '';
  errorMessage: string = '';

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.errorMessage = '';
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to load users from the backend.';
      }
    });
  }

  filterUsers(): void {
    if (!this.searchQuery) {
      this.filteredUsers = this.users;
      return;
    }
    
    const query = this.searchQuery.toLowerCase();
    this.filteredUsers = this.users.filter((user) => 
      user.name.toLowerCase().includes(query) || 
      user.email.toLowerCase().includes(query) ||
      user.phone.toLowerCase().includes(query)
    );
  }

  explainUnavailableActions(): void {
    this.errorMessage = 'The backend currently exposes a read-only admin users list. Role change and delete endpoints are not implemented yet.';
  }
}

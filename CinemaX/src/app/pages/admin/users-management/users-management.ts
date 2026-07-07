import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminDashboardService, AdminUserRecord } from '../../../services/admin-dashboard.service';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-management.html',
  styleUrl: './users-management.css',
})
export class UsersManagementPage implements OnInit {
  private readonly adminService = inject(AdminDashboardService);
  
  users: AdminUserRecord[] = [];
  filteredUsers: AdminUserRecord[] = [];
  searchQuery: string = '';
  errorMessage: string = '';

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.errorMessage = '';
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data;
      },
      error: (error: HttpErrorResponse) => {
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
      user.phoneNumber.toLowerCase().includes(query)
    );
  }

  explainUnavailableActions(): void {
    this.errorMessage = 'The backend currently exposes a read-only admin users list. Role change and delete endpoints are not implemented yet.';
  }
}

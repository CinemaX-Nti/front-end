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

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(data => {
      this.users = data;
      this.filteredUsers = data;
    });
  }

  filterUsers(): void {
    if (!this.searchQuery) {
      this.filteredUsers = this.users;
      return;
    }
    
    const query = this.searchQuery.toLowerCase();
    this.filteredUsers = this.users.filter(u => 
      u.name.toLowerCase().includes(query) || 
      u.email.toLowerCase().includes(query) ||
      u.phone.includes(query)
    );
  }

  toggleRole(user: AdminUser): void {
    const newRole = user.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
    this.userService.updateUserRole(user.id, newRole).subscribe(success => {
      if (success) {
        user.role = newRole;
      }
    });
  }

  deleteUser(user: AdminUser): void {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      this.userService.deleteUser(user.id).subscribe(success => {
        if (success) {
          this.loadUsers();
        }
      });
    }
  }
}


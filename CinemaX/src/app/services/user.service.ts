import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'CUSTOMER';
  provider: string;
  emailStatus: 'VERIFIED' | 'UNVERIFIED';
  joinedDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Mock data based on Figma design
  private mockUsers: AdminUser[] = [
    { id: 'USR-001', name: 'John Doe', email: 'john@example.com', phone: '+1 234 567 8900', role: 'ADMIN', provider: 'Local', emailStatus: 'VERIFIED', joinedDate: '2026-01-15' },
    { id: 'USR-002', name: 'Jane Smith', email: 'jane.smith@gmail.com', phone: '+1 987 654 3210', role: 'CUSTOMER', provider: 'Google', emailStatus: 'VERIFIED', joinedDate: '2026-02-20' },
    { id: 'USR-003', name: 'Mike Johnson', email: 'mike.j@example.com', phone: '+1 555 123 4567', role: 'CUSTOMER', provider: 'Local', emailStatus: 'UNVERIFIED', joinedDate: '2026-03-05' },
    { id: 'USR-004', name: 'Sarah Williams', email: 'sarah.w@example.com', phone: '+1 444 987 6543', role: 'CUSTOMER', provider: 'Google', emailStatus: 'VERIFIED', joinedDate: '2026-04-10' },
    { id: 'USR-005', name: 'David Brown', email: 'david.b@example.com', phone: '+1 222 333 4444', role: 'ADMIN', provider: 'Local', emailStatus: 'VERIFIED', joinedDate: '2026-05-01' },
  ];

  constructor() {}

  getUsers(): Observable<AdminUser[]> {
    return of(this.mockUsers);
  }

  updateUserRole(id: string, newRole: 'ADMIN' | 'CUSTOMER'): Observable<boolean> {
    const user = this.mockUsers.find(u => u.id === id);
    if (user) {
      user.role = newRole;
      return of(true);
    }
    return of(false);
  }

  deleteUser(id: string): Observable<boolean> {
    const initialLength = this.mockUsers.length;
    this.mockUsers = this.mockUsers.filter(u => u.id !== id);
    return of(this.mockUsers.length < initialLength);
  }
}

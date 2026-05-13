import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';

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

interface UsersResponse {
  success: boolean;
  data: Array<{
    _id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    role: 'user' | 'admin';
    provider: string;
    confirmed: boolean;
    createdAt: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = 'http://localhost:3000/users';

  getUsers(): Observable<AdminUser[]> {
    return this.http.get<UsersResponse>(this.apiUrl, this.requestOptions()).pipe(
      map((response) =>
        response.data.map((user) => ({
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phoneNumber ?? 'N/A',
          role: user.role === 'admin' ? 'ADMIN' : 'CUSTOMER',
          provider: user.provider === 'google' ? 'Google' : 'Local',
          emailStatus: user.confirmed ? 'VERIFIED' : 'UNVERIFIED',
          joinedDate: user.createdAt,
        })),
      ),
    );
  }

  private requestOptions(): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders(this.authService.getAuthHeaders()),
    };
  }
}

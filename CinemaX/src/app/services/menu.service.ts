import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface MenuItem {
  id: string;
  name: string;
  category: 'SNACK' | 'BEVERAGE' | 'COMBO';
  description: string;
  price: number;
  isAvailable: boolean;
  image?: string;
  imageUrl?: string;
}

interface BackendMenuItem {
  _id: string;
  name: string;
  description: string;
  imageUrl?: string;
  category: string;
  price: number;
  isAvailable: boolean;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
}

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  getMenuItems(): Observable<MenuItem[]> {
    return this.http
      .get<PaginatedResponse<BackendMenuItem>>(
        `${environment.api.baseUrl}/restaurant/menu?limit=100`,
        this.requestOptions(),
      )
      .pipe(map((response) => (response.data ?? []).map((item) => this.mapMenuItem(item))));
  }

  toggleAvailability(id: string): Observable<boolean> {
    return this.http
      .get<BackendMenuItem>(`${environment.api.baseUrl}/restaurant/menu/${id}`, this.requestOptions())
      .pipe(
        map((item) => ({
          name: item.name,
          description: item.description,
          imageUrl: item.imageUrl ?? '',
          category: item.category,
          price: item.price,
          isAvailable: !item.isAvailable,
        })),
        switchMap((payload) =>
          this.http.put<BackendMenuItem>(
            `${environment.api.baseUrl}/restaurant/menu/${id}`,
            payload,
            this.requestOptions(),
          ),
        ),
        map(() => true),
      );
  }

  deleteItem(id: string): Observable<boolean> {
    return this.http
      .delete(`${environment.api.baseUrl}/restaurant/menu/${id}`, this.requestOptions())
      .pipe(map(() => true));
  }

  addItem(item: Omit<MenuItem, 'id'>): Observable<MenuItem> {
    return this.http
      .post<BackendMenuItem>(
        `${environment.api.baseUrl}/restaurant/menu`,
        {
          ...item,
          category: item.category,
        },
        this.requestOptions(),
      )
      .pipe(map((createdItem) => this.mapMenuItem(createdItem)));
  }

  updateItem(id: string, item: Omit<MenuItem, 'id'>): Observable<MenuItem> {
    return this.http
      .put<BackendMenuItem>(
        `${environment.api.baseUrl}/restaurant/menu/${id}`,
        {
          ...item,
          category: item.category,
        },
        this.requestOptions(),
      )
      .pipe(map((updatedItem) => this.mapMenuItem(updatedItem)));
  }

  private requestOptions(): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders(this.authService.getAuthHeaders()),
    };
  }

  private mapMenuItem(item: BackendMenuItem): MenuItem {
    return {
      id: item._id,
      name: item.name,
      description: item.description,
      image: item.imageUrl?.trim() || undefined,
      imageUrl: item.imageUrl?.trim() || '',
      category: this.normalizeCategory(item.category),
      price: item.price,
      isAvailable: item.isAvailable,
    };
  }

  private normalizeCategory(category: string): MenuItem['category'] {
    const normalizedCategory = (category ?? '').trim().toUpperCase();

    if (normalizedCategory === 'BEVERAGE' || normalizedCategory === 'COMBO') {
      return normalizedCategory;
    }

    return 'SNACK';
  }
}

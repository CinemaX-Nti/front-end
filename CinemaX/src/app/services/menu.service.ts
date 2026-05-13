import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { AuthService } from './auth.service';

export interface MenuItem {
  id: string;
  name: string;
  category: 'SNACK' | 'BEVERAGE' | 'COMBO';
  description: string;
  price: number;
  isAvailable: boolean;
  image?: string;
}

interface MenuResponse {
  success: boolean;
  data: Array<{
    _id: string;
    name: string;
    category: string;
    description: string;
    price: number;
    isAvailable: boolean;
  }>;
}

type BackendMenuItem = MenuResponse['data'][number];

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = 'http://localhost:3000/restaurant/menu';

  getMenuItems(): Observable<MenuItem[]> {
    return forkJoin([
      this.http.get<MenuResponse>(`${this.apiUrl}?isAvailable=true&limit=100&sortBy=createdAt&sortOrder=desc`, this.requestOptions()),
      this.http.get<MenuResponse>(`${this.apiUrl}?isAvailable=false&limit=100&sortBy=createdAt&sortOrder=desc`, this.requestOptions()),
    ]).pipe(
      map(([availableResponse, unavailableResponse]) => {
        const uniqueItems = new Map<string, BackendMenuItem>();

        [...availableResponse.data, ...unavailableResponse.data].forEach((item) => {
          uniqueItems.set(item._id, item);
        });

        return Array.from(uniqueItems.values()).map((item) => this.mapMenuItem(item));
      }),
    );
  }

  toggleAvailability(item: MenuItem): Observable<MenuItem> {
    return this.http.put<BackendMenuItem>(
      `${this.apiUrl}/${item.id}`,
      {
        name: item.name,
        category: this.toBackendCategory(item.category),
        description: item.description,
        price: item.price,
        isAvailable: !item.isAvailable,
      },
      this.requestOptions(),
    ).pipe(map((updatedItem) => this.mapMenuItem(updatedItem)));
  }

  deleteItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.requestOptions());
  }

  addItem(item: Omit<MenuItem, 'id'>): Observable<MenuItem> {
    return this.http.post<BackendMenuItem>(
      this.apiUrl,
      {
        name: item.name,
        category: this.toBackendCategory(item.category),
        description: item.description,
        price: item.price,
        isAvailable: item.isAvailable,
      },
      this.requestOptions(),
    ).pipe(map((createdItem) => this.mapMenuItem(createdItem)));
  }

  private mapMenuItem(item: BackendMenuItem): MenuItem {
    return {
      id: item._id,
      name: item.name,
      category: this.toUiCategory(item.category),
      description: item.description,
      price: item.price,
      isAvailable: item.isAvailable,
    };
  }

  private toUiCategory(category: string): MenuItem['category'] {
    const normalized = category.trim().toUpperCase();
    if (normalized === 'BEVERAGE' || normalized === 'BEVERAGES') {
      return 'BEVERAGE';
    }
    if (normalized === 'COMBO' || normalized === 'COMBOS') {
      return 'COMBO';
    }
    return 'SNACK';
  }

  private toBackendCategory(category: MenuItem['category']): string {
    return category.toLowerCase();
  }

  private requestOptions(): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders(this.authService.getAuthHeaders()),
    };
  }
}

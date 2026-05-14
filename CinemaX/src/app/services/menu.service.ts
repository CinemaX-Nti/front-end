import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface MenuItem {
  id: string;
  name: string;
  category: 'SNACK' | 'BEVERAGE' | 'COMBO';
  description: string;
  price: number;
  isAvailable: boolean;
  image?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private mockItems: MenuItem[] = [
    {
      id: 'MENU-01',
      name: 'Classic Popcorn',
      category: 'SNACK',
      description: 'Large buttered popcorn',
      price: 8,
      isAvailable: true,
      image: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'MENU-02',
      name: 'Caramel Popcorn',
      category: 'SNACK',
      description: 'Sweet caramel-coated popcorn',
      price: 9,
      isAvailable: true,
      image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'MENU-03',
      name: 'Nachos & Cheese',
      category: 'SNACK',
      description: 'Crispy nachos with cheese dip',
      price: 7,
      isAvailable: true,
      image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'MENU-04',
      name: 'Soft Drink',
      category: 'BEVERAGE',
      description: 'Large fountain drink',
      price: 5,
      isAvailable: true,
      image: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'MENU-05',
      name: 'Bottled Water',
      category: 'BEVERAGE',
      description: 'Refreshing bottled water',
      price: 3,
      isAvailable: true,
      image: 'https://images.unsplash.com/photo-1564419438221-03d6b7b95fa5?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'MENU-06',
      name: 'Movie Combo',
      category: 'COMBO',
      description: 'Popcorn + 2 drinks + nachos',
      price: 20,
      isAvailable: true,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'MENU-07',
      name: 'Hot Dog',
      category: 'SNACK',
      description: 'Classic cinema hot dog',
      price: 6,
      isAvailable: true,
      image: 'https://images.unsplash.com/photo-1612392062798-4245d405b79c?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'MENU-08',
      name: 'Candy Mix',
      category: 'SNACK',
      description: 'Assorted movie candies',
      price: 4,
      isAvailable: false,
      image: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=200&q=80',
    },
  ];

  constructor() {}

  getMenuItems(): Observable<MenuItem[]> {
    return of(this.mockItems);
  }

  toggleAvailability(id: string): Observable<boolean> {
    const item = this.mockItems.find((i) => i.id === id);
    if (item) {
      item.isAvailable = !item.isAvailable;
      return of(true);
    }
    return of(false);
  }

  deleteItem(id: string): Observable<boolean> {
    const initialLength = this.mockItems.length;
    this.mockItems = this.mockItems.filter((i) => i.id !== id);
    return of(this.mockItems.length < initialLength);
  }

  addItem(item: Omit<MenuItem, 'id'>): Observable<MenuItem> {
    const newItem: MenuItem = {
      ...item,
      id: `MENU-${Math.floor(10 + Math.random() * 90)}`, // Generate random ID like MENU-45
    };
    this.mockItems = [...this.mockItems, newItem];
    return of(newItem);
  }
}

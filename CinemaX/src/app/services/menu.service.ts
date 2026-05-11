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
  providedIn: 'root'
})
export class MenuService {
  private mockItems: MenuItem[] = [
    { id: 'MENU-01', name: 'Large Popcorn', category: 'SNACK', description: 'Freshly popped buttery popcorn', price: 8.50, isAvailable: true },
    { id: 'MENU-02', name: 'Medium Popcorn', category: 'SNACK', description: 'Classic movie theater popcorn', price: 6.50, isAvailable: true },
    { id: 'MENU-03', name: 'Nachos with Cheese', category: 'SNACK', description: 'Crispy tortilla chips with hot cheddar', price: 7.00, isAvailable: true },
    { id: 'MENU-04', name: 'Large Soda', category: 'BEVERAGE', description: '32oz fountain drink of your choice', price: 5.50, isAvailable: true },
    { id: 'MENU-05', name: 'Bottled Water', category: 'BEVERAGE', description: '500ml pure spring water', price: 3.50, isAvailable: true },
    { id: 'MENU-06', name: 'Couple Combo', category: 'COMBO', description: '1 Large Popcorn + 2 Medium Drinks', price: 17.00, isAvailable: true },
    { id: 'MENU-07', name: 'M&Ms Peanut', category: 'SNACK', description: 'Share size chocolate candy', price: 4.50, isAvailable: false },
  ];

  constructor() {}

  getMenuItems(): Observable<MenuItem[]> {
    return of(this.mockItems);
  }

  toggleAvailability(id: string): Observable<boolean> {
    const item = this.mockItems.find(i => i.id === id);
    if (item) {
      item.isAvailable = !item.isAvailable;
      return of(true);
    }
    return of(false);
  }

  deleteItem(id: string): Observable<boolean> {
    const initialLength = this.mockItems.length;
    this.mockItems = this.mockItems.filter(i => i.id !== id);
    return of(this.mockItems.length < initialLength);
  }

  addItem(item: Omit<MenuItem, 'id'>): Observable<MenuItem> {
    const newItem: MenuItem = {
      ...item,
      id: `MENU-${Math.floor(10 + Math.random() * 90)}` // Generate random ID like MENU-45
    };
    this.mockItems = [...this.mockItems, newItem];
    return of(newItem);
  }
}

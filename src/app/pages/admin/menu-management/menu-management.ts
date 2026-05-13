import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService, MenuItem } from '../../../services/menu.service';

@Component({
  selector: 'app-menu-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu-management.html',
  styleUrl: './menu-management.css',
})
export class MenuManagementPage implements OnInit {
  private menuService = inject(MenuService);

  menuItems: MenuItem[] = [];
  filteredItems: MenuItem[] = [];
  searchQuery: string = '';
  selectedCategory: string = 'ALL';
  errorMessage: string = '';
  searchPlaceholder = 'Search by item name or description';

  ngOnInit(): void {
    this.loadMenuItems();
  }

  loadMenuItems(): void {
    this.errorMessage = '';
    this.menuService.getMenuItems().subscribe({
      next: (data) => {
        this.menuItems = data;
        this.applyFilters();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to load menu items from the backend.';
      }
    });
  }

  applyFilters(): void {
    let filtered = this.menuItems;

    if (this.selectedCategory !== 'ALL') {
      filtered = filtered.filter((item) => item.category === this.selectedCategory);
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter((item) => 
        item.name.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query)
      );
    }

    this.filteredItems = filtered;
  }

  setCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  toggleAvailability(item: MenuItem): void {
    this.menuService.toggleAvailability(item).subscribe({
      next: (updatedItem) => {
        const targetItem = this.menuItems.find((menuItem) => menuItem.id === updatedItem.id);
        if (targetItem) {
          targetItem.isAvailable = updatedItem.isAvailable;
        }
        this.applyFilters();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to update menu item availability.';
      }
    });
  }

  deleteItem(item: MenuItem): void {
    if (confirm(`Are you sure you want to delete ${item.name}?`)) {
      this.menuService.deleteItem(item.id).subscribe({
        next: () => {
          this.loadMenuItems();
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Failed to delete menu item.';
        }
      });
    }
  }

  isAddModalOpen = false;
  newItem: Omit<MenuItem, 'id'> = {
    name: '',
    category: 'SNACK',
    description: '',
    price: 0,
    isAvailable: true
  };

  openAddModal(): void {
    this.isAddModalOpen = true;
    this.newItem = {
      name: '',
      category: 'SNACK',
      description: '',
      price: 0,
      isAvailable: true
    };
  }

  closeAddModal(): void {
    this.isAddModalOpen = false;
  }

  saveNewItem(): void {
    if (!this.newItem.name || !this.newItem.description || this.newItem.price <= 0) {
      alert('Please fill all required fields correctly.');
      return;
    }

    this.errorMessage = '';
    this.menuService.addItem(this.newItem).subscribe({
      next: () => {
        this.closeAddModal();
        this.searchQuery = '';
        this.selectedCategory = 'ALL';
        this.loadMenuItems();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to add menu item.';
      }
    });
  }
}

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

  ngOnInit(): void {
    this.loadMenuItems();
  }

  loadMenuItems(): void {
    this.menuService.getMenuItems().subscribe(data => {
      this.menuItems = data;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    let filtered = this.menuItems;

    if (this.selectedCategory !== 'ALL') {
      filtered = filtered.filter(item => item.category === this.selectedCategory);
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
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
    this.menuService.toggleAvailability(item.id).subscribe(success => {
      if (success) {
        item.isAvailable = !item.isAvailable;
      }
    });
  }

  deleteItem(item: MenuItem): void {
    if (confirm(`Are you sure you want to delete ${item.name}?`)) {
      this.menuService.deleteItem(item.id).subscribe(success => {
        if (success) {
          this.loadMenuItems();
        }
      });
    }
  }

  // Add Menu Item Modal Logic
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
    
    this.menuService.addItem(this.newItem).subscribe(() => {
      this.closeAddModal();
      this.loadMenuItems();
    });
  }
}


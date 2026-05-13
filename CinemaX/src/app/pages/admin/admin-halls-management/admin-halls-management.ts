import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  AdminDashboardService,
  AdminHall,
  CreateHallPayload,
} from '../../../services/admin-dashboard.service';

@Component({
  selector: 'app-admin-halls-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-halls-management.html',
  styleUrl: './admin-halls-management.css',
})
export class AdminHallsManagementPage implements OnInit {
  private readonly adminService = inject(AdminDashboardService);

  protected readonly hallTemplates = [
    { label: 'Small Hall', rows: 6, cols: 10, standardRows: 'A,B,C,D', premiumRows: 'E', vipRows: 'F' },
    { label: 'Standard Hall', rows: 8, cols: 12, standardRows: 'A,B,C,D', premiumRows: 'E,F', vipRows: 'G,H' },
    { label: 'Large Hall', rows: 10, cols: 14, standardRows: 'A,B,C,D,E,F', premiumRows: 'G,H', vipRows: 'I,J' },
  ];

  protected halls: AdminHall[] = [];
  protected isLoading = true;
  protected isSubmitting = false;
  protected feedbackMessage = '';
  protected feedbackTone: 'success' | 'error' = 'success';

  protected hallForm = {
    template: 'Standard Hall',
    name: '',
    rows: 8,
    cols: 12,
    availability: true,
    standardRows: 'A,B,C,D',
    premiumRows: 'E,F',
    vipRows: 'G,H',
  };

  ngOnInit(): void {
    this.loadHalls();
  }

  protected loadHalls(): void {
    this.isLoading = true;
    this.adminService.getHalls().subscribe({
      next: (halls) => {
        this.halls = halls;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showError('Unable to load halls.');
      },
    });
  }

  protected submitHall(): void {
    const payload: CreateHallPayload = {
      name: this.hallForm.name.trim(),
      rows: Number(this.hallForm.rows),
      cols: Number(this.hallForm.cols),
      availability: this.hallForm.availability,
      seatLayout: this.buildSeatLayout(),
    };

    if (!payload.name) {
      this.showError('Hall name is required.');
      return;
    }

    this.isSubmitting = true;
    this.adminService.createHall(payload).subscribe({
      next: (hall) => {
        this.halls = [hall, ...this.halls];
        this.resetForm();
        this.isSubmitting = false;
        this.showSuccess(`Hall "${hall.name}" was added.`);
      },
      error: (error: unknown) => {
        this.isSubmitting = false;
        this.showError(this.extractErrorMessage(error, 'Hall creation failed.'));
      },
    });
  }

  protected deleteHall(hall: AdminHall): void {
    if (!window.confirm(`Delete hall "${hall.name}"?`)) {
      return;
    }

    this.adminService.deleteHall(hall.id).subscribe({
      next: () => {
        this.halls = this.halls.filter((item) => item.id !== hall.id);
        this.showSuccess(`Hall "${hall.name}" was deleted.`);
      },
      error: () => {
        this.showError('Hall deletion failed.');
      },
    });
  }

  protected applyHallTemplate(templateLabel: string): void {
    const template = this.hallTemplates.find((item) => item.label === templateLabel);
    if (!template) return;

    this.hallForm = {
      ...this.hallForm,
      template: template.label,
      rows: template.rows,
      cols: template.cols,
      standardRows: template.standardRows,
      premiumRows: template.premiumRows,
      vipRows: template.vipRows,
    };
  }

  protected trackById(_index: number, item: { id: string }): string {
    return item.id;
  }

  private buildSeatLayout(): CreateHallPayload['seatLayout'] {
    const groups: Array<{ type: 'standard' | 'premium' | 'vip'; input: string }> = [
      { type: 'standard', input: this.hallForm.standardRows },
      { type: 'premium', input: this.hallForm.premiumRows },
      { type: 'vip', input: this.hallForm.vipRows },
    ];

    return groups
      .map((group) => ({
        type: group.type,
        rows: group.input.split(',').map((row) => row.trim().toUpperCase()).filter(Boolean).sort(),
      }))
      .filter((group) => group.rows.length > 0);
  }

  private resetForm(): void {
    this.hallForm = {
      template: 'Standard Hall',
      name: '',
      rows: 8,
      cols: 12,
      availability: true,
      standardRows: 'A,B,C,D',
      premiumRows: 'E,F',
      vipRows: 'G,H',
    };
  }

  private showSuccess(message: string): void {
    this.feedbackMessage = message;
    this.feedbackTone = 'success';
  }

  private showError(message: string): void {
    this.feedbackMessage = message;
    this.feedbackTone = 'error';
  }

  private extractErrorMessage(error: unknown, fallback: string): string {
    if (
      typeof error === 'object' &&
      error !== null &&
      'error' in error &&
      typeof error.error === 'object' &&
      error.error !== null &&
      'errors' in error.error &&
      Array.isArray(error.error.errors) &&
      error.error.errors.length > 0
    ) {
      const firstError = error.error.errors[0];
      if (typeof firstError === 'object' && firstError !== null && 'message' in firstError && typeof firstError.message === 'string') {
        return firstError.message;
      }
    }
    if (
      typeof error === 'object' &&
      error !== null &&
      'error' in error &&
      typeof error.error === 'object' &&
      error.error !== null &&
      'message' in error.error &&
      typeof error.error.message === 'string'
    ) {
      return error.error.message;
    }
    return fallback;
  }
}

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CategoryDialogComponent } from './category-dialog/category-dialog.component';
@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.scss']
})
export class AdminCategoriesComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private dialog = inject(MatDialog);
  categories = signal<Category[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  ngOnInit(): void {
    this.loadCategories();
  }
  loadCategories(): void {
    this.isLoading.set(true);
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Failed to load categories');
        this.isLoading.set(false);
      }
    });
  }
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '500px',
      data: { mode: 'create' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCategories();
      }
    });
  }
  openEditDialog(category: Category): void {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '500px',
      data: { mode: 'edit', category }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCategories();
      }
    });
  }
  deleteCategory(category: Category): void {
    if (category.questionCount > 0) {
      alert(`Cannot delete "${category.categoryName}" because it has ${category.questionCount} questions.`);
      return;
    }
    if (confirm(`Are you sure you want to delete "${category.categoryName}"?`)) {
      this.categoryService.deleteCategory(category.categoryId).subscribe({
        next: () => {
          this.loadCategories();
          alert('Category deleted successfully!');
        },
        error: (error) => {
          alert(error.error?.message || 'Failed to delete category');
        }
      });
    }
  }
}
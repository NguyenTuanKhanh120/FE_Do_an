import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CategoryService } from '../../../services/category.service';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../../../models/category.model';

export interface CategoryDialogData {
  mode: 'create' | 'edit';
  category?: Category;
}

@Component({
  selector: 'app-category-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './category-dialog.component.html',
  styleUrls: ['./category-dialog.component.scss']
})
export class CategoryDialogComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    public dialogRef: MatDialogRef<CategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CategoryDialogData
  ) {
    this.form = this.fb.group({
      categoryName: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]]
    });
  }

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.category) {
      this.form.patchValue({
        categoryName: this.data.category.categoryName,
        description: this.data.category.description || '',
        slug: this.data.category.slug || ''
      });
    }

    // Auto-generate slug when category name changes
    this.form.get('categoryName')?.valueChanges.subscribe(value => {
      if (this.data.mode === 'create' || !this.data.category) {
        const slug = this.generateSlug(value);
        this.form.patchValue({ slug }, { emitEvent: false });
      }
    });
  }

  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')  // Remove special chars
      .replace(/\s+/g, '-')          // Replace spaces with -
      .replace(/-+/g, '-')           // Replace multiple - with single -
      .trim();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formValue = this.form.value;

    if (this.data.mode === 'create') {
      const createData: CreateCategoryRequest = {
        categoryName: formValue.categoryName,
        description: formValue.description,
        slug: formValue.slug
      };

      this.categoryService.createCategory(createData).subscribe({
        next: () => {
          this.isLoading = false;
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Failed to create category';
        }
      });
    } else {
      const updateData: UpdateCategoryRequest = {
        categoryName: formValue.categoryName,
        description: formValue.description,
        slug: formValue.slug
      };

      this.categoryService.updateCategory(this.data.category!.categoryId, updateData).subscribe({
        next: () => {
          this.isLoading = false;
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Failed to update category';
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  get categoryName() {
    return this.form.get('categoryName');
  }

  get description() {
    return this.form.get('description');
  }

  get slug() {
    return this.form.get('slug');
  }
}
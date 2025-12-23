import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TagService } from '../../../services/tag.service';
import { TagDetail, CreateTagRequest, UpdateTagRequest } from '../../../models/tag.model';

export interface TagDialogData {
  mode: 'create' | 'edit';
  tag?: TagDetail;
}

@Component({
  selector: 'app-tag-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './tag-dialog.component.html',
  styleUrls: ['./tag-dialog.component.scss']
})
export class TagDialogComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private tagService: TagService,
    public dialogRef: MatDialogRef<TagDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TagDialogData
  ) {
    this.form = this.fb.group({
      tagName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(255)]]
    });
  }

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.tag) {
      this.form.patchValue({
        tagName: this.data.tag.tagName,
        description: this.data.tag.description || ''
      });
    }
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
      const createData: CreateTagRequest = {
        tagName: formValue.tagName,
        description: formValue.description || undefined
      };

      this.tagService.createTag(createData).subscribe({
        next: () => {
          this.isLoading = false;
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Failed to create tag';
        }
      });
    } else {
      const updateData: UpdateTagRequest = {
        tagName: formValue.tagName,
        description: formValue.description || undefined
      };

      this.tagService.updateTag(this.data.tag!.tagId, updateData).subscribe({
        next: () => {
          this.isLoading = false;
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Failed to update tag';
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  get tagName() {
    return this.form.get('tagName');
  }

  get description() {
    return this.form.get('description');
  }
}


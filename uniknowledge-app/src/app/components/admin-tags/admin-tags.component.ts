import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagService } from '../../services/tag.service';
import { TagDetail } from '../../models/tag.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TagDialogComponent } from './tag-dialog/tag-dialog.component';

@Component({
  selector: 'app-admin-tags',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './admin-tags.component.html',
  styleUrls: ['./admin-tags.component.scss']
})
export class AdminTagsComponent implements OnInit {
  private tagService = inject(TagService);
  private dialog = inject(MatDialog);
  tags = signal<TagDetail[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  ngOnInit(): void {
    this.loadTags();
  }

  loadTags(): void {
    this.isLoading.set(true);
    this.tagService.getTags().subscribe({
      next: (tags) => {
        this.tags.set(tags);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Failed to load tags');
        this.isLoading.set(false);
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(TagDialogComponent, {
      width: '500px',
      data: { mode: 'create' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTags();
      }
    });
  }

  openEditDialog(tag: TagDetail): void {
    const dialogRef = this.dialog.open(TagDialogComponent, {
      width: '500px',
      data: { mode: 'edit', tag }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTags();
      }
    });
  }

  deleteTag(tag: TagDetail): void {
    if (tag.questionCount > 0) {
      alert(`Cannot delete "${tag.tagName}" because it has ${tag.questionCount} question(s).`);
      return;
    }
    if (confirm(`Are you sure you want to delete "${tag.tagName}"?`)) {
      this.tagService.deleteTag(tag.tagId).subscribe({
        next: () => {
          this.loadTags();
          alert('Tag deleted successfully!');
        },
        error: (error) => {
          alert(error.error?.message || 'Failed to delete tag');
        }
      });
    }
  }
}


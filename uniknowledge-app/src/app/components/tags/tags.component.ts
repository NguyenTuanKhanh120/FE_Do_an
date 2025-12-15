import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagService } from '../../services/tag.service';
import { TagDetail } from '../../models/tag.model';

@Component({
  selector: 'app-tags',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss']
})
export class TagsComponent implements OnInit {
  private tagService = inject(TagService);
  
  tags = signal<TagDetail[]>([]);
  isLoading = signal<boolean>(false);

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
        console.error('Error loading tags:', error);
        this.isLoading.set(false);
      }
    });
  }
}


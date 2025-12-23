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
  popularTags = signal<TagDetail[]>([]);
  trendingTags = signal<TagDetail[]>([]);
  activeTab = signal<'all' | 'popular' | 'trending'>('all');
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadAllTags();
    this.loadPopularTags();
    this.loadTrendingTags();
  }

  loadAllTags(): void {
    this.isLoading.set(true);
    this.tagService.getTags().subscribe({
      next: (tags) => {
        this.tags.set(tags);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  loadPopularTags(): void {
    this.tagService.getPopularTags(20).subscribe({
      next: (tags) => {
        this.popularTags.set(tags);
      }
    });
  }

  loadTrendingTags(): void {
    this.tagService.getTrendingTags(7, 20).subscribe({
      next: (tags) => {
        this.trendingTags.set(tags);
      }
    });
  }

  setActiveTab(tab: 'all' | 'popular' | 'trending'): void {
    this.activeTab.set(tab);
  }

  getCurrentTags(): TagDetail[] {
    switch (this.activeTab()) {
      case 'popular': return this.popularTags();
      case 'trending': return this.trendingTags();
      default: return this.tags();
    }
  }
}


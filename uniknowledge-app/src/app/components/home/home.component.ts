import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuestionService } from '../../services/question.service';
import { CategoryService } from '../../services/category.service';
import { TagService } from '../../services/tag.service';
import { Question } from '../../models/question.model';
import { Category } from '../../models/category.model';
import { TagDetail } from '../../models/tag.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private questionService = inject(QuestionService);
  private categoryService = inject(CategoryService);
  private tagService = inject(TagService);

  questions = signal<Question[]>([]);
  categories = signal<Category[]>([]);
  popularTags = signal<TagDetail[]>([]);
  isLoading = signal<boolean>(false);
  
  searchTerm = '';
  selectedCategoryId?: number;
  selectedTagId?: number;

  ngOnInit(): void {
    this.loadQuestions();
    this.loadCategories();
    this.loadPopularTags();
  }

  loadQuestions(): void {
    this.isLoading.set(true);
    this.questionService.getQuestions(
      this.searchTerm || undefined,
      this.selectedCategoryId,
      this.selectedTagId
    ).subscribe({
      next: (questions) => {
        this.questions.set(questions);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: () => {
        // Error loading categories
      }
    });
  }

  loadPopularTags(): void {
    this.tagService.getPopularTags(10).subscribe({
      next: (tags) => {
        this.popularTags.set(tags);
      },
      error: () => {
        // Error loading tags
      }
    });
  }

  onSearch(): void {
    this.loadQuestions();
  }

  onCategoryChange(categoryId: string): void {
    this.selectedCategoryId = categoryId ? parseInt(categoryId) : undefined;
    this.loadQuestions();
  }

  onTagClick(tagId: number): void {
    this.selectedTagId = tagId;
    this.loadQuestions();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategoryId = undefined;
    this.selectedTagId = undefined;
    this.loadQuestions();
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
  }
}


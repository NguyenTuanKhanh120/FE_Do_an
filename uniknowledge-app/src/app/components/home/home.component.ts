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
  selectedTagIds = signal<number[]>([]);
  tagFilterLogic = signal<'AND' | 'OR'>('OR');

  // Pagination
  currentPage = signal<number>(1);
  pageSize = 20;
  totalQuestions = signal<number>(0);

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
      this.selectedTagId,
      undefined,
      this.currentPage(),
      this.pageSize
    ).subscribe({
      next: (questions) => {
        this.questions.set(questions);
        this.totalQuestions.set(questions.length);
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
    const currentTags = this.selectedTagIds();
    const index = currentTags.indexOf(tagId);

    if (index > -1) {
      // Remove tag
      this.selectedTagIds.set(currentTags.filter(id => id !== tagId));
    } else {
      // Add tag
      this.selectedTagIds.set([...currentTags, tagId]);
    }

    this.loadQuestionsWithMultipleTags();
  }

  loadQuestionsWithMultipleTags(): void {
    const tagIds = this.selectedTagIds();

    if (tagIds.length === 0) {
      this.loadQuestions();
      return;
    }

    this.isLoading.set(true);
    this.tagService.filterQuestionsByTags({
      tagIds: tagIds,
      logic: this.tagFilterLogic(),
      page: 1,
      pageSize: 20
    }).subscribe({
      next: (response) => {
        this.questions.set(response.questions);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  toggleTagFilterLogic(): void {
    this.tagFilterLogic.set(this.tagFilterLogic() === 'AND' ? 'OR' : 'AND');
    if (this.selectedTagIds().length > 1) {
      this.loadQuestionsWithMultipleTags();
    }
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategoryId = undefined;
    this.selectedTagId = undefined;
    this.selectedTagIds.set([]);
    this.currentPage.set(1);
    this.loadQuestions();
  }

  // Pagination methods
  nextPage(): void {
    this.currentPage.update(page => page + 1);
    this.loadQuestions();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
      this.loadQuestions();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadQuestions();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get totalPages(): number {
    return Math.ceil(this.totalQuestions() / this.pageSize);
  }

  get hasNextPage(): boolean {
    return this.questions().length === this.pageSize;
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


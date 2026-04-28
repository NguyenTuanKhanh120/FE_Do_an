import { Component, input, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Question } from '../../../models/question.model';
import { QuestionStatsComponent } from '../question-stats/question-stats.component';
import { QuestionContentComponent } from '../question-content/question-content.component';
import { QuestionService } from '../../../services/question.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-question-item',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, QuestionStatsComponent, QuestionContentComponent],
  templateUrl: './question-item.component.html',
  styleUrls: ['./question-item.component.scss']
})
export class QuestionItemComponent {
  private questionService = inject(QuestionService);
  authService = inject(AuthService);

  question = input.required<Question>();
  tagClick = output<number>();

  // State cho Share Modal
  showShareModal = signal<boolean>(false);
  shareContent = '';
  isSharing = signal<boolean>(false);

  // Event thông báo đã share thành công (parent có thể reload danh sách)
  shared = output<Question>();

  onTagClick(tagId: number): void {
    this.tagClick.emit(tagId);
  }

  /** Mở modal share */
  openShareModal(): void {
    if (!this.authService.isAuthenticated()) {
      alert('Please login to share questions.');
      return;
    }
    this.shareContent = '';
    this.showShareModal.set(true);
  }

  /** Đóng modal share */
  closeShareModal(): void {
    this.showShareModal.set(false);
  }

  /** Gọi API share */
  confirmShare(): void {
    // Nếu là bài share → share bài gốc thay vì share lại bài share
    const targetId = this.question().originalQuestionId || this.question().questionId;

    this.isSharing.set(true);
    this.questionService.shareQuestion(targetId, this.shareContent || undefined).subscribe({
      next: (result) => {
        this.isSharing.set(false);
        this.closeShareModal();
        this.shared.emit(result);
        alert('Shared successfully!');
      },
      error: () => {
        this.isSharing.set(false);
        alert('Failed to share. Please try again.');
      }
    });
  }
}

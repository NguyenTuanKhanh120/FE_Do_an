import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { QuestionService } from '../../services/question.service';
import { AnswerService } from '../../services/answer.service';
import { VoteService } from '../../services/vote.service';
import { AuthService } from '../../services/auth.service';
import { Question } from '../../models/question.model';
import { Answer } from '../../models/answer.model';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-question-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './question-detail.component.html',
  styleUrls: ['./question-detail.component.scss']
})
export class QuestionDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private questionService = inject(QuestionService);
  private answerService = inject(AnswerService);
  private voteService = inject(VoteService);
  private dialog = inject(MatDialog);
  authService = inject(AuthService);

  question = signal<Question | null>(null);
  answers = signal<Answer[]>([]);
  isLoading = signal<boolean>(false);
  answerForm: FormGroup;

  constructor() {
    this.answerForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(20)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadQuestion(parseInt(id));
      this.loadAnswers(parseInt(id));
    }
  }

  loadQuestion(id: number): void {
    this.isLoading.set(true);
    this.questionService.getQuestionById(id).subscribe({
      next: (question) => {
        this.question.set(question);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  loadAnswers(questionId: number): void {
    this.answerService.getAnswersByQuestionId(questionId).subscribe({
      next: (answers) => {
        this.answers.set(answers);
      }
    });
  }

  voteQuestion(voteType: 'upvote' | 'downvote'): void {
    const question = this.question();
    if (!question) return;

    this.voteService.voteQuestion(question.questionId, voteType).subscribe({
      next: () => {
        this.loadQuestion(question.questionId);
      },
      error: (error) => {
        alert(error.error?.message || 'Failed to vote');
      }
    });
  }

  voteAnswer(answerId: number, voteType: 'upvote' | 'downvote'): void {
    this.voteService.voteAnswer(answerId, voteType).subscribe({
      next: () => {
        const question = this.question();
        if (question) {
          this.loadAnswers(question.questionId);
        }
      },
      error: (error) => {
        alert(error.error?.message || 'Failed to vote');
      }
    });
  }

  submitAnswer(): void {
    if (this.answerForm.invalid) {
      this.answerForm.markAllAsTouched();
      return;
    }

    const question = this.question();
    if (!question) return;

    this.answerService.createAnswer(question.questionId, this.answerForm.value).subscribe({
      next: () => {
        this.answerForm.reset();
        this.loadAnswers(question.questionId);
        this.loadQuestion(question.questionId);
      },
      error: (error) => {
        alert(error.error?.message || 'Failed to submit answer');
      }
    });
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getFileName(fileUrl: string): string {
    try {
      // Handle both full URL and relative path
      let path: string;
      if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
        const url = new URL(fileUrl);
        path = url.pathname;
      } else {
        path = fileUrl;
      }
      
      const pathParts = path.split('/');
      const fileName = pathParts[pathParts.length - 1];
      return fileName || 'attachment';
    } catch {
      // If parsing fails, try to extract from path
      const parts = fileUrl.split('/');
      return parts[parts.length - 1] || 'attachment';
    }
  }

  getFileUrl(fileUrl: string): string {
    // If it's already a full URL, return as is
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }
    // Otherwise, construct full URL from relative path
    const baseUrl = 'http://localhost:5134';
    return fileUrl.startsWith('/') ? `${baseUrl}${fileUrl}` : `${baseUrl}/${fileUrl}`;
  }

  isOwner(): boolean {
    const question = this.question();
    const currentUser = this.authService.currentUser();
    return question !== null && currentUser !== null && question.userId === currentUser.userId;
  }

  deleteQuestion(): void {
    const question = this.question();
    if (!question) return;

    const dialogData: ConfirmationDialogData = {
      message: `Are you sure you want to delete "${question.title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel'
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '480px',
      maxWidth: '90vw',
      data: dialogData,
      panelClass: 'confirmation-dialog-panel'
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.questionService.deleteQuestion(question.questionId).subscribe({
          next: () => {
            // Redirect to home page after successful deletion
            this.router.navigate(['/']);
          },
          error: (error) => {
            let errorMessage = 'Failed to delete question. Please try again.';
            if (error.status === 404) {
              errorMessage = error.error?.message || 'Question not found or you do not have permission to delete it.';
            } else if (error.status === 401) {
              errorMessage = 'You are not authenticated. Please login again.';
            } else if (error.status === 403) {
              errorMessage = 'You do not have permission to delete this question.';
            } else if (error.error?.message) {
              errorMessage = error.error.message;
            }
            alert(errorMessage);
          }
        });
      }
    });
  }

  get content() {
    return this.answerForm.get('content');
  }
}


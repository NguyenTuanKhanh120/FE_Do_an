import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuestionService } from '../../services/question.service';
import { AnswerService } from '../../services/answer.service';
import { VoteService } from '../../services/vote.service';
import { AuthService } from '../../services/auth.service';
import { Question } from '../../models/question.model';
import { Answer } from '../../models/answer.model';

@Component({
  selector: 'app-question-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './question-detail.component.html',
  styleUrls: ['./question-detail.component.scss']
})
export class QuestionDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private questionService = inject(QuestionService);
  private answerService = inject(AnswerService);
  private voteService = inject(VoteService);
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
      error: (error) => {
        console.error('Error loading question:', error);
        this.isLoading.set(false);
      }
    });
  }

  loadAnswers(questionId: number): void {
    this.answerService.getAnswersByQuestionId(questionId).subscribe({
      next: (answers) => {
        this.answers.set(answers);
      },
      error: (error) => {
        console.error('Error loading answers:', error);
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
        console.error('Error voting:', error);
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
        console.error('Error voting:', error);
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
        console.error('Error submitting answer:', error);
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

  get content() {
    return this.answerForm.get('content');
  }
}


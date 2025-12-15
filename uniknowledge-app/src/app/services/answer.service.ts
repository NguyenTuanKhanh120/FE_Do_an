import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Answer, CreateAnswerRequest, UpdateAnswerRequest } from '../models/answer.model';

@Injectable({
  providedIn: 'root'
})
export class AnswerService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5134/api';

  getAnswersByQuestionId(questionId: number): Observable<Answer[]> {
    return this.http.get<Answer[]>(`${this.apiUrl}/questions/${questionId}/answers`);
  }

  createAnswer(questionId: number, answer: CreateAnswerRequest): Observable<Answer> {
    return this.http.post<Answer>(`${this.apiUrl}/questions/${questionId}/answers`, answer);
  }

  updateAnswer(id: number, answer: UpdateAnswerRequest): Observable<Answer> {
    return this.http.put<Answer>(`${this.apiUrl}/answers/${id}`, answer);
  }

  deleteAnswer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/answers/${id}`);
  }

  acceptAnswer(id: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/answers/${id}/accept`, {});
  }
}


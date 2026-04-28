import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Question, CreateQuestionRequest, UpdateQuestionRequest } from '../models/question.model';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5134/api/questions';

  getQuestions(
    search?: string,
    categoryId?: number,
    tagId?: number,
    status?: string,
    page: number = 1,
    pageSize: number = 20
  ): Observable<Question[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search) params = params.set('search', search);
    if (categoryId) params = params.set('categoryId', categoryId.toString());
    if (tagId) params = params.set('tagId', tagId.toString());
    if (status) params = params.set('status', status);

    return this.http.get<Question[]>(this.apiUrl, { params });
  }

  getQuestionById(id: number): Observable<Question> {
    return this.http.get<Question>(`${this.apiUrl}/${id}`);
  }

  createQuestion(question: CreateQuestionRequest): Observable<Question> {
    return this.http.post<Question>(this.apiUrl, question);
  }

  updateQuestion(id: number, question: UpdateQuestionRequest): Observable<Question> {
    return this.http.put<Question>(`${this.apiUrl}/${id}`, question);
  }

  deleteQuestion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { observe: 'body' });
  }

  /** Chia sẻ câu hỏi — tạo bài share với lời bình tùy chọn */
  shareQuestion(questionId: number, content?: string): Observable<Question> {
    return this.http.post<Question>(`${this.apiUrl}/${questionId}/share`, { content });
  }
}



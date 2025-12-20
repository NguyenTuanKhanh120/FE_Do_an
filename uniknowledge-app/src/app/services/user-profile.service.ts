import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserProfile, UpdateProfileRequest, ChangePasswordRequest } from '../models/user-profile.model';
import { Question } from '../models/question.model';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5134/api/userprofile';

  getMyProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/me`);
  }

  getMyQuestions(): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/me/questions`);
  }

  updateMyProfile(data: UpdateProfileRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/me`, data);
  }

  changePassword(data: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/me/change-password`, data);
  }

  getUserProfile(userId: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/${userId}`);
  }

  getUserQuestions(userId: number): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/${userId}/questions`);
  }
  uploadAvatar(file: File): Observable<UserProfile> {
  const formData = new FormData();
  formData.append('file', file);
  return this.http.post<UserProfile>(`${this.apiUrl}/me/upload-avatar`, formData);
}
}
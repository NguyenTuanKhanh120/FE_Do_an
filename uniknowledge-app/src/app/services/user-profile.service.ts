import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserProfile, PublicProfile, UserSearchResult, UpdateProfileRequest, ChangePasswordRequest } from '../models/user-profile.model';
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

  searchUsers(searchTerm: string, limit: number = 20): Observable<UserProfile[]> {
    let params = new HttpParams().set('limit', limit.toString());
    if (searchTerm && searchTerm.trim()) {
      params = params.set('search', searchTerm.trim());
    }
    return this.http.get<UserProfile[]>(`${this.apiUrl}/search`, { params });
  }

  // --- New methods for Public Profile & Follow ---

  /** Get public profile of another user (includes follower count & isFollowing flag) */
  getPublicProfile(userId: number): Observable<PublicProfile> {
    return this.http.get<PublicProfile>(`${this.apiUrl}/${userId}/public-profile`);
  }

  /** Toggle follow/unfollow for a user */
  toggleFollow(userId: number): Observable<{ isFollowing: boolean }> {
    return this.http.post<{ isFollowing: boolean }>(`${this.apiUrl}/${userId}/toggle-follow`, {});
  }

  /** Lightweight search for navbar autocomplete (no auth required) */
  searchUsersLight(keyword: string, limit: number = 10): Observable<UserSearchResult[]> {
    const params = new HttpParams()
      .set('keyword', keyword.trim())
      .set('limit', limit.toString());
    return this.http.get<UserSearchResult[]>(`${this.apiUrl}/search-light`, { params });
  }
}
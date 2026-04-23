import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// ===== Interfaces =====

export interface AdminUser {
  userId: number;
  username: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  role: string;
  isLocked: boolean;
  createdAt: Date;
  questionCount: number;
  answerCount: number;
}

export interface PaginatedUsers {
  users: AdminUser[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ===== Service =====

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5134/api/admin/users';

  /** Lấy danh sách user có phân trang, tìm kiếm và lọc role */
  getUsers(search?: string, role?: string, page: number = 1, pageSize: number = 10): Observable<PaginatedUsers> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    if (role && role.trim()) {
      params = params.set('role', role.trim());
    }

    return this.http.get<PaginatedUsers>(this.apiUrl, { params });
  }

  /** Toggle khóa/mở khóa tài khoản */
  toggleUserStatus(userId: number): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`${this.apiUrl}/${userId}/toggle-status`, {});
  }

  /** Đổi role của user */
  changeUserRole(userId: number, newRole: string): Observable<AdminUser> {
    return this.http.put<AdminUser>(`${this.apiUrl}/${userId}/change-role`, { newRole });
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class PasswordResetService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5134/api/auth';
  requestPasswordReset(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/forgot-password`, { email });
  }
  verifyOtp(email: string, otpCode: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/verify-otp`, { email, otpCode });
  }
  resetPassword(email: string, otpCode: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, { 
      email, 
      otpCode, 
      newPassword 
    });
  }
}
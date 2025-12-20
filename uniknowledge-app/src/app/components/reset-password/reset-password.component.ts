import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { PasswordResetService } from '../../services/password-reset.service';
@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private passwordResetService = inject(PasswordResetService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  email = signal('');
  
  form = this.fb.group({
    otpCode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });
  
  isLoading = signal(false);
  message = signal('');
  isSuccess = signal(false);
  
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.email.set(params['email'] || '');
      if (!this.email()) {
        this.router.navigate(['/forgot-password']);
      }
    });
  }
  
  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    const { otpCode, newPassword, confirmPassword } = this.form.value;
    
    if (newPassword !== confirmPassword) {
      this.message.set('Passwords do not match');
      this.isSuccess.set(false);
      return;
    }
    
    this.isLoading.set(true);
    this.message.set('');
    
    this.passwordResetService.resetPassword(this.email(), otpCode!, newPassword!).subscribe({
      next: (res) => {
        this.message.set(res.message);
        this.isSuccess.set(true);
        this.isLoading.set(false);
        
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.message.set(err.error?.message || 'Failed to reset password');
        this.isSuccess.set(false);
        this.isLoading.set(false);
      }
    });
  }
}
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PasswordResetService } from '../../services/password-reset.service';
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private passwordResetService = inject(PasswordResetService);
  private router = inject(Router);
  
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });
  
  isLoading = signal(false);
  message = signal('');
  isSuccess = signal(false);
  
  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    this.isLoading.set(true);
    this.message.set('');
    
    this.passwordResetService.requestPasswordReset(this.form.value.email!).subscribe({
      next: (res) => {
        this.message.set(res.message);
        this.isSuccess.set(true);
        this.isLoading.set(false);
        
        setTimeout(() => {
          this.router.navigate(['/reset-password'], { 
            queryParams: { email: this.form.value.email } 
          });
        }, 2000);
      },
      error: (err) => {
        this.message.set(err.error?.message || 'An error occurred');
        this.isSuccess.set(false);
        this.isLoading.set(false);
      }
    });
  }
}
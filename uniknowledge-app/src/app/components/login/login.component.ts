import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

// Khai báo google global để TypeScript nhận diện GIS script
declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);
  isGoogleLoading = signal<boolean>(false);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.initGoogleSignIn();
  }

  /** Khởi tạo Google Identity Services và render nút Google */
  private initGoogleSignIn(): void {
    // Chờ script GIS load xong
    if (typeof google === 'undefined') {
      setTimeout(() => this.initGoogleSignIn(), 300);
      return;
    }

    google.accounts.id.initialize({
      // Đọc client_id từ meta tag trong index.html (xem hướng dẫn bên dưới)
      client_id: this.getGoogleClientId(),
      callback: (response: { credential: string }) => {
        this.handleGoogleSignIn(response.credential);
      }
    });

    // Render nút Google vào div#google-btn
    google.accounts.id.renderButton(
      document.getElementById('google-btn'),
      {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'signin_with',
        logo_alignment: 'left'
      }
    );
  }

  /** Lấy Google Client ID từ meta tag trong index.html */
  private getGoogleClientId(): string {
    return document.querySelector<HTMLMetaElement>('meta[name="google-client-id"]')
      ?.getAttribute('content') ?? '';
  }

  /** Xử lý khi Google trả về credential (id_token) */
  handleGoogleSignIn(idToken: string): void {
    this.isGoogleLoading.set(true);
    this.errorMessage.set('');

    this.authService.googleLogin(idToken).subscribe({
      next: () => {
        this.isGoogleLoading.set(false);
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isGoogleLoading.set(false);
        this.errorMessage.set(error.error?.message || 'Google sign-in failed. Please try again.');
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.message || 'Login failed. Please try again.');
      }
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}

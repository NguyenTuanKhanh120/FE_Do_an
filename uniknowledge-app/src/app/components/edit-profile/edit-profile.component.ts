import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserProfileService } from '../../services/user-profile.service';
import { AuthService } from '../../services/auth.service';
import { UserProfile } from '../../models/user-profile.model';
import { AvatarUploadComponent } from '../shared/profile/avatar-upload/avatar-upload.component';
import { PasswordFormComponent, PasswordChangeData } from '../shared/profile/password-form/password-form.component';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AvatarUploadComponent, PasswordFormComponent],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userProfileService = inject(UserProfileService);
  private authService = inject(AuthService);
  private router = inject(Router);

  profile = signal<UserProfile | null>(null);
  profileForm: FormGroup;
  passwordForm: FormGroup;
  isLoadingProfile = signal<boolean>(false);
  isUpdatingProfile = signal<boolean>(false);
  isChangingPassword = signal<boolean>(false);
  profileMessage = signal<{ type: 'success' | 'error', text: string } | null>(null);
  passwordMessage = signal<{ type: 'success' | 'error', text: string } | null>(null);
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  isUploadingAvatar = signal<boolean>(false);

  constructor() {
    this.profileForm = this.fb.group({
      username: ['', [Validators.minLength(3), Validators.maxLength(50)]],
      fullName: [''],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoadingProfile.set(true);
    this.userProfileService.getMyProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.profileForm.patchValue({
          username: profile.username,
          fullName: profile.fullName || '',
        });
        this.isLoadingProfile.set(false);
      },
      error: () => {
        this.isLoadingProfile.set(false);
      }
    });
  }

  onUpdateProfile(): void {
    const currentProfile = this.profile();
    if (!currentProfile) return;

    const changes: any = {};
    const formValue = this.profileForm.value;

    if (formValue.username && formValue.username !== currentProfile.username) {
      changes.username = formValue.username;
    }
    if (formValue.fullName !== (currentProfile.fullName || '')) {
      changes.fullName = formValue.fullName || null;
    }
    if (Object.keys(changes).length === 0) {
      this.profileMessage.set({ type: 'error', text: 'No changes detected' });
      setTimeout(() => this.profileMessage.set(null), 3000);
      return;
    }

    this.isUpdatingProfile.set(true);
    this.profileMessage.set(null);

    this.userProfileService.updateMyProfile(changes).subscribe({
      next: (profile) => {
        this.profile.set(profile);  
        this.isUpdatingProfile.set(false);
        this.profileMessage.set({ type: 'success', text: 'Profile updated successfully!' });

        const currentUser = this.authService.currentUser();
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            username: profile.username,
            fullName: profile.fullName,
            avatarUrl: profile.avatarUrl
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          this.authService.currentUser.set(updatedUser);
        }

        setTimeout(() => this.profileMessage.set(null), 3000);
      },
      error: (error) => {
        this.isUpdatingProfile.set(false);
        this.profileMessage.set({
          type: 'error',
          text: error.error?.message || 'Failed to update profile'
        });
        setTimeout(() => this.profileMessage.set(null), 5000);
      }
    });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      Object.keys(this.passwordForm.controls).forEach(key => {
        this.passwordForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.passwordForm.value;

    if (formValue.newPassword !== formValue.confirmPassword) {
      this.passwordMessage.set({ type: 'error', text: 'New passwords do not match' });
      setTimeout(() => this.passwordMessage.set(null), 3000);
      return;
    }

    this.isChangingPassword.set(true);
    this.passwordMessage.set(null);

    this.userProfileService.changePassword({
      currentPassword: formValue.currentPassword,
      newPassword: formValue.newPassword
    }).subscribe({
      next: () => {
        this.isChangingPassword.set(false);
        this.passwordMessage.set({ type: 'success', text: 'Password changed successfully!' });
        this.passwordForm.reset();
        setTimeout(() => this.passwordMessage.set(null), 3000);
      },
      error: (error) => {
        this.isChangingPassword.set(false);
        this.passwordMessage.set({
          type: 'error',
          text: error.error?.message || 'Failed to change password'
        });
        setTimeout(() => this.passwordMessage.set(null), 5000);
      }
    });
  }

  get currentPassword() {
    return this.passwordForm.get('currentPassword');
  }

  get newPassword() {
    return this.passwordForm.get('newPassword');
  }

  get confirmPassword() {
    return this.passwordForm.get('confirmPassword');
  }
  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.profileMessage.set({ type: 'error', text: 'Please select an image file' });
      setTimeout(() => this.profileMessage.set(null), 3000);
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      this.profileMessage.set({ type: 'error', text: 'File size must not exceed 2MB' });
      setTimeout(() => this.profileMessage.set(null), 3000);
      return;
    }

    this.selectedFile.set(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }
  onUploadAvatar(): void {
    const file = this.selectedFile();
    if (!file) return;

    this.isUploadingAvatar.set(true);
    this.profileMessage.set(null);

    this.userProfileService.uploadAvatar(file).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.isUploadingAvatar.set(false);
        this.selectedFile.set(null);
        this.previewUrl.set(null);
        this.profileMessage.set({ type: 'success', text: 'Avatar updated successfully!' });

        // Update localStorage
        const currentUser = this.authService.currentUser();
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            avatarUrl: profile.avatarUrl
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          this.authService.currentUser.set(updatedUser);
        }

        setTimeout(() => this.profileMessage.set(null), 3000);
      },
      error: (error) => {
        this.isUploadingAvatar.set(false);
        this.profileMessage.set({
          type: 'error',
          text: error.error?.message || 'Failed to upload avatar'
        });
        setTimeout(() => this.profileMessage.set(null), 5000);
      }
    });
  }
  cancelAvatarUpload(): void {
    this.selectedFile.set(null);
    this.previewUrl.set(null);
  }
  triggerFileInput(): void {
    const fileInput = document.getElementById('avatarFileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  // New handler methods for components
  onUploadAvatarFile(file: File): void {
    this.isUploadingAvatar.set(true);
    this.profileMessage.set(null);

    this.userProfileService.uploadAvatar(file).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.isUploadingAvatar.set(false);
        this.profileMessage.set({ type: 'success', text: 'Avatar updated successfully!' });

        const currentUser = this.authService.currentUser();
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            avatarUrl: profile.avatarUrl
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          this.authService.currentUser.set(updatedUser);
        }

        setTimeout(() => this.profileMessage.set(null), 3000);
      },
      error: (error) => {
        this.isUploadingAvatar.set(false);
        this.profileMessage.set({
          type: 'error',
          text: error.error?.message || 'Failed to upload avatar'
        });
        setTimeout(() => this.profileMessage.set(null), 5000);
      }
    });
  }

  onPasswordChange(data: PasswordChangeData): void {
    this.isChangingPassword.set(true);
    this.passwordMessage.set(null);

    this.userProfileService.changePassword(data).subscribe({
      next: () => {
        this.isChangingPassword.set(false);
        this.passwordMessage.set({ type: 'success', text: 'Password changed successfully!' });
        setTimeout(() => this.passwordMessage.set(null), 3000);
      },
      error: (error) => {
        this.isChangingPassword.set(false);
        this.passwordMessage.set({
          type: 'error',
          text: error.error?.message || 'Failed to change password'
        });
        setTimeout(() => this.passwordMessage.set(null), 5000);
      }
    });
  }
}

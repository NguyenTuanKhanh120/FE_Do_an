import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-avatar-upload',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './avatar-upload.component.html',
    styleUrls: ['./avatar-upload.component.scss']
})
export class AvatarUploadComponent {
    username = input.required<string>();
    currentAvatarUrl = input<string | undefined>(undefined);
    isUploading = input<boolean>(false);

    uploadAvatar = output<File>();

    selectedFile = signal<File | null>(null);
    previewUrl = signal<string | null>(null);

    triggerFileInput(): void {
        const input = document.getElementById('avatarFileInput') as HTMLInputElement;
        input?.click();
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            this.selectedFile.set(file);

            // Create preview URL
            const reader = new FileReader();
            reader.onload = () => {
                this.previewUrl.set(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    onUpload(): void {
        const file = this.selectedFile();
        if (file) {
            this.uploadAvatar.emit(file);
        }
    }

    cancelUpload(): void {
        this.selectedFile.set(null);
        this.previewUrl.set(null);
    }
}

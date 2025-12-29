import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

export interface PasswordChangeData {
    currentPassword: string;
    newPassword: string;
}

@Component({
    selector: 'app-password-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './password-form.component.html',
    styleUrls: ['./password-form.component.scss']
})
export class PasswordFormComponent {
    private fb = inject(FormBuilder);

    isChanging = input<boolean>(false);
    message = input<{ type: 'success' | 'error', text: string } | null>(null);

    changePassword = output<PasswordChangeData>();

    passwordForm: FormGroup;
    mismatchError = signal<boolean>(false);

    constructor() {
        this.passwordForm = this.fb.group({
            currentPassword: ['', [Validators.required, Validators.minLength(6)]],
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]]
        });
    }

    onSubmit(): void {
        this.mismatchError.set(false);

        if (this.passwordForm.invalid) {
            this.passwordForm.markAllAsTouched();
            return;
        }

        const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

        if (newPassword !== confirmPassword) {
            this.mismatchError.set(true);
            return;
        }

        this.changePassword.emit({ currentPassword, newPassword });
    }

    resetForm(): void {
        this.passwordForm.reset();
        this.mismatchError.set(false);
    }

    get currentPassword() { return this.passwordForm.get('currentPassword'); }
    get newPassword() { return this.passwordForm.get('newPassword'); }
    get confirmPassword() { return this.passwordForm.get('confirmPassword'); }
}

import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmationDialogData {
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog-container">
      <mat-dialog-content class="dialog-content">
        <div class="icon-container">
          <mat-icon class="warning-icon">warning</mat-icon>
        </div>
        <div class="message-container">
          <p class="message-text">{{ data.message }}</p>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions class="dialog-actions">
        <button
          mat-button
          (click)="onCancel()"
          class="cancel-button"
        >
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button
          mat-raised-button
          color="warn"
          (click)="onConfirm()"
          class="confirm-button"
        >
          {{ data.confirmText || 'Delete' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      min-width: 400px;
    }

    .dialog-content {
      display: flex;
      align-items: flex-start;
      gap: 20px;
      padding: 32px 24px 24px 24px !important;
      margin: 0 !important;
    }

    .icon-container {
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(244, 67, 54, 0.15);
    }

    .warning-icon {
      color: #d32f2f;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .message-container {
      flex: 1;
      padding-top: 4px;
    }

    .message-text {
      margin: 0;
      font-size: 16px;
      line-height: 1.5;
      color: rgba(0, 0, 0, 0.87);
      font-weight: 400;
      letter-spacing: 0.00938em;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 8px 16px 16px 16px !important;
      margin: 0 !important;
      min-height: auto !important;
    }

    .cancel-button {
      min-width: 80px;
    }

    .confirm-button {
      min-width: 80px;
      font-weight: 500;
    }

    ::ng-deep .mat-mdc-dialog-container {
      padding: 0 !important;
      border-radius: 4px !important;
      box-shadow: 0px 11px 15px -7px rgba(0, 0, 0, 0.2), 
                  0px 24px 38px 3px rgba(0, 0, 0, 0.14), 
                  0px 9px 46px 8px rgba(0, 0, 0, 0.12) !important;
      max-width: 480px !important;
    }

    ::ng-deep .cdk-overlay-dark-backdrop {
      background: rgba(0, 0, 0, 0.5);
    }

    ::ng-deep .mat-mdc-button {
      text-transform: none !important;
      letter-spacing: 0.02857em !important;
      font-weight: 500 !important;
    }

    ::ng-deep .mdc-button {
      border-radius: 4px !important;
    }
  `]
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}


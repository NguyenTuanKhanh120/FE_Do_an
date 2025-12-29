import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
    selector: 'app-answer-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './answer-form.component.html',
    styleUrls: ['./answer-form.component.scss']
})
export class AnswerFormComponent {
    private fb = inject(FormBuilder);

    answerForm: FormGroup;
    submitAnswer = output<string>();

    constructor() {
        this.answerForm = this.fb.group({
            content: ['', [Validators.required, Validators.minLength(20)]]
        });
    }

    onSubmit(): void {
        if (this.answerForm.invalid) {
            this.answerForm.markAllAsTouched();
            return;
        }

        this.submitAnswer.emit(this.answerForm.value.content);
        this.answerForm.reset();
    }

    get content() {
        return this.answerForm.get('content');
    }
}

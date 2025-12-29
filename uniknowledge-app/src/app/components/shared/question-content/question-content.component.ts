import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Question } from '../../../models/question.model';

@Component({
    selector: 'app-question-content',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './question-content.component.html',
    styleUrls: ['./question-content.component.scss']
})
export class QuestionContentComponent {
    question = input.required<Question>();
    tagClick = output<number>();

    formatDate(date: Date): string {
        const d = new Date(date);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'just now';
    }

    onTagClick(tagId: number): void {
        this.tagClick.emit(tagId);
    }
}

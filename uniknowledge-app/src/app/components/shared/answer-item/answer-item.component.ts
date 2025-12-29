import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Answer } from '../../../models/answer.model';
import { VotingComponent } from '../voting/voting.component';

@Component({
    selector: 'app-answer-item',
    standalone: true,
    imports: [CommonModule, VotingComponent],
    templateUrl: './answer-item.component.html',
    styleUrls: ['./answer-item.component.scss']
})
export class AnswerItemComponent {
    answer = input.required<Answer>();
    showVoteButtons = input<boolean>(true);

    upvote = output<number>();
    downvote = output<number>();

    onUpvote(): void {
        this.upvote.emit(this.answer().answerId);
    }

    onDownvote(): void {
        this.downvote.emit(this.answer().answerId);
    }

    formatDate(date: Date): string {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

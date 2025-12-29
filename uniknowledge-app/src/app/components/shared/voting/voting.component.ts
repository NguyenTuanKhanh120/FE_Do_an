import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-voting',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './voting.component.html',
    styleUrls: ['./voting.component.scss']
})
export class VotingComponent {
    // Số vote hiện tại
    voteCount = input.required<number>();

    // Có hiện nút vote hay không (false nếu là owner hoặc chưa login)
    showButtons = input<boolean>(true);

    // Size: 'large' cho question, 'small' cho answer
    size = input<'large' | 'small'>('large');

    // Events
    upvote = output<void>();
    downvote = output<void>();

    onUpvote(): void {
        this.upvote.emit();
    }

    onDownvote(): void {
        this.downvote.emit();
    }
}

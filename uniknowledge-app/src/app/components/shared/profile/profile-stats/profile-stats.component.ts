import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-profile-stats',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './profile-stats.component.html',
    styleUrls: ['./profile-stats.component.scss']
})
export class ProfileStatsComponent {
    questionCount = input.required<number>();
    answerCount = input.required<number>();
}

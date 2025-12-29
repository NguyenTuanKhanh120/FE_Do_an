import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagDetail } from '../../../models/tag.model';

@Component({
    selector: 'app-popular-tags',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './popular-tags.component.html',
    styleUrls: ['./popular-tags.component.scss']
})
export class PopularTagsComponent {
    popularTags = input.required<TagDetail[]>();
    tagClick = output<number>();

    onTagClick(tagId: number): void {
        this.tagClick.emit(tagId);
    }
}

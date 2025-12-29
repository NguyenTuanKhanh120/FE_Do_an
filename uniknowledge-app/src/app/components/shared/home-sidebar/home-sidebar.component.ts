import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagDetail } from '../../../models/tag.model';
import { Category } from '../../../models/category.model';
import { PopularTagsComponent } from '../popular-tags/popular-tags.component';
import { CategoriesListComponent } from '../categories-list/categories-list.component';

@Component({
    selector: 'app-home-sidebar',
    standalone: true,
    imports: [CommonModule, PopularTagsComponent, CategoriesListComponent],
    templateUrl: './home-sidebar.component.html',
    styleUrls: ['./home-sidebar.component.scss']
})
export class HomeSidebarComponent {
    popularTags = input.required<TagDetail[]>();
    categories = input.required<Category[]>();

    tagClick = output<number>();
    categoryClick = output<string>();

    onTagClick(tagId: number): void {
        this.tagClick.emit(tagId);
    }

    onCategoryClick(categoryId: string): void {
        this.categoryClick.emit(categoryId);
    }
}

import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category } from '../../../models/category.model';

@Component({
    selector: 'app-categories-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './categories-list.component.html',
    styleUrls: ['./categories-list.component.scss']
})
export class CategoriesListComponent {
    categories = input.required<Category[]>();
    categoryClick = output<string>();

    onCategoryClick(categoryId: string): void {
        this.categoryClick.emit(categoryId);
    }
}

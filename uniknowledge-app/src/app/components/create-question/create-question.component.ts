import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { QuestionService } from '../../services/question.service';
import { CategoryService } from '../../services/category.service';
import { TagService } from '../../services/tag.service';
import { Category } from '../../models/category.model';
import { TagDetail } from '../../models/tag.model';

@Component({
  selector: 'app-create-question',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-question.component.html',
  styleUrls: ['./create-question.component.scss']
})
export class CreateQuestionComponent implements OnInit {
  private fb = inject(FormBuilder);
  router = inject(Router);
  private questionService = inject(QuestionService);
  private categoryService = inject(CategoryService);
  private tagService = inject(TagService);

  questionForm: FormGroup;
  categories = signal<Category[]>([]);
  tags = signal<TagDetail[]>([]);
  selectedTags = signal<number[]>([]);
  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);
  selectedFile: File | null = null;
  selectedFileName = signal<string>('');

  constructor() {
    this.questionForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(255)]],
      content: ['', [Validators.required, Validators.minLength(20)]],
      categoryId: ['', [Validators.required]],
      imageUrl: [''],
      attachmentFile: [null]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadTags();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadTags(): void {
    this.tagService.getTags().subscribe({
      next: (tags) => {
        this.tags.set(tags);
      },
      error: (error) => {
        console.error('Error loading tags:', error);
      }
    });
  }

  toggleTag(tagId: number): void {
    const tags = this.selectedTags();
    const index = tags.indexOf(tagId);
    if (index > -1) {
      this.selectedTags.set(tags.filter(id => id !== tagId));
    } else {
      this.selectedTags.set([...tags, tagId]);
    }
  }

  isTagSelected(tagId: number): boolean {
    return this.selectedTags().includes(tagId);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        this.errorMessage.set('File size must be less than 10MB');
        input.value = '';
        this.selectedFile = null;
        this.selectedFileName.set('');
        return;
      }

      this.selectedFile = file;
      this.selectedFileName.set(file.name);
      this.errorMessage.set('');
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.selectedFileName.set('');
    const fileInput = document.getElementById('attachmentFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  convertFileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async onSubmit(): Promise<void> {
    if (this.questionForm.invalid) {
      Object.keys(this.questionForm.controls).forEach(key => {
        this.questionForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (this.selectedTags().length === 0) {
      this.errorMessage.set('Please select at least one tag');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const formValue = this.questionForm.value;
      
      // Convert file to data URL if file is selected
      let attachmentUrl: string | undefined = undefined;
      if (this.selectedFile) {
        attachmentUrl = await this.convertFileToDataUrl(this.selectedFile);
      }

      const questionData = {
        title: formValue.title,
        content: formValue.content,
        categoryId: parseInt(formValue.categoryId),
        tagIds: this.selectedTags(),
        imageUrl: formValue.imageUrl?.trim() || undefined,
        attachmentUrl: attachmentUrl
      };

      this.questionService.createQuestion(questionData).subscribe({
        next: (question) => {
          this.isLoading.set(false);
          this.router.navigate(['/questions', question.questionId]);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.error?.message || 'Failed to create question. Please try again.');
        }
      });
    } catch (error) {
      this.isLoading.set(false);
      this.errorMessage.set('Failed to process file. Please try again.');
      console.error('Error processing file:', error);
    }
  }

  get title() {
    return this.questionForm.get('title');
  }

  get content() {
    return this.questionForm.get('content');
  }

  get categoryId() {
    return this.questionForm.get('categoryId');
  }
}


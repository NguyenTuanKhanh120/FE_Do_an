import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { QuestionService } from '../../services/question.service';
import { CategoryService } from '../../services/category.service';
import { TagService } from '../../services/tag.service';
import { UploadService } from '../../services/upload.service';
import { Category } from '../../models/category.model';
import { TagDetail } from '../../models/tag.model';
import { Question } from '../../models/question.model';

@Component({
    selector: 'app-edit-question',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './edit-question.component.html',
    styleUrls: ['./edit-question.component.scss']
})
export class EditQuestionComponent implements OnInit {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private questionService = inject(QuestionService);
    private categoryService = inject(CategoryService);
    private tagService = inject(TagService);
    private uploadService = inject(UploadService);

    questionForm: FormGroup;
    categories = signal<Category[]>([]);
    tags = signal<TagDetail[]>([]);
    selectedTags = signal<number[]>([]);
    errorMessage = signal<string>('');
    isLoading = signal<boolean>(false);
    isLoadingData = signal<boolean>(true);
    selectedFile: File | null = null;
    selectedFileName = signal<string>('');
    uploadedFilePath = signal<string | null>(null);
    uploadProgress = signal<number>(0);
    currentQuestion = signal<Question | null>(null);
    questionId: number = 0;

    get hasFile(): boolean {
        const fileName = this.selectedFileName();
        const filePath = this.uploadedFilePath();
        return (fileName !== null && fileName !== undefined && fileName.trim().length > 0) ||
            (filePath !== null && filePath !== undefined && filePath.trim().length > 0);
    }
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
        // Lấy questionId từ URL
        this.questionId = parseInt(this.route.snapshot.paramMap.get('id') || '0');

        if (this.questionId) {
            this.loadQuestion();
            this.loadCategories();
            this.loadTags();
        } else {
            this.errorMessage.set('Invalid question ID');
            this.isLoadingData.set(false);
        }
    }

    // Load thông tin câu hỏi hiện tại
    loadQuestion(): void {
        this.questionService.getQuestionById(this.questionId).subscribe({
            next: (question) => {
                this.currentQuestion.set(question);
                this.selectedTags.set(question.tags.map(t => t.tagId));

                // Điền dữ liệu vào form
                this.questionForm.patchValue({
                    title: question.title,
                    content: question.content,
                    categoryId: question.categoryId?.toString() || '',
                    imageUrl: question.imageUrl || ''
                });

                // Nếu có file đính kèm, hiển thị tên file
                if (question.fileUrl) {
                    const fileName = question.fileUrl.split('/').pop() || 'Attached file';
                    this.selectedFileName.set(fileName);
                    this.uploadedFilePath.set(question.fileUrl);
                }

                this.isLoadingData.set(false);
            },
            error: (error) => {
                this.errorMessage.set(error.error?.message || 'Failed to load question');
                this.isLoadingData.set(false);
            }
        });
    }

    loadCategories(): void {
        this.categoryService.getCategories().subscribe({
            next: (categories) => {
                this.categories.set(categories);
            }
        });
    }

    loadTags(): void {
        this.tagService.getTags().subscribe({
            next: (tags) => {
                this.tags.set(tags);
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
        // Clear selectedFile immediately
        this.selectedFile = null;

        // Clear the file input element
        const fileInput = document.getElementById('attachmentFile') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }

        // Clear file-related signals with a small delay to ensure change detection
        this.selectedFileName.set('');
        this.uploadedFilePath.set(null);
        this.uploadProgress.set(0);

        // Force Angular to detect the change by using setTimeout
        setTimeout(() => {
            if (this.selectedFileName() !== '') {
                this.selectedFileName.set('');
            }
            if (this.uploadedFilePath() !== null) {
                this.uploadedFilePath.set(null);
            }
        }, 10);
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

            // Upload file mới nếu có
            let fileUrl: string | undefined | null;

            if (this.selectedFile) {
                // User chọn file mới - upload
                try {
                    this.uploadProgress.set(10);
                    const uploadResponse = await firstValueFrom(this.uploadService.uploadQuestionAttachment(this.selectedFile));
                    fileUrl = uploadResponse.fileUrl;
                    this.uploadedFilePath.set(uploadResponse.filePath);
                    this.uploadProgress.set(100);
                } catch (uploadError: any) {
                    this.isLoading.set(false);
                    this.errorMessage.set(uploadError.error?.message || 'Failed to upload file. Please try again.');
                    return;
                }
            } else if (!this.hasFile) {
                // User đã xóa file (hasFile = false)
                fileUrl = '';  // Gửi empty string để backend biết là xóa
            } else {
                // Giữ nguyên file cũ
                fileUrl = this.currentQuestion()?.fileUrl;
            }

            const questionData = {
                title: formValue.title,
                content: formValue.content,
                categoryId: parseInt(formValue.categoryId),
                tagIds: this.selectedTags(),
                imageUrl: formValue.imageUrl?.trim() || undefined,
                fileUrl: fileUrl
            };

            this.questionService.updateQuestion(this.questionId, questionData).subscribe({
                next: (question) => {
                    this.isLoading.set(false);
                    // Quay về trang profile sau khi update thành công
                    this.router.navigate(['/profile']);
                },
                error: (error) => {
                    this.isLoading.set(false);
                    this.errorMessage.set(error.error?.message || 'Failed to update question. Please try again.');
                }
            });
        } catch (error) {
            this.isLoading.set(false);
            this.errorMessage.set('Failed to process file. Please try again.');
        }
    }

    cancel(): void {
        this.router.navigate(['/profile']);
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

export interface Category {
  categoryId: number;
  categoryName: string;
  description?: string;
  slug?: string; 
  questionCount: number;
}
export interface CreateCategoryRequest {
  categoryName: string;
  description: string;
  slug: string;
}
export interface UpdateCategoryRequest {
  categoryName?: string;
  description?: string;
  slug?: string;
}


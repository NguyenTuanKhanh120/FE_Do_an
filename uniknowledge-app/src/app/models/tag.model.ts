export interface TagDetail {
  tagId: number;
  tagName: string;
  description?: string;
  questionCount: number;
}

export interface CreateTagRequest {
  tagName: string;
  description?: string;
}

export interface UpdateTagRequest {
  tagName?: string;
  description?: string;
}

export interface TagFilterDto {
  tagIds?: number[];
  logic?: 'AND' | 'OR';
  page?: number;
  pageSize?: number;
}

export interface FilteredQuestionsResponse {
  questions: any[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}


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


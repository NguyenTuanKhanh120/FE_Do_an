export interface Tag {
  tagId: number;
  tagName: string;
}

export interface Question {
  questionId: number;
  title: string;
  content: string;
  viewCount: number;
  status: string;
  imageUrl?: string;
  fileUrl?: string; 
  createdAt: Date;
  updatedAt?: Date;
  userId: number;
  username: string;
  avatarUrl?: string;
  categoryId?: number;
  categoryName?: string;
  tags: Tag[];
  answerCount: number;
  voteCount: number;
  hasAcceptedAnswer: boolean;
  // Share
  originalQuestionId?: number;
  originalQuestion?: OriginalQuestion;
}

export interface OriginalQuestion {
  questionId: number;
  title: string;
  contentPreview: string;
  userId: number;
  username: string;
  avatarUrl?: string;
}

export interface CreateQuestionRequest {
  title: string;
  content: string;
  categoryId: number;
  tagIds: number[];
  imageUrl?: string;
  fileUrl?: string; // thêm fileUrl
}

export interface UpdateQuestionRequest {
  title?: string;
  content?: string;
  categoryId?: number;
  tagIds?: number[];
  imageUrl?: string;
  fileUrl?: string; //thêm fileUrl
  status?: string;
}


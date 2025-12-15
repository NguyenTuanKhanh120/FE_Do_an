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
  attachmentUrl?: string;
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
}

export interface CreateQuestionRequest {
  title: string;
  content: string;
  categoryId: number;
  tagIds: number[];
  imageUrl?: string;
  attachmentUrl?: string;
}

export interface UpdateQuestionRequest {
  title: string;
  content: string;
  categoryId: number;
  tagIds: number[];
  imageUrl?: string;
  attachmentUrl?: string;
}


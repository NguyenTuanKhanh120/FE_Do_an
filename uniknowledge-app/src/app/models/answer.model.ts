export interface Answer {
  answerId: number;
  questionId: number;
  content: string;
  isAccepted: boolean;
  createdAt: Date;
  updatedAt?: Date;
  userId: number;
  username: string;
  avatarUrl?: string;
  voteCount: number;
}

export interface CreateAnswerRequest {
  content: string;
}

export interface UpdateAnswerRequest {
  content: string;
}


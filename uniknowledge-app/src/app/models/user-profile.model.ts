export interface UserProfile {
  userId: number;
  username: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  role: string;
  createdAt: Date;
  questionCount: number;
  answerCount: number;
}

export interface PublicProfile {
  userId: number;
  username: string;
  fullName?: string;
  avatarUrl?: string;
  role: string;
  createdAt: Date;
  questionCount: number;
  answerCount: number;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
}

export interface UserSearchResult {
  userId: number;
  fullName?: string;
  username: string;
  avatarUrl?: string;
}

export interface UpdateProfileRequest {
  username?: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
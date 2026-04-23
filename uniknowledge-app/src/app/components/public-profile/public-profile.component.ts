import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserProfileService } from '../../services/user-profile.service';
import { AuthService } from '../../services/auth.service';
import { PublicProfile } from '../../models/user-profile.model';
import { Question } from '../../models/question.model';

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './public-profile.component.html',
  styleUrls: ['./public-profile.component.scss']
})
export class PublicProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userProfileService = inject(UserProfileService);
  authService = inject(AuthService);

  profile = signal<PublicProfile | null>(null);
  questions = signal<Question[]>([]);
  isLoading = signal<boolean>(true);
  isLoadingQuestions = signal<boolean>(true);
  isFollowLoading = signal<boolean>(false);

  private userId = 0;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/']);
      return;
    }
    this.userId = +id;

    // Nếu là chính mình → redirect sang /profile
    const currentUser = this.authService.currentUser();
    if (currentUser && currentUser.userId === this.userId) {
      this.router.navigate(['/profile']);
      return;
    }

    this.loadProfile();
    this.loadQuestions();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.userProfileService.getPublicProfile(this.userId).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/not-found']);
      }
    });
  }

  loadQuestions(): void {
    this.isLoadingQuestions.set(true);
    this.userProfileService.getUserQuestions(this.userId).subscribe({
      next: (questions) => {
        this.questions.set(questions);
        this.isLoadingQuestions.set(false);
      },
      error: () => {
        this.isLoadingQuestions.set(false);
      }
    });
  }

  toggleFollow(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.isFollowLoading.set(true);
    this.userProfileService.toggleFollow(this.userId).subscribe({
      next: (result) => {
        const current = this.profile();
        if (current) {
          this.profile.set({
            ...current,
            isFollowing: result.isFollowing,
            followerCount: result.isFollowing
              ? current.followerCount + 1
              : current.followerCount - 1
          });
        }
        this.isFollowLoading.set(false);
      },
      error: () => {
        this.isFollowLoading.set(false);
      }
    });
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Open':
        return 'bg-green-100 text-green-800';
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
      case 'Hidden':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}

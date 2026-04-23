import { Component, inject, OnInit, OnDestroy, signal, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { MessageService } from '../../services/message.service';
import { SignalRService } from '../../services/signalr.service';
import { UserProfileService } from '../../services/user-profile.service';
import { UserSearchResult } from '../../models/user-profile.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  messageService = inject(MessageService);
  signalRService = inject(SignalRService);
  private userProfileService = inject(UserProfileService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  isMenuOpen = false;
  unreadCount = signal<number>(0);

  // --- Search state ---
  searchQuery = '';
  searchResults = signal<UserSearchResult[]>([]);
  isSearching = signal<boolean>(false);
  showSearchDropdown = signal<boolean>(false);

  /**
   * RxJS Subject: mỗi lần user gõ phím → emit giá trị mới vào stream.
   * Pipeline: debounceTime(300ms) → distinctUntilChanged → switchMap(gọi API)
   * switchMap tự cancel request cũ nếu user gõ tiếp trước khi API trả về.
   */
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  private messageSubscription?: Subscription;

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.loadUnreadCount();

      this.signalRService.messageReceived$.subscribe(() => {
        this.loadUnreadCount();
      });
      this.signalRService.messageSent$.subscribe(() => {
        this.loadUnreadCount();
      });
      this.signalRService.messageRead$.subscribe(() => {
        this.loadUnreadCount();
      });
    }

    // Setup search pipeline
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),              // Chờ 300ms sau khi user ngừng gõ
      distinctUntilChanged(),         // Chỉ emit nếu giá trị thực sự thay đổi
      tap(query => {
        if (!query.trim()) {
          this.searchResults.set([]);
          this.showSearchDropdown.set(false);
          this.isSearching.set(false);
          return;
        }
        this.isSearching.set(true);
      }),
      switchMap(query => {
        if (!query.trim()) return [];
        // switchMap: cancel HTTP request trước nếu user gõ tiếp
        return this.userProfileService.searchUsersLight(query, 10);
      })
    ).subscribe({
      next: (results) => {
        this.searchResults.set(results);
        this.showSearchDropdown.set(results.length > 0);
        this.isSearching.set(false);
      },
      error: () => {
        this.isSearching.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.messageSubscription?.unsubscribe();
    this.searchSubject.complete();
  }

  /** Khi user gõ trong ô search → đẩy giá trị vào Subject */
  onSearchInput(): void {
    this.searchSubject.next(this.searchQuery);
  }

  /** Click vào user trong dropdown → navigate đến public profile */
  selectUser(user: UserSearchResult): void {
    this.searchQuery = '';
    this.searchResults.set([]);
    this.showSearchDropdown.set(false);
    this.router.navigate(['/users', user.userId]);
  }

  /** Click bên ngoài ô search → đóng dropdown */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showSearchDropdown.set(false);
    }
  }

  loadUnreadCount(): void {
    this.messageService.getUnreadCount().subscribe({
      next: (response) => {
        this.unreadCount.set(response.unreadCount);
      },
      error: (error) => {
        console.error('Error loading unread count:', error);
      }
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    this.authService.logout();
  }

  isAdmin(): boolean {
    const user = this.authService.currentUser();
    return user?.role === 'Admin';
  }
}

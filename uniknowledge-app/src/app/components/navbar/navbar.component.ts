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

  // ===== State: Hamburger Sidebar =====
  // Điều khiển Sidebar trượt từ bên trái
  isSidebarOpen = false;

  unreadCount = signal<number>(0);

  // ===== State: Ô tìm kiếm (giữ nguyên logic cũ) =====
  searchQuery = '';
  searchResults = signal<UserSearchResult[]>([]);
  isSearching = signal<boolean>(false);
  showSearchDropdown = signal<boolean>(false);

  /**
   * RxJS Search Pipeline:
   * Subject → debounceTime(300ms) → distinctUntilChanged → switchMap(API call)
   * switchMap tự hủy request cũ khi user tiếp tục gõ → tránh race condition
   */
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  private messageSubscription?: Subscription;

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.loadUnreadCount();

      // Lắng nghe sự kiện tin nhắn qua SignalR để cập nhật badge
      this.signalRService.messageReceived$.subscribe(() => this.loadUnreadCount());
      this.signalRService.messageSent$.subscribe(() => this.loadUnreadCount());
      this.signalRService.messageRead$.subscribe(() => this.loadUnreadCount());
    }

    // Khởi tạo pipeline tìm kiếm RxJS
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
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
        return this.userProfileService.searchUsersLight(query, 10);
      })
    ).subscribe({
      next: (results) => {
        this.searchResults.set(results);
        this.showSearchDropdown.set(results.length > 0);
        this.isSearching.set(false);
      },
      error: () => this.isSearching.set(false)
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.messageSubscription?.unsubscribe();
    this.searchSubject.complete();
  }

  // ===== Hamburger Sidebar =====

  /** Mở/đóng sidebar */
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  /** Đóng sidebar (gọi khi click vào link hoặc overlay) */
  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  // ===== Search =====

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

  /**
   * Click outside handler:
   * - Đóng search dropdown nếu click ngoài navbar
   * (Sidebar có overlay riêng → không cần xử lý ở đây)
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showSearchDropdown.set(false);
    }
  }

  // ===== Utilities =====

  loadUnreadCount(): void {
    this.messageService.getUnreadCount().subscribe({
      next: (response) => this.unreadCount.set(response.unreadCount),
      error: (error) => console.error('Error loading unread count:', error)
    });
  }

  logout(): void {
    this.closeSidebar();
    this.authService.logout();
  }

  isAdmin(): boolean {
    return this.authService.currentUser()?.role === 'Admin';
  }
}

import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { MessageService } from '../../services/message.service';
import { SignalRService } from '../../services/signalr.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  messageService = inject(MessageService);
  signalRService = inject(SignalRService);
  isMenuOpen = false;
  unreadCount = signal<number>(0);
  private messageSubscription?: Subscription;

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.loadUnreadCount();

      // Subscribe to new messages to update unread count
      this.signalRService.messageReceived$.subscribe(() => {
        this.loadUnreadCount();
      });

      // Subscribe to message sent events to update unread count (for receiver)
      this.signalRService.messageSent$.subscribe(() => {
        this.loadUnreadCount();
      });

      // Subscribe to message read events to update unread count
      this.signalRService.messageRead$.subscribe(() => {
        this.loadUnreadCount();
      });
    }
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
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


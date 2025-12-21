import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message, Conversation } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5134/api/messages';

  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/conversations`);
  }

  getConversation(otherUserId: number, page: number = 1, pageSize: number = 50): Observable<Message[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<Message[]>(`${this.apiUrl}/conversation/${otherUserId}`, { params });
  }

  getUnreadCount(): Observable<{ unreadCount: number }> {
    return this.http.get<{ unreadCount: number }>(`${this.apiUrl}/unread-count`);
  }

  markAsRead(messageId: number): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}/${messageId}/read`, {});
  }

  sendMessage(receiverId: number, content: string): Observable<Message> {
    return this.http.post<Message>(this.apiUrl, {
      receiverId,
      content
    });
  }
}


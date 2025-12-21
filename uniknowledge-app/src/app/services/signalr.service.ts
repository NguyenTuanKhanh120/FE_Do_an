import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Message, TypingIndicator } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection?: HubConnection;
  
  // Observables for events
  private messageReceivedSubject = new Subject<Message>();
  public messageReceived$ = this.messageReceivedSubject.asObservable();
  
  private messageReadSubject = new Subject<{ messageId: number; readBy: number; readAt: string }>();
  public messageRead$ = this.messageReadSubject.asObservable();
  
  private messageSentSubject = new Subject<Message>();
  public messageSent$ = this.messageSentSubject.asObservable();
  
  private typingStartedSubject = new Subject<TypingIndicator>();
  public typingStarted$ = this.typingStartedSubject.asObservable();
  
  private typingStoppedSubject = new Subject<{ userId: number }>();
  public typingStopped$ = this.typingStoppedSubject.asObservable();
  
  private connectionStateSubject = new BehaviorSubject<HubConnectionState>(HubConnectionState.Disconnected);
  public connectionState$ = this.connectionStateSubject.asObservable();

  async connect(token: string): Promise<void> {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      return;
    }

    const currentState = this.hubConnection?.state;
    if (currentState === HubConnectionState.Connecting || 
        currentState === HubConnectionState.Reconnecting) {
      for (let i = 0; i < 50; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (!this.hubConnection) break;
        const state = this.hubConnection.state as HubConnectionState;
        if (state === HubConnectionState.Connected) return;
        if (state === HubConnectionState.Disconnected) break;
      }
    }

    if (this.hubConnection && currentState !== HubConnectionState.Disconnected) {
      try {
        await this.hubConnection.stop();
      } catch { }
    }

    if (!token) {
      throw new Error('No authentication token available');
    }

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${environment.signalRUrl}`, {
        accessTokenFactory: () => token,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: retryContext => {
          const delays = [1000, 2000, 5000, 10000];
          return delays[Math.min(retryContext.previousRetryCount, delays.length - 1)];
        }
      })
      .build();

    // Register event handlers
    this.registerHandlers();

    try {
      await this.hubConnection.start();
      this.connectionStateSubject.next(this.hubConnection.state);
    } catch (error: any) {
      const isAuthError = error?.message?.includes('Unauthorized') || 
                         error?.message?.includes('401') || 
                         error?.message?.includes('403');
      
      if (isAuthError) {
        this.connectionStateSubject.next(HubConnectionState.Disconnected);
        return;
      }
      throw error;
    }

    this.hubConnection.onclose((error) => {
      this.connectionStateSubject.next(HubConnectionState.Disconnected);
      if (error) {
        const errorMessage = error.message || String(error);
        const isExpectedError = 
          errorMessage.includes('Unauthorized') ||
          errorMessage.includes('401') ||
          errorMessage.includes('Connection closed with an error') ||
          errorMessage.includes('Server returned an error on close');
        
        if (!isExpectedError) {
          console.warn('SignalR connection closed with error:', error);
        }
      }
    });

    this.hubConnection.onreconnecting(() => {
      this.connectionStateSubject.next(HubConnectionState.Reconnecting);
    });

    this.hubConnection.onreconnected(() => {
      this.connectionStateSubject.next(HubConnectionState.Connected);
    });
  }

  async disconnect(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      this.connectionStateSubject.next(HubConnectionState.Disconnected);
    }
  }

  private registerHandlers(): void {
    if (!this.hubConnection) return;

    this.hubConnection.on('ReceiveMessage', (message: Message) => {
      this.messageReceivedSubject.next(message);
    });

    this.hubConnection.on('MessageRead', (data: { messageId: number; readBy: number; readAt: string }) => {
      this.messageReadSubject.next(data);
    });

    this.hubConnection.on('UserTyping', (indicator: TypingIndicator) => {
      this.typingStartedSubject.next(indicator);
    });

    this.hubConnection.on('UserStoppedTyping', (data: { userId: number }) => {
      this.typingStoppedSubject.next(data);
    });

    this.hubConnection.on('Error', (error: string) => {
      console.error('SignalR error:', error);
    });

    this.hubConnection.on('MessageSent', (message: Message) => {
      this.messageSentSubject.next(message);
    });
  }

  async sendMessage(receiverId: number, content: string): Promise<void> {
    if (this.hubConnection?.state !== HubConnectionState.Connected) {
      throw new Error('SignalR connection is not established');
    }

    try {
      await this.hubConnection.invoke('SendMessage', receiverId, content);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async markAsRead(messageId: number): Promise<void> {
    if (this.hubConnection?.state !== HubConnectionState.Connected) {
      throw new Error('SignalR connection is not established');
    }

    try {
      await this.hubConnection.invoke('MarkAsRead', messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  async startTyping(receiverId: number): Promise<void> {
    if (this.hubConnection?.state !== HubConnectionState.Connected) {
      return;
    }

    try {
      await this.hubConnection.invoke('StartTyping', receiverId);
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  }

  async stopTyping(receiverId: number): Promise<void> {
    if (this.hubConnection?.state !== HubConnectionState.Connected) {
      return;
    }

    try {
      await this.hubConnection.invoke('StopTyping', receiverId);
    } catch (error) {
      console.error('Error stopping typing indicator:', error);
    }
  }

  isConnected(): boolean {
    return this.hubConnection?.state === HubConnectionState.Connected;
  }
}


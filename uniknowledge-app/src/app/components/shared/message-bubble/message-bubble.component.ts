import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message, MessageStatus } from '../../../models/message.model';

@Component({
    selector: 'app-message-bubble',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './message-bubble.component.html',
    styleUrls: ['./message-bubble.component.scss']
})
export class MessageBubbleComponent {
    message = input.required<Message>();
    isMine = input.required<boolean>();

    formatMessageTime(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const timeString = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

        if (messageDate.getTime() === today.getTime()) {
            return timeString;
        }

        if (messageDate.getTime() === yesterday.getTime()) {
            return `Hôm qua ${timeString}`;
        }

        const dateStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        return `${dateStr} ${timeString}`;
    }

    getStatus(): MessageStatus | undefined {
        const msg = this.message();
        if (msg.status) return msg.status;
        return msg.isRead ? 'read' : 'sent';
    }
}

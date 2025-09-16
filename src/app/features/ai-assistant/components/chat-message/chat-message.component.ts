// src/app/features/ai-assistant/components/chat-message/chat-message.component.ts

import { Component, Input } from '@angular/core';
import { Message } from 'src/app/core/models/chat';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss'],
})
export class ChatMessageComponent {
  @Input() message!: Message;

  constructor() { }
}
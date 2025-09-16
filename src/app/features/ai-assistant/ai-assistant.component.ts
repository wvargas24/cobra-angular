import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatMainComponent } from './components/chat-main/chat-main.component';
import { ConversationHistoryComponent } from './components/conversation-history/conversation-history.component';

@Component({
  selector: 'app-ai-assistant',
  templateUrl: './ai-assistant.component.html',
  styleUrls: ['./ai-assistant.component.scss'],
  // standalone: true,
  // imports: [
  //   CommonModule,
  //   ChatMainComponent,
  //   ConversationHistoryComponent
  // ]
})
export class AiAssistantComponent {
  constructor() { }
}
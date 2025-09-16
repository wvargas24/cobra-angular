import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface, PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

// Components
import { AiAssistantRoutingModule } from './ai-assistant-routing.module';
import { AiAssistantComponent } from './ai-assistant.component';
import { ChatMainComponent } from './components/chat-main/chat-main.component';
import { ChatMessageComponent } from './components/chat-message/chat-message.component';
import { ConversationHistoryComponent } from './components/conversation-history/conversation-history.component';
import { WelcomeMessageComponent } from './components/welcome-message/welcome-message.component';

// PrimeNG Modules
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MenuModule } from 'primeng/menu';
import { DialogModule } from 'primeng/dialog';
import { ScrollPanelModule } from 'primeng/scrollpanel';

// Pipes
import { SafeHtmlPipe } from 'src/app/shared/pipes/safe-html.pipe';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
  wheelSpeed: 2,
  wheelPropagation: true,
  minScrollbarLength: 20
};

@NgModule({
  declarations: [
    AiAssistantComponent,
    ChatMainComponent,
    ConversationHistoryComponent,
    WelcomeMessageComponent,
    ChatMessageComponent,
    SafeHtmlPipe
  ],
  imports: [
    CommonModule,
    AiAssistantRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    PerfectScrollbarModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    AvatarModule,
    OverlayPanelModule,
    ConfirmDialogModule,
    MenuModule,
    DialogModule,
    ScrollPanelModule
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ],
  exports: [
    ChatMainComponent // <-- Aquí está el componente exportado
  ]
})
export class AiAssistantModule { }
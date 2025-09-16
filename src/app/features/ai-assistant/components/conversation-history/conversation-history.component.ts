import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';

import { ChatStateService } from 'src/app/core/services/chat-state.service';
import { ChatApiService } from 'src/app/core/services/chat-api.service';
import { Conversation } from 'src/app/core/models/chat';
import { environment } from 'src/app/environments/environment';

@Component({
  selector: 'app-conversation-history',
  templateUrl: './conversation-history.component.html',
  styleUrls: ['./conversation-history.component.scss'],
  providers: [ConfirmationService]
})
export class ConversationHistoryComponent implements OnInit, OnDestroy {
  @ViewChild('menu') private menu?: Menu;

  conversations: Conversation[] = [];
  activeConversationThreadId: string | null = null;
  isLoadingConversations: boolean = true;
  userId: number = Number(localStorage.getItem('usuId'));

  // Propiedades para el modal de confirmación
  displayConfirmDialog: boolean = false;
  conversationToDelete: Conversation | null = null;

  private conversationsSub!: Subscription;
  private activeConversationSub!: Subscription;

  // Opciones del menú para cada conversación
  conversationMenuItems: MenuItem[] = [];

  constructor(
    private chatStateService: ChatStateService,
    private chatApiService: ChatApiService,
    private confirmationService: ConfirmationService
  ) {
    const usuIdStr = localStorage.getItem('usuId');
    if (usuIdStr) {
      this.userId = Number(usuIdStr);
    } else {
      this.userId = 0;
    }
  }

  ngOnInit(): void {
    this.loadConversations();

    this.conversationsSub = this.chatStateService.conversations$.subscribe(conversations => {
      this.conversations = conversations;
      this.isLoadingConversations = false;
    });

    this.activeConversationSub = this.chatStateService.activeConversation$.subscribe(conversation => {
      this.activeConversationThreadId = conversation?.thread || null;
    });
  }

  ngOnDestroy(): void {
    if (this.conversationsSub) {
      this.conversationsSub.unsubscribe();
    }
    if (this.activeConversationSub) {
      this.activeConversationSub.unsubscribe();
    }
  }

  loadConversations(): void {
    this.isLoadingConversations = true;
    this.chatApiService.getConversationsUser(this.userId).subscribe({
      next: (data: any) => {
        const conversations: Conversation[] = data.map((conv: any) => ({
          id: conv.id,
          thread: conv.thread,
          usuId: conv.usuId,
          createdAt: conv.createdAt,
          createdBy: conv.createdBy,
          updatedAt: conv.updatedAt,
          updatedBy: conv.updatedBy,
          cuentaId: conv.cuentaId,
          threadname: conv.threadname
        }));
        this.chatStateService.setConversations(conversations);
        this.isLoadingConversations = false;
      },
      error: (error) => {
        console.error('Error loading conversations:', error);
        this.isLoadingConversations = false;
      }
    });
  }

  selectConversation(conversation: Conversation): void {
    this.chatStateService.setActiveConversation(conversation);
  }

  onMenuClick(event: Event, conversation: Conversation, menu: Menu): void {
    this.conversationMenuItems = [
      {
        label: 'Cambiar nombre',
        icon: 'pi pi-pencil',
        command: () => this.renameConversation(conversation)
      },
      {
        label: 'Eliminar',
        icon: 'pi pi-trash',
        command: (event) => {
          event.originalEvent?.stopPropagation();
          this.showDeleteDialog(conversation);
        }
      }
    ];
    menu.toggle(event);
  }

  renameConversation(conversation: Conversation): void {
    console.log('Renombrar conversación:', conversation);
  }

  showDeleteDialog(conversation: Conversation): void {
    this.conversationToDelete = conversation;
    this.displayConfirmDialog = true;
  }

  deleteConversation(): void {
    if (this.conversationToDelete) {
      this.chatApiService.deleteConversation(this.conversationToDelete.thread).subscribe({
        next: () => {
          this.loadConversations();
          this.chatStateService.setActiveConversation(null);
        },
        error: (error) => {
          console.error('Error deleting conversation:', error);
        },
        complete: () => {
          this.displayConfirmDialog = false;
          this.conversationToDelete = null;
        }
      });
    }
  }

  cancelDelete(): void {
    this.displayConfirmDialog = false;
    this.conversationToDelete = null;
  }
}
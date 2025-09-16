import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription, interval, firstValueFrom, throwError, Observable, Subject } from 'rxjs';
import { switchMap, takeWhile, catchError } from 'rxjs/operators';
import Typewriter from 't-writer.js';
import { PerfectScrollbarComponent, PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

import { ChatApiService } from 'src/app/core/services/chat-api.service';
import { ChatStateService } from 'src/app/core/services/chat-state.service';
import { Message, ApiMessage, Conversation } from 'src/app/core/models/chat';
import { MarkdownConverter } from 'src/app/shared/utils/markdown-converter';
import { environment } from 'src/app/environments/environment';

@Component({
  selector: 'app-chat-main',
  templateUrl: './chat-main.component.html',
  styleUrls: ['./chat-main.component.scss'],
})
export class ChatMainComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  @ViewChild('messageList') private messageList!: ElementRef;
  @ViewChild(PerfectScrollbarComponent) private psComponent?: PerfectScrollbarComponent;

  public config: PerfectScrollbarConfigInterface = {
    wheelPropagation: true,
    minScrollbarLength: 20
  };

  chatForm: FormGroup = new FormGroup({
    message: new FormControl('', Validators.required)
  });

  messages: Message[] = [];
  conversationStarted: boolean = false;
  currentThreadId: string | null = null;
  assistantId: string = environment.assistantId;
  userMessageText: string = '';

  emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😇', '😉', '😊', '🙂', '🙃', '😋', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '🤪', '😜', '😝', '😛',
    '🤑', '😎', '🤓', '🧐', '🤠', '🥳', '🤗', '🤡', '😏', '😶', '😐', '😑', '😒', '🙄', '🤨', '🤔', '🤫', '🤭', '🤥', '😳', '😞', '😟', '😠', '😡', '🤬', '😔',
    '😟', '😠', '😡', '🤬', '😔', '😕', '🙁', '😬', '🥺', '😣', '😖', '😫', '😩', '🥱', '😤', '😮', '😱', '😨', '😰', '😯', '😦', '😧', '😢', '😥', '😪', '🤤'
  ];

  private activeConversationSub!: Subscription;
  private pollStatusSub!: Subscription;
  private isTypewriterActive: boolean = false;
  private lastBotMessageProcessedIndex: number = -1;
  private processedMessageIds = new Set<string>();
  private _isLoadingResponse = false;


  constructor(
    private chatApiService: ChatApiService,
    private chatStateService: ChatStateService
  ) { }

  ngOnInit(): void {
    this.activeConversationSub = this.chatStateService.activeConversation$.subscribe(
      (conversation: Conversation | null) => {
        if (conversation && conversation.thread) {
          this.currentThreadId = conversation.thread;
          this.loadMessages(this.currentThreadId);
        } else {
          this.messages = [];
          this.currentThreadId = null;
          this.conversationStarted = false;
        }
      }
    );
  }

  ngAfterViewChecked(): void {
    this.startTypewriterAnimation();
  }

  ngOnDestroy(): void {
    if (this.activeConversationSub) {
      this.activeConversationSub.unsubscribe();
    }
    if (this.pollStatusSub) {
      this.pollStatusSub.unsubscribe();
    }
  }

  get isLoadingResponse(): boolean {
    return this._isLoadingResponse;
  }

  set isLoadingResponse(value: boolean) {
    this._isLoadingResponse = value;
    // Sincronizamos el estado del control del formulario con el valor de isLoadingResponse
    if (this.chatForm) { // Nos aseguramos que el formulario ya exista
      const messageControl = this.chatForm.get('message');
      if (value) {
        // Si isLoadingResponse es true, deshabilitamos el control
        messageControl?.disable();
      } else {
        // Si isLoadingResponse es false, habilitamos el control
        messageControl?.enable();
      }
    }
  }

  private loadMessages(threadId: string): void {
    this.isLoadingResponse = true;
    this.chatApiService.getMessages(threadId).subscribe({
      next: (apiMessages: ApiMessage[]) => {
        const messages: Message[] = apiMessages.map(msg => this.mapApiMessageToFrontend(msg));
        this.messages = messages;
        this.conversationStarted = true;
        this.isLoadingResponse = false;
        this.scrollToBottom();
      },
      error: (error: any) => {
        console.error('Error loading messages:', error);
        this.isLoadingResponse = false;
      }
    });
  }

  async sendMessage(): Promise<void> {
    this.userMessageText = this.chatForm.get('message')?.value?.trim();
    if (!this.userMessageText || this.isLoadingResponse) {
      return;
    }

    this.chatForm.reset();
    this.isLoadingResponse = true;

    const userMessage: Message = { id: 'temp-user-' + Date.now(), text: this.userMessageText, isUser: true, timestamp: Date.now(), isLoading: false, isError: false };
    this.messages.push(userMessage);

    const loadingMessage: Message = { id: 'temp-load-' + Date.now(), text: '', isUser: false, isLoading: true, timestamp: Date.now(), isError: false };
    this.messages.push(loadingMessage);

    this.conversationStarted = true;
    this.scrollToBottom();

    try {
      if (!this.currentThreadId) {
        const threadResponse = await firstValueFrom(this.chatApiService.generateThread());
        this.currentThreadId = threadResponse.id;
      }

      await firstValueFrom(this.chatApiService.sendMessageToThread({
        threadId: this.currentThreadId,
        asistantsId: this.assistantId,
        role: 'user',
        messages: this.userMessageText
      }));

      this.pollStatusSub = this.pollRunStatus().subscribe({
        next: (apiMessages: ApiMessage[]) => {
          this.handleBotResponse(apiMessages);
        },
        error: (error: any) => {
          this.handleChatError(error);
        },
        complete: () => {
          if (this.pollStatusSub) {
            this.pollStatusSub.unsubscribe();
          }
        }
      });
    } catch (error) {
      this.handleChatError(error);
    }
  }

  private pollRunStatus(): Observable<ApiMessage[]> {
    return interval(1500).pipe(
      switchMap(() => this.chatApiService.getRunStatus(this.currentThreadId!)),
      takeWhile(response => response.status !== 'completed' && response.status !== 'failed', true),
      switchMap(response => {
        if (response.status === 'completed') {
          return this.chatApiService.getMessages(this.currentThreadId!);
        } else if (response.status === 'failed') {
          return throwError(() => new Error('Run failed'));
        }
        return new Observable<ApiMessage[]>();
      }),
      catchError((error: any) => {
        console.error('Polling error:', error);
        return throwError(() => new Error('An error occurred during polling.'));
      })
    );
  }

  private handleBotResponse(apiMessages: ApiMessage[]): void {
    const loadingIndex = this.messages.findIndex(msg => msg.isLoading);

    // Mapeamos y filtramos solo los mensajes del asistente que no han sido procesados
    const newAssistantMessages: Message[] = apiMessages
      .filter(msg => msg.role === 'assistant' && !this.processedMessageIds.has(msg.id))
      .map(msg => {
        this.processedMessageIds.add(msg.id); // Agregamos el ID al set
        return this.mapApiMessageToFrontend(msg);
      });

    if (loadingIndex !== -1) {
      // Reemplaza el mensaje de carga con los nuevos mensajes del bot
      this.messages.splice(loadingIndex, 1, ...newAssistantMessages);
    } else {
      this.messages.push(...newAssistantMessages);
    }

    this.isLoadingResponse = false;
    this.scrollToBottom();
  }

  private handleChatError(error: any): void {
    console.error('Error in chat flow:', error);
    const loadingIndex = this.messages.findIndex(msg => msg.isLoading);

    const errorMessage: Message = {
      id: '',
      text: 'Lo siento, hubo un error al procesar tu solicitud.',
      isUser: false,
      isError: true,
      timestamp: Date.now(),
      isLoading: false
    };

    if (loadingIndex !== -1) {
      this.messages[loadingIndex] = errorMessage;
    } else {
      this.messages.push(errorMessage);
    }

    this.isLoadingResponse = false;
    this.scrollToBottom();
  }

  private mapApiMessageToFrontend(apiMessage: ApiMessage): Message {
    const textContent = apiMessage.content.find(c => c.type === 'text');
    const imageContent = apiMessage.content.find(c => c.type === 'image_file');

    let text = textContent?.text?.value;
    let imageUrl = imageContent ? `${environment.iaEndpoint}/getFilesId/${imageContent.image_file?.file_id}/png` : undefined;

    // Aquí es donde aplicaremos el formato de Markdown
    if (text) {
      text = this.applyMarkdownConverter(text);
    }

    return {
      id: apiMessage.id,
      text: text,
      imageUrl: imageUrl,
      isUser: apiMessage.role === 'user',
      timestamp: apiMessage.created_at * 1000,
      isLoading: false,
      isError: false
    };
  }

  private applyMarkdownConverter(text: string): string {
    const markdownConverter = new MarkdownConverter(text);
    markdownConverter.convertHeaders();
    markdownConverter.convertLists();
    markdownConverter.convertBoldText();
    markdownConverter.convertLinks();
    markdownConverter.convertItalicText();
    markdownConverter.convertCodeBlocks();
    markdownConverter.convertParagraphs();

    return markdownConverter.getHtmlContent();
  }

  private startTypewriterAnimation(): void {
    let lastBotMessageIndex = -1;
    let lastBotMessage: Message | null = null;

    // Iteramos de atrás hacia adelante para encontrar el último mensaje del bot
    for (let i = this.messages.length - 1; i >= 0; i--) {
      const msg = this.messages[i];
      if (!msg.isUser && !msg.isLoading && !msg.isError) {
        lastBotMessage = msg;
        lastBotMessageIndex = i;
        break;
      }
    }

    // Usamos `setTimeout` para esperar a que el DOM se actualice
    setTimeout(() => {
      if (lastBotMessage && lastBotMessageIndex > this.lastBotMessageProcessedIndex && !this.isTypewriterActive && this.messageList?.nativeElement) {
        this.isTypewriterActive = true;
        this.lastBotMessageProcessedIndex = lastBotMessageIndex;

        const messageElement = this.messageList.nativeElement.children[lastBotMessageIndex]?.querySelector('.message-text');

        if (messageElement && lastBotMessage.text) {
          const textToAnimate = lastBotMessage.text;
          messageElement.innerHTML = '';

          const writer = new Typewriter(messageElement, {
            loop: false,
            typeSpeed: 10,
            deleteSpeed: 0,
            typeColor: 'inherit',
            animateCursor: 'none'
          });

          writer.type(textToAnimate).start().then(() => {
            this.isTypewriterActive = false;
            this.scrollToBottom();
          });
        } else {
          this.isTypewriterActive = false;
        }
      }
    }, 0);
  }

  private scrollToBottom(): void {
    if (this.psComponent && this.psComponent.directiveRef) {
      this.psComponent.directiveRef.update();
      this.psComponent.directiveRef.scrollToBottom();
    }
  }

  startNewConversation(): void {
    this.chatForm.reset();
    this.messages = [];
    this.currentThreadId = null;
    this.conversationStarted = false;
    this.isLoadingResponse = false;
    this.processedMessageIds.clear();
    this.chatStateService.setActiveConversation(null);
  }

  onEmojiSelect(emoji: string) {
    this.userMessageText += emoji;
  }
}
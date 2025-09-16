import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Conversation, Message } from '../models/chat';

@Injectable({
  providedIn: 'root'
})
export class ChatStateService {
  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  conversations$ = this.conversationsSubject.asObservable();

  private activeConversationSubject = new BehaviorSubject<Conversation | null>(null);
  activeConversation$ = this.activeConversationSubject.asObservable();

  private messagesSubject = new BehaviorSubject<Message[]>([]);
  messages$ = this.messagesSubject.asObservable();

  constructor() { }

  setConversations(conversations: Conversation[]): void {
    this.conversationsSubject.next(conversations);
  }

  getConversations(): Conversation[] {
    return this.conversationsSubject.value;
  }

  setActiveConversation(conversation: Conversation | null): void {
    this.activeConversationSubject.next(conversation);
  }

  getActiveConversation(): Conversation | null {
    return this.activeConversationSubject.value;
  }

  setMessages(messages: Message[]): void {
    this.messagesSubject.next(messages);
  }

  getMessages(): Message[] {
    return this.messagesSubject.value;
  }
}
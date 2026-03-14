import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Subscription } from 'rxjs';
import { LanguageService } from 'src/app/services/language-service/language.service';
import { ChatService, ChatMessage } from 'src/app/services/chat/chat.service';

@Component({
  standalone: false,
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css'],
})
export class ChatbotComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('messageInput') private messageInput!: ElementRef;

  messages: ChatMessage[] = [];
  inputText = '';
  isLoading = false;

  title?: string;
  subtitle?: string;
  placeholder?: string;
  welcomeMessage?: string;
  welcomeHint?: string;

  private subscription?: Subscription;
  private shouldScrollToBottom = false;

  constructor(
    private http: HttpClient,
    private languageService: LanguageService,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    this.loadTranslations();
    this.subscription = this.languageService
      .getLanguageChangeObservable()
      .subscribe(() => {
        this.loadTranslations();
      });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  loadTranslations() {
    const selectedLanguage = this.languageService.getSelectedLanguage();
    this.http
      .get(`./assets/i18n/${selectedLanguage}.json`)
      .subscribe((translations: any) => {
        this.title = translations.chatbot.title;
        this.subtitle = translations.chatbot.subtitle;
        this.placeholder = translations.chatbot.placeholder;
        this.welcomeMessage = translations.chatbot.welcomeMessage;
        this.welcomeHint = translations.chatbot.welcomeHint;
      });
  }

  sendMessage() {
    const text = this.inputText.trim();
    if (!text || this.isLoading) return;

    this.messages.push({
      role: 'user',
      content: text,
      timestamp: new Date(),
    });

    this.inputText = '';
    this.isLoading = true;
    this.shouldScrollToBottom = true;

    this.chatService.sendMessage(text).subscribe({
      next: (response) => {
        this.messages.push({
          role: 'assistant',
          content: response.reply,
          timestamp: new Date(),
        });
        this.isLoading = false;
        this.shouldScrollToBottom = true;
        this.focusInput();
      },
      error: () => {
        this.messages.push({
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
          timestamp: new Date(),
        });
        this.isLoading = false;
        this.shouldScrollToBottom = true;
        this.focusInput();
      },
    });
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom() {
    try {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch (_) {}
  }

  private focusInput() {
    setTimeout(() => {
      this.messageInput?.nativeElement?.focus();
    }, 50);
  }
}

import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LanguageService } from 'src/app/services/language-service/language.service';

@Component({
  standalone: false,
  selector: 'app-chat-widget',
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.css'],
})
export class ChatWidgetComponent implements OnInit, OnDestroy {
  isOpen = false;
  inputText = '';
  isOnChatPage = false;

  widgetTitle?: string;
  widgetSubtitle?: string;
  widgetPlaceholder?: string;
  widgetCta?: string;

  private langSub?: Subscription;
  private routerSub?: Subscription;

  constructor(
    private http: HttpClient,
    private languageService: LanguageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadTranslations();
    this.langSub = this.languageService
      .getLanguageChangeObservable()
      .subscribe(() => this.loadTranslations());

    this.routerSub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.isOnChatPage = (e as NavigationEnd).urlAfterRedirects.startsWith('/chatbot');
      });

    this.isOnChatPage = this.router.url.startsWith('/chatbot');
  }

  ngOnDestroy() {
    this.langSub?.unsubscribe();
    this.routerSub?.unsubscribe();
  }

  loadTranslations() {
    const lang = this.languageService.getSelectedLanguage();
    this.http
      .get(`./assets/i18n/${lang}.json`)
      .subscribe((t: any) => {
        this.widgetTitle = t.chatWidget.title;
        this.widgetSubtitle = t.chatWidget.subtitle;
        this.widgetPlaceholder = t.chatWidget.placeholder;
        this.widgetCta = t.chatWidget.cta;
      });
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  close() {
    this.isOpen = false;
  }

  send() {
    const text = this.inputText.trim();
    if (!text) return;

    const url = `/chatbot?q=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    this.inputText = '';
    this.isOpen = false;
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.send();
    }
  }
}

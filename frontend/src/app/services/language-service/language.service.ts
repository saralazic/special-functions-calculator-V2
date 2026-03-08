import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly storageKey = 'selectedLanguage';
  private languageChange$ = new Subject<string>();

  getLanguageChangeObservable() {
    return this.languageChange$.asObservable();
  }

  getSelectedLanguage(): string {
    return localStorage.getItem(this.storageKey) || 'sr';
  }

  setSelectedLanguage(language: string): void {
    localStorage.setItem(this.storageKey, language);
    this.languageChange$.next(language);
  }
}

import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { LanguageService } from 'src/app/services/language-service/language.service';

@Component({
  standalone: false,
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  title?: string;
  private subscription: Subscription;

  constructor(
    private http: HttpClient,
    public languageService: LanguageService
  ) {
    this.subscription = this.languageService
      .getLanguageChangeObservable()
      .subscribe(() => {
        this.loadTranslations();
      });
  }

  ngOnInit() {
    this.loadTranslations();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadTranslations() {
    const selectedLanguage = this.languageService.getSelectedLanguage();
    this.http
      .get(`./assets/i18n/${selectedLanguage}.json`)
      .subscribe((translations: any) => {
        this.title = translations.header.title;
      });
  }

  setLanguage(language: string) {
    this.languageService.setSelectedLanguage(language);
    this.loadTranslations();
  }

  getLanguageIconStyle(language?: string) {
    const selectedLanguage =
      language || this.languageService.getSelectedLanguage();

    /** TODO: Icon is smaller than circle around it (button), I should fix it */
    const imageUrl = `url('assets/icons/${selectedLanguage}.png')`;
    return { 'background-image': imageUrl };
  }
}

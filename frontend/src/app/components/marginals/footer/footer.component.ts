import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { LanguageService } from 'src/app/services/language-service/language.service';

@Component({
  standalone: false,
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent {
  about?: string;
  contact?: string;
  copyright?: string;

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
        this.contact = translations.footer.contact;
        this.about = translations.footer.about;
        this.copyright = translations.footer.copyright;
      });
  }
}

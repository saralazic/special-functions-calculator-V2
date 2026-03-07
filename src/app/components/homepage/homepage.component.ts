import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { LanguageService } from 'src/app/services/language-service/language.service';

@Component({
  standalone: false,
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css'],
})
export class HomepageComponent {
  private subscription?: Subscription;

  /** TODO: html can be rendered dynamically, it would be much nicer than this, I should refractor this */
  head_1?: string;
  head_2?: string;
  bessel_1?: string;
  gamma?: string;
  beta?: string;
  laguerre?: string;
  legendre?: string;
  jacobi?: string;
  chebyshev_1?: string;
  chebyshev_2?: string;
  hermite_1?: string;
  hermite_2?: string;

  constructor(
    private http: HttpClient,
    private languageService: LanguageService
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

  loadTranslations() {
    const selectedLanguage = this.languageService.getSelectedLanguage();
    this.http
      .get(`./assets/i18n/${selectedLanguage}.json`)
      .subscribe((translations: any) => {
        this.head_1 = translations.homepage.head_1;
        this.head_2 = translations.homepage.head_2;
        this.bessel_1 = translations.homepage.bessel_1;
        this.beta = translations.homepage.beta;
        this.gamma = translations.homepage.gamma;
        this.laguerre = translations.homepage.laguerre;
        this.legendre = translations.homepage.legendre;
        this.jacobi = translations.homepage.jacobi;
        this.chebyshev_1 = translations.homepage.chebyshev_1;
        this.chebyshev_2 = translations.homepage.chebyshev_2;
        this.hermite_1 = translations.homepage.hermite_1;
        this.hermite_2 = translations.homepage.hermite_2;
      });
  }
}

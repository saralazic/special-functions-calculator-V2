import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { LanguageService } from 'src/app/services/language-service/language.service';

interface FunctionCard {
  route: string;
  translationKey: string;
  symbol: string;
  label?: string;
  category: 'function' | 'polynomial';
}

@Component({
  standalone: false,
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css'],
})
export class HomepageComponent {
  private subscription?: Subscription;

  head_1?: string;
  head_2?: string;

  functions: FunctionCard[] = [
    { route: 'bessel1', translationKey: 'bessel_1', symbol: 'Jₙ(x)', category: 'function' },
    { route: 'gamma', translationKey: 'gamma', symbol: 'Γ(x)', category: 'function' },
    { route: 'beta', translationKey: 'beta', symbol: 'B(x,y)', category: 'function' },
    { route: 'legendre', translationKey: 'legendre', symbol: 'Pₙ(x)', category: 'polynomial' },
    { route: 'laguerre', translationKey: 'laguerre', symbol: 'Lₙ(x)', category: 'polynomial' },
    { route: 'hermite1', translationKey: 'hermite_1', symbol: 'Hₙ(x)', category: 'polynomial' },
    { route: 'hermite2', translationKey: 'hermite_2', symbol: 'Heₙ(x)', category: 'polynomial' },
    { route: 'chebyshev1', translationKey: 'chebyshev_1', symbol: 'Tₙ(x)', category: 'polynomial' },
    { route: 'chebyshev2', translationKey: 'chebyshev_2', symbol: 'Uₙ(x)', category: 'polynomial' },
    { route: 'jacobi', translationKey: 'jacobi', symbol: 'Pₙᵅᵝ(x)', category: 'polynomial' },
  ];

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
        this.functions.forEach(fn => {
          fn.label = translations.homepage[fn.translationKey];
        });
      });
  }
}

import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { FunctionType } from 'src/app/models/enums';
import { LanguageService } from 'src/app/services/language-service/language.service';
import { loadTranslationForFunction } from 'src/utilities/utilities';

@Component({
  standalone: false,
  selector: 'app-function-information',
  templateUrl: './function-information.component.html',
  styleUrls: ['./function-information.component.css'],
})
export class FunctionInformationComponent {
  private subscription?: Subscription;
  parameter: string | null = null;
  functionName?: string;
  definitionUrls: string[] = [];
  graphUrl: string = '';
  domainUrl: string = '';
  relationsUrl: string[] = [];
  equationUrl: string = '';
  showEquation: boolean = false;

  styleDef: number = 0;
  styleDomain: number = 0;
  styleRel: number = 0;
  styleEqu: number = 0;

  photoStyle: number = 0;

  definition = '';
  domain = '';
  equation = '';
  relations = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.parameter = this.route.snapshot.paramMap.get('parameter');
    this.showEquation = !(
      this.parameter === FunctionType.BETA ||
      this.parameter === FunctionType.GAMMA
    );
    this.generatePhotoUrls();
    this.loadStyles();
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

  generatePhotoUrls() {
    const baseUrl = '../../../assets/functions';
    const definitionsCnt =
      this.parameter === FunctionType.HERMITE_PROBABILISTIC ? 1 : 3;
    for (let i = 1; i <= definitionsCnt; i++) {
      this.definitionUrls.push(
        `${baseUrl}/definitions/${this.parameter}_${i}.png`
      );
    }

    const relationsCnt =
      this.parameter === FunctionType.HERMITE_PROBABILISTIC ? 2 : 4;
    for (let i = 1; i <= relationsCnt; i++) {
      this.relationsUrl.push(`${baseUrl}/relations/${this.parameter}_${i}.png`);
    }

    this.graphUrl = `${baseUrl}/graphs/${this.parameter}.png`;
    this.equationUrl = `${baseUrl}/equations/${this.parameter}.png`;
    this.domainUrl = `${baseUrl}/domains/${this.parameter}.png`;

    console.log(this.definitionUrls);
  }

  loadTranslations() {
    const selectedLanguage = this.languageService.getSelectedLanguage();
    this.http
      .get(`./assets/i18n/${selectedLanguage}.json`)
      .subscribe((translations: any) => {
        const spefTranslation = loadTranslationForFunction(
          this.parameter as FunctionType,
          translations
        );
        this.functionName = spefTranslation?.name;
        this.definition = translations.function_information.definition;
        this.domain = translations.function_information.domain;
        this.equation = translations.function_information.equation;
        this.relations = translations.function_information.relations;
      });
  }

  loadStyles() {
    switch (this.parameter) {
      case FunctionType.BESSEL_FIRST_KIND: {
        this.styleDef = 50;
        this.styleDomain = 50;
        this.styleRel = 50;
        this.styleEqu = 50;
        this.photoStyle = 70;
        break;
      }
      case FunctionType.HERMITE_PHYSICIST: {
        this.styleDef = 55;
        this.styleDomain = 57;
        this.styleRel = 55;
        this.styleEqu = 60;
        this.photoStyle = 90;
        break;
      }
      case FunctionType.HERMITE_PROBABILISTIC: {
        this.styleDef = 60;
        this.styleDomain = 64;
        this.styleRel = 65;
        this.styleEqu = 60;
        this.photoStyle = 90;
        break;
      }
      case FunctionType.LAGUERRE_POLYNOMIAL: {
        this.styleDef = 55;
        this.styleDomain = 60;
        this.styleRel = 57;
        this.styleEqu = 60;
        this.photoStyle = 90;
        break;
      }
      case FunctionType.LEGENDRE_POLYNOMIAL: {
        this.styleDef = 55;
        this.styleDomain = 55;
        this.styleRel = 60;
        this.styleEqu = 55;
        this.photoStyle = 90;
        break;
      }
      case FunctionType.CHEBYSHEV_FIRST_KIND: {
        this.styleDef = 60;
        this.styleDomain = 55;
        this.styleRel = 60;
        this.styleEqu = 60;
        this.photoStyle = 90;
        break;
      }
      case FunctionType.CHEBYSHEV_SECOND_KIND: {
        this.styleDef = 60;
        this.styleDomain = 55;
        this.styleRel = 60;
        this.styleEqu = 60;
        this.photoStyle = 90;
        break;
      }
      case FunctionType.JACOBI_POLYNOMIAL: {
        this.styleDef = 60;
        this.styleDomain = 60;
        this.styleRel = 65;
        this.styleEqu = 65;
        this.photoStyle = 90;
        break;
      }
      case FunctionType.GAMMA: {
        this.styleDef = 40;
        this.styleDomain = 40;
        this.styleRel = 45;
        this.styleEqu = 45;
        this.photoStyle = 90;
        break;
      }
      case FunctionType.BETA: {
        this.styleDef = 45;
        this.styleDomain = 45;
        this.styleRel = 45;
        this.styleEqu = 45;
        this.photoStyle = 90;
        break;
      }
      default: {
        this.styleDef = 25;
        this.styleDomain = 15;
        this.styleRel = 25;
        this.styleEqu = 25;
        this.photoStyle = 80;
      }
    }
  }
}

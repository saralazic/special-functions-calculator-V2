import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  FunctionParams,
  FunctionParamsForCalculation,
} from 'src/app/services/functions/specialFunction';
import { LanguageService } from 'src/app/services/language-service/language.service';
import { ApiService } from 'src/app/services/api/api.service';
import { drawGraph, loadTranslationForFunction } from 'src/utilities/utilities';
import { FunctionType } from 'src/app/models/enums';

@Component({
  standalone: false,
  selector: 'app-special-function',
  templateUrl: './special-function.component.html',
  styleUrls: ['./special-function.component.css'],
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0 })),
      transition(':enter', [animate('300ms', style({ opacity: 1 }))]),
      transition(':leave', [animate('300ms', style({ opacity: 0 }))]),
    ]),
  ],
})
export class SpecialFunctionComponent implements OnInit {
  @ViewChild('graphContainer') graphContainer!: ElementRef;

  @Output() calculationResult = new EventEmitter<string>();

  private subscription?: Subscription;
  slideTriggered: boolean = false;

  parameter: string | null = null;
  value?: number;
  valueBig?: string;
  name?: string;
  infoTooltip?: string;

  infoIconPath = 'assets/icons/info.png';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private languageService: LanguageService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.parameter = this.route.snapshot.paramMap.get('parameter');
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
        const spefTranslation = loadTranslationForFunction(
          this.parameter as FunctionType,
          translations
        );
        this.name = spefTranslation?.name;
        this.infoTooltip = translations.tooltips.info;
      });
  }

  onFormValuesChanged(data: FunctionParams) {
    if (data) {
      this.slideTriggered = true;

      this.apiService
        .calculate(this.parameter!, data.bignumber, data.real)
        .subscribe({
          next: (response) => {
            this.valueBig = response.result64;
            this.value = response.resultReal;

            drawGraph(
              this.graphContainer?.nativeElement,
              response.coordinates.xArr,
              response.coordinates.yArr,
              data.real.x,
              response.resultReal
            );
            this.graphContainer.nativeElement.style.display = 'block';
            this.calculationResult.emit(this.valueBig);
          },
          error: (err) => {
            console.error('Calculation failed:', err);
          },
        });

      return;
    }

    this.valueBig = '';
    this.slideTriggered = false;
    this.graphContainer.nativeElement.style.display = 'none';
  }

  openNewWindow() {
    window.open(`/function-informations/${this.parameter}`, '_blank');
  }
}

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
  SpecialFunction,
} from 'src/app/services/functions/specialFunction';
import { LanguageService } from 'src/app/services/language-service/language.service';
import {
  createChosenFunction,
  drawGraph,
  generateCoordinates,
} from 'src/utilities/utilities';

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

  /** I am emitting result of calculation to display component in order to show it nicely */
  @Output() calculationResult = new EventEmitter<string>();

  private subscription?: Subscription;
  private spef?: SpecialFunction;
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
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.parameter = this.route.snapshot.paramMap.get('parameter');
    this.spef = createChosenFunction(this.parameter ?? '');
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

  drawGraphic(data: FunctionParamsForCalculation) {
    const { xArr, yArr } = generateCoordinates(this.parameter, this.spef, data);

    drawGraph(
      this.graphContainer?.nativeElement,
      xArr,
      yArr,
      data.x,
      this.spef?.calculate(data) ?? 0
    );
    this.graphContainer.nativeElement.style.display = 'block';
  }

  loadTranslations() {
    const selectedLanguage = this.languageService.getSelectedLanguage();
    this.http
      .get(`./assets/i18n/${selectedLanguage}.json`)
      .subscribe((translations: any) => {
        let spefTranslations = this.spef?.loadTranslations(translations);
        this.name = spefTranslations?.name;
        this.infoTooltip = translations.tooltips.info;
      });
  }

  /** When child component sends value, it triggers this method */
  onFormValuesChanged(data: FunctionParams) {
    if (data) {
      this.slideTriggered = true;

      this.valueBig = this.spef?.calculate64(data.bignumber);

      this.value = this.spef?.calculate(data.real);

      this.drawGraphic(data.real);
      this.calculationResult.emit(this.valueBig);
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

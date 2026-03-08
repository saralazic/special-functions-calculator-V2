import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { FunctionType, InputType } from 'src/app/models/enums';
import {
  FunctionParams,
  FunctionParamsForCalculation,
  FunctionParamsForCalculationWithBigNumbers,
} from 'src/app/services/functions/specialFunction';
import { LanguageService } from 'src/app/services/language-service/language.service';
import {
  bigNumberValidatorForPrecision,
  bigNumberValidatorNatural,
  bigNumberValidatorConstrained,
  bigNumberValidatorN0,
  bigNumberValidatorForParams,
  bigNumberValidatorReal,
  bigNumberValidatorLegendre,
  bigNumberValidatorPositiveReal,
} from 'src/utilities/validators';

@Component({
  standalone: false,
  selector: 'app-function-input',
  templateUrl: './function-input.component.html',
  styleUrls: ['./function-input.component.css'],
})
export class FunctionInputComponent implements OnInit {
  /** since this is only input form, values are sent to parent component -> special-function
   * and than parent component will call functions which perform calculation
   */
  @Output() formValuesChanged = new EventEmitter<any>();

  /** parameter is chosen function */
  @Input() parameter: string | null = null;

  private subscription?: Subscription;

  form!: FormGroup;

  /** labels which need translation */
  labelOrderNatural: string = '';
  labelOrderReal: string = '';
  labelOrderNonNegative: string = '';
  labelPrecision: string = '';
  labelVariable: string = '';
  labelVariableN0: string = '';
  aInputLabel: string = '';
  bInputLabel: string = '';
  labelVariableConstrained: string = '';
  labelVariableRealPositive: string = '';
  labelVariableLegendre: string = '';
  orderInputReal: IInput;
  orderInputNatural: IInput;
  orderInputNonNegative: IInput;
  precisionInput: IInput;
  variableInput: IInput;
  variableInputConstrained: IInput;
  variableRealPositive: IInput;
  secondVariableInput: IInput;
  variableInputLegendre: IInput;
  variableInputN0: IInput;
  aInput: IInput;
  bInput: IInput;
  basicInformationsLabel: string = '';
  useCalculatedValueLabel: string = '';
  calculateAndDrawLabel: string = '';
  clearLabel: string = '';
  calculatorTooltip?: string;

  errorMessage: string = '';

  /** value which is result of calculator usage */
  currentCalculatedValue: string;

  /** helpers for calculator use */
  shouldShowCalculator: boolean;
  whereToUseCalculatedValue: InputType | null;

  calculatorIconPath = 'assets/icons/calculator-alternative-2.png';
  calculatorError?: string;

  /** Array of inputs created dynamically based on which function user has chosen
   * this inputs include:
   * 1. validation (domain, precision needs to be decimal between 0 and 1 etc.)
   * 2. appropriate errors
   * 3. field input type which is needed for calculator usage
   */
  inputs: IInput[] = [];

  constructor(
    private http: HttpClient,
    private languageService: LanguageService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder
  ) {
    //** initially we don't show calculator */
    this.shouldShowCalculator = false;
    this.whereToUseCalculatedValue = null;
    this.currentCalculatedValue = '';

    //** initialize all possible inputs, but I will render only the ones I really need */
    this.orderInputReal = {
      label: this.labelOrderReal,
      formControlName: 'orderValue',
      isInvalid:
        "form.get('orderValue')?.invalid && form.get('orderValue')?.touched",
      error: this.errorMessage,
      inputType: InputType.ORDER,
    };

    this.orderInputNatural = {
      label: this.labelOrderNatural,
      formControlName: 'orderValue',
      isInvalid:
        "form.get('orderValue')?.invalid && form.get('orderValue')?.touched",
      error: this.errorMessage,
      inputType: InputType.ORDER,
    };

    this.orderInputNonNegative = {
      label: this.labelOrderNonNegative,
      formControlName: 'orderValue',
      isInvalid:
        "form.get('orderValue')?.invalid && form.get('orderValue')?.touched",
      error: this.errorMessage,
      inputType: InputType.ORDER,
    };

    this.precisionInput = {
      label: this.labelPrecision,
      formControlName: 'precisionValue',
      isInvalid:
        "form.get('precisionValue')?.invalid && form.get('precisionValue')?.touched",
      error: this.errorMessage,
      inputType: InputType.PRECISION,
    };

    this.variableInput = {
      label: this.labelVariable,
      formControlName: 'variableValue',
      isInvalid:
        "form.get('variableValue')?.invalid && form.get('variableValue')?.touched",
      error: this.errorMessage,
      inputType: InputType.VARIABLE,
    };

    this.variableInputConstrained = {
      label: this.labelVariableConstrained,
      formControlName: 'variableValue',
      isInvalid:
        "form.get('variableValue')?.invalid && form.get('variableValue')?.touched",
      error: this.errorMessage,
      inputType: InputType.VARIABLE,
    };

    this.variableRealPositive = {
      label: this.labelVariableRealPositive,
      formControlName: 'variableValue',
      isInvalid:
        "form.get('variableValue')?.invalid && form.get('variableValue')?.touched",
      error: this.errorMessage,
      inputType: InputType.VARIABLE,
    };

    this.secondVariableInput = {
      ...this.variableRealPositive,
      formControlName: 'secondVariableValue',
      inputType: InputType.SECOND_VARIABLE,
      isInvalid:
        "form.get('secondVariableValue')?.invalid && form.get('secondVariableValue')?.touched",
    };

    this.variableInputLegendre = {
      label: this.labelVariableLegendre,
      formControlName: 'variableValue',
      isInvalid:
        "form.get('variableValue')?.invalid && form.get('variableValue')?.touched",
      error: this.errorMessage,
      inputType: InputType.VARIABLE,
    };

    this.variableInputN0 = {
      label: this.labelVariableN0,
      formControlName: 'variableValue',
      isInvalid:
        "form.get('variableValue')?.invalid && form.get('variableValue')?.touched",
      error: this.errorMessage,
      inputType: InputType.VARIABLE,
    };

    this.aInput = {
      label: this.aInputLabel,
      formControlName: 'aParameterValue',
      isInvalid:
        "form.get('aParameterValue')?.invalid && form.get('aParameterValue')?.touched",
      error: this.errorMessage,
      inputType: InputType.ALPHA,
    };

    this.bInput = {
      label: this.bInputLabel,
      formControlName: 'bParameterValue',
      isInvalid:
        "form.get('bParameterValue')?.invalid && form.get('bParameterValue')?.touched",
      error: this.errorMessage,
      inputType: InputType.BETA,
    };
  }

  ngOnInit() {
    this.parameter = this.route.snapshot.paramMap.get('parameter');
    /** next line creates input depending on parameter (chosen function) */
    this.assignInput();
    this.loadTranslations();
    /** next line literally just creates form, again based on needs for chosen function */
    this.createForm();

    this.subscription = this.languageService
      .getLanguageChangeObservable()
      .subscribe(() => {
        this.loadTranslations();
      });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  onSubmit(): void {
    if (this.form.valid) {
      const orderValue = this.form.get('orderValue')?.value || '0';
      const precisionValue = this.form.get('precisionValue')?.value || '1e-64';
      const variableValue = this.form.get('variableValue')?.value || '0';
      const secondVariableValue =
        this.form.get('secondVariableValue')?.value || '0';
      const paramAlpha = this.form.get('aParameterValue')?.value || '0';
      const paramBeta = this.form.get('bParameterValue')?.value || '0';

      /** All the calculation in app should be done with big numbers (64 precision) */
      const paramsBig = {
        alphaBig: orderValue,
        epsBig: precisionValue,
        xBig: variableValue,
        yBig: secondVariableValue,
        a: paramAlpha,
        b: paramBeta,
      } as FunctionParamsForCalculationWithBigNumbers;

      /** I actually don't need this, I created it for test purposes */
      const paramsR = {
        alpha: +orderValue,
        eps: +precisionValue,
        y: +secondVariableValue,
        x: +variableValue,
        a: +paramAlpha,
        b: +paramBeta,
      } as FunctionParamsForCalculation;

      const params = {
        real: paramsR,
        bignumber: paramsBig,
      } as FunctionParams;

      /** now I am just sending data to parent component */
      this.formValuesChanged.emit(params);
    }
  }

  showCalculator(inputType: InputType) {
    this.whereToUseCalculatedValue =
      this.whereToUseCalculatedValue === inputType ? null : inputType;
    this.shouldShowCalculator = this.whereToUseCalculatedValue !== null;

    this.currentCalculatedValue = '';
  }

  onCalculated(value: string): void {
    this.currentCalculatedValue = value;
  }

  useCalculatedValue(): void {
    let controlName: string;
    switch (this.whereToUseCalculatedValue) {
      case InputType.PRECISION: {
        controlName = 'precisionValue';
        break;
      }
      case InputType.ORDER: {
        controlName = 'orderValue';
        break;
      }
      case InputType.ALPHA: {
        controlName = 'aParameterValue';
        break;
      }
      case InputType.BETA: {
        controlName = 'bParameterValue';
        break;
      }
      case InputType.SECOND_VARIABLE: {
        controlName = 'secondVariableValue';
        break;
      }
      case InputType.VARIABLE:
      default: {
        controlName = 'variableValue';
      }
    }

    const control = this.form.get(controlName);
    const newValue = this.currentCalculatedValue;

    this.form.patchValue({
      [controlName]: newValue,
    });

    /* Trigger validation on the control */
    control?.updateValueAndValidity();

    /** Validate calculated value with appropriate form
     * if invalid show error
     */
    if (control?.invalid && control?.touched) {
      const errors = control?.errors;
      console.error('Validation error:', errors);
    }
  }

  useCalcValDisabled(): boolean {
    if (this.currentCalculatedValue.length < 1) return true;
    if (this.whereToUseCalculatedValue) return false;

    const precisionNumberRegex =
      /^(0(\.\d+)?|0\.\d+|([0-9]\d*(\.\d+)?(e-?\d+)?))$/i;

    return !precisionNumberRegex.test(this.currentCalculatedValue);
  }

  createForm() {
    switch (this.parameter) {
      case FunctionType.BESSEL_FIRST_KIND:
        this.form = this.formBuilder.group({
          orderValue: ['1', [Validators.required, bigNumberValidatorNatural]],
          precisionValue: [
            '1e-64',
            [Validators.required, bigNumberValidatorForPrecision],
          ],
          variableValue: ['0', [Validators.required, bigNumberValidatorReal]],
        });
        break;
      case FunctionType.GAMMA:
        this.form = this.formBuilder.group({
          variableValue: [
            '1',
            [Validators.required, bigNumberValidatorPositiveReal],
          ],
        });
        break;
      case FunctionType.BETA:
        this.form = this.formBuilder.group({
          variableValue: [
            '1',
            [Validators.required, bigNumberValidatorPositiveReal],
          ],
          secondVariableValue: [
            '1',
            [Validators.required, bigNumberValidatorPositiveReal],
          ],
        });
        break;
      case FunctionType.LAGUERRE_POLYNOMIAL:
        this.form = this.formBuilder.group({
          orderValue: ['1', [Validators.required, bigNumberValidatorNatural]],
          variableValue: ['0', [Validators.required, bigNumberValidatorReal]],
        });
        break;
      case FunctionType.LEGENDRE_POLYNOMIAL:
        this.form = this.formBuilder.group({
          orderValue: ['1', [Validators.required, bigNumberValidatorNatural]],
          variableValue: [
            '0',
            [Validators.required, bigNumberValidatorLegendre],
          ],
        });
        break;
      case FunctionType.CHEBYSHEV_FIRST_KIND:
      case FunctionType.CHEBYSHEV_SECOND_KIND:
        this.form = this.formBuilder.group({
          orderValue: ['1', [Validators.required, bigNumberValidatorNatural]],
          variableValue: [
            '0',
            [Validators.required, bigNumberValidatorConstrained],
          ],
        });
        break;
      case FunctionType.HERMITE_PHYSICIST:
      case FunctionType.HERMITE_PROBABILISTIC:
        this.form = this.formBuilder.group({
          orderValue: ['0', [Validators.required, bigNumberValidatorN0]],
          variableValue: ['0', [Validators.required, bigNumberValidatorReal]],
        });
        break;
      case FunctionType.JACOBI_POLYNOMIAL:
        this.form = this.formBuilder.group({
          orderValue: ['1', [Validators.required, bigNumberValidatorNatural]],
          variableValue: [
            '0',
            [Validators.required, bigNumberValidatorLegendre],
          ],
          aParameterValue: [
            '0',
            [Validators.required, bigNumberValidatorForParams],
          ],
          bParameterValue: [
            '0',
            [Validators.required, bigNumberValidatorForParams],
          ],
        });
        break;
      default:
        this.form = this.formBuilder.group({
          orderValue: ['1', [Validators.required, bigNumberValidatorNatural]],
          precisionValue: [
            '1e-64',
            [Validators.required, bigNumberValidatorForPrecision],
          ],
          variableValue: ['0', [Validators.required, bigNumberValidatorReal]],
        });
        break;
    }
  }

  loadTranslations() {
    const selectedLanguage = this.languageService.getSelectedLanguage();
    this.http
      .get(`./assets/i18n/${selectedLanguage}.json`)
      .subscribe((translations: any) => {
        this.labelOrderNatural = translations.input.labelOrderNatural;
        this.labelOrderReal = translations.input.labelOrderReal;
        this.labelOrderNonNegative = translations.input.labelOrderNonNegative;
        this.labelPrecision = translations.input.labelPrecision;
        this.labelVariable = translations.input.labelVariable;
        this.labelVariableConstrained =
          translations.input.labelVariableConstrained;
        this.labelVariableLegendre = translations.input.labelVariableLegendre;
        this.labelVariableN0 = translations.input.labelVariableN0;
        this.errorMessage = translations.input.errorMessage;
        this.aInputLabel = translations.input.aInputLabel;
        this.bInputLabel = translations.input.bInputLabel;

        this.labelVariableRealPositive =
          translations.input.labelVariableRealPositive;

        this.basicInformationsLabel =
          translations.input.buttonBasicInformations;
        this.useCalculatedValueLabel =
          translations.input.buttonUseCalculatedValue;
        this.calculateAndDrawLabel =
          translations.input.buttonCalculateAndDrawGraph;
        this.clearLabel = translations.input.clear;
        this.calculatorTooltip = translations.tooltips.calculator;

        this.loadInputTranslations();
      });
  }

  loadInputTranslations() {
    this.orderInputReal.label = this.labelOrderReal;
    this.orderInputReal.error = this.errorMessage;

    this.orderInputNatural.label = this.labelOrderNatural;
    this.orderInputNatural.error = this.errorMessage;

    this.orderInputNonNegative.label = this.labelOrderNonNegative;
    this.orderInputNonNegative.error = this.errorMessage;

    this.precisionInput.label = this.labelPrecision;
    this.precisionInput.error = this.errorMessage;

    this.variableInput.label = this.labelVariable;
    this.variableInput.error = this.errorMessage;

    this.aInput.label = this.aInputLabel;
    this.aInput.error = this.errorMessage;

    this.bInput.label = this.bInputLabel;
    this.bInput.error = this.errorMessage;

    this.variableInputConstrained.label = this.labelVariableConstrained;
    this.variableInputConstrained.error = this.errorMessage;

    this.variableInputLegendre.label = this.labelVariableLegendre;
    this.variableInputLegendre.error = this.errorMessage;

    this.variableInputN0.label = this.labelVariableN0;
    this.variableInputN0.error = this.errorMessage;

    this.variableRealPositive.label = this.labelVariableRealPositive;
    this.variableRealPositive.error = this.errorMessage;

    this.secondVariableInput.label = this.labelVariableRealPositive;
    this.secondVariableInput.error = this.errorMessage;
  }

  assignInput() {
    switch (this.parameter) {
      case FunctionType.BESSEL_FIRST_KIND:
        this.inputs = [
          this.orderInputNatural,
          this.precisionInput,
          this.variableInput,
        ];
        break;
      case FunctionType.GAMMA:
        this.inputs = [this.variableRealPositive];
        break;
      case FunctionType.BETA:
        this.inputs = [this.variableRealPositive, this.secondVariableInput];
        break;
      case FunctionType.LAGUERRE_POLYNOMIAL:
        this.inputs = [this.orderInputNatural, this.variableInput];
        break;
      case FunctionType.HERMITE_PHYSICIST:
      case FunctionType.HERMITE_PROBABILISTIC:
        this.inputs = [this.orderInputNonNegative, this.variableInput];
        break;
      case FunctionType.LEGENDRE_POLYNOMIAL:
        this.inputs = [this.orderInputNatural, this.variableInputLegendre];
        break;
      case FunctionType.CHEBYSHEV_FIRST_KIND:
      case FunctionType.CHEBYSHEV_SECOND_KIND:
        this.inputs = [this.orderInputNatural, this.variableInputConstrained];
        break;
      case FunctionType.JACOBI_POLYNOMIAL:
        this.inputs = [
          this.orderInputNatural,
          this.variableInputLegendre,
          this.aInput,
          this.bInput,
        ];
        break;
      default:
        this.inputs = [
          this.orderInputNatural,
          this.precisionInput,
          this.variableInput,
        ];
        break;
    }
  }

  clearContent() {
    this.resetFormToInitialValues();
    this.formValuesChanged.emit(null);
  }

  private resetFormToInitialValues() {
    switch (this.parameter) {
      case FunctionType.BESSEL_FIRST_KIND:
        this.form.get('orderValue')?.setValue('1');
        this.form.get('precisionValue')?.setValue('1e-64');
        this.form.get('variableValue')?.setValue('0');
        break;
      case FunctionType.GAMMA:
        this.form.get('variableValue')?.setValue('0');
        break;
      case FunctionType.BETA:
        this.form.get('variableValue')?.setValue('1');
        this.form.get('secondVariableValue')?.setValue('1');
        break;
      case FunctionType.LAGUERRE_POLYNOMIAL:
        this.form.get('orderValue')?.setValue('1');
        this.form.get('variableValue')?.setValue('0');
        break;
      case FunctionType.HERMITE_PHYSICIST:
      case FunctionType.HERMITE_PROBABILISTIC:
        this.form.get('orderValue')?.setValue('0');
        this.form.get('variableValue')?.setValue('0');
        break;
      case FunctionType.LEGENDRE_POLYNOMIAL:
      case FunctionType.CHEBYSHEV_FIRST_KIND:
      case FunctionType.CHEBYSHEV_SECOND_KIND:
        this.form.get('orderValue')?.setValue('0');
        this.form.get('variableValue')?.setValue('0');
        break;
      case FunctionType.JACOBI_POLYNOMIAL:
        this.form.get('orderValue')?.setValue('1');
        this.form.get('variableValue')?.setValue('0');
        this.form.get('aParameterValue')?.setValue('0');
        this.form.get('bParameterValue')?.setValue('0');
        break;
      default:
        this.form.get('orderValue')?.setValue('0');
        this.form.get('precisionValue')?.setValue('1e-64');
        this.form.get('variableValue')?.setValue('0');
        break;
    }
  }
}

interface IInput {
  label: string;
  formControlName: string;
  isInvalid: string;
  error: string;
  inputType: InputType;
}

import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import {
  brackets,
  digits,
  hyperbolic,
  MULTIPLY_SIGN_ASCII_CODE,
  operators,
  operators2,
  trigonometry,
  unaryOps1,
  unaryOps2,
} from 'src/app/data/calculatorSymbols';
import { Keys } from 'src/app/models/enums';
import {
  CalculatorService,
  INVALID_EXPRESSION,
} from 'src/app/services/calculator/calculatorService';
import { ISymbol } from 'src/app/models/symbol';
import { getE, getPi } from 'src/utilities/utilities';

@Component({
  standalone: false,
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css'],
})
export class CalculatorComponent {
  public calculatorService = new CalculatorService();
  public digits = digits;
  public operators = operators;
  public operators2 = operators2;
  public trigonometry = trigonometry;
  public brackets = brackets;
  public unaryOps1 = unaryOps1;
  public unaryOps2 = unaryOps2;
  public hyperbolic = hyperbolic;
  public operator = '';

  @Output() calculated: EventEmitter<string> = new EventEmitter<string>();
  @Output() closed: EventEmitter<void> = new EventEmitter<void>();

  close(): void {
    this.closed.emit();
  }

  getLabel(symbol: ISymbol) {
    return symbol.label;
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    const key = event.key;
    const symbols = [...this.digits, Keys.DOT];
    const operations = ['+', '-', '*', '/'];

    switch (key) {
      case Keys.BACKSPACE:
        this.removeSymbol();
        break;

      case Keys.ENTER:
        this.calculate();
        break;

      case Keys.ESC:
        this.clear();
        break;

      case Keys.PERCENT:
        this.setOperator('percent');
        break;

      default:
        if (symbols.includes(key)) {
          this.addSymbol(key);
        } else if (operations.includes(key)) {
          this.setOperator(key);
        }
        break;
    }
  }

  /** wrapper methods */
  setOperator(operator: string): void {
    this.operator = operator;
    this.calculatorService.setOperator(operator);
  }

  getOperator(): string {
    if (this.operator === Keys.STAR) return MULTIPLY_SIGN_ASCII_CODE; // code for dot instead of star
    return this.operator;
  }

  addBracket(bracket: string): void {
    this.operator = bracket;
    this.calculatorService.addBracket(bracket === Keys.BRACKET_OPEN);
  }

  getExpression() {
    return this.calculatorService.getExpression();
  }

  clear(): any {
    return this.calculatorService.clear();
  }

  setRadians(): boolean {
    let switcher = !this.getRadians();
    return this.calculatorService.setRadians(switcher);
  }

  getRadians(): boolean {
    return this.calculatorService.radians;
  }

  addConstant(isConstantPi: boolean) {
    const value = isConstantPi ? getPi() : getE();
    this.calculatorService.addConstant(value.toString());
  }

  addSymbol(value: string): void {
    this.calculatorService.addSymbol(value, false);
  }

  removeSymbol(): void {
    this.calculatorService.removeSymbol();
  }

  calculate(): string {
    const result = this.calculatorService.evaluate();
    if (result !== INVALID_EXPRESSION) this.calculated.emit(result);

    return result;
  }
}

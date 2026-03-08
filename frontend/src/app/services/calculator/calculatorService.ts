import { BigNumber, MathType } from 'mathjs';
import { isOperator, isUnaryOperator } from 'src/app/data/calculatorSymbols';
import { BIG_NUMBER_CONSTANTS, math_64 } from 'src/utilities/big_numbers_math';
import { Stack } from 'src/utilities/stack';
import { getE, getPi, round } from 'src/utilities/utilities';
import { IExpression as ICalculatorService } from './ICalculatorService';
import { getPriority } from './operatorsPriorities';

/** This is for calculator component */
/** Does evaluation of expressions using BigMath */
export class CalculatorService implements ICalculatorService {
  expression: string;
  currentOperand: string = '';
  start: boolean = false;
  isOperandReal: boolean = false;
  radians: boolean = true;

  infix: string[] = [];

  constructor(private math = math_64) {
    this.expression = '';
  }

  evaluate(): string {
    if (this.currentOperand.length > 0) {
      this.infix.push(this.currentOperand);
      this.currentOperand = '';
    }

    // console.log('infix: ' + this.infix);

    const postfix = this.infixToPostfix();

    // console.log('postfix: ' + postfix);

    if (postfix === INVALID_EXPRESSION) return postfix;

    let result = this.evaluatePostfixExpression(postfix);

    const resMath = this.math.bignumber(result);
    if (
      Number(
        this.math.compare(this.math.abs(resMath), this.math.bignumber('1e-63'))
      ) <= 0
    )
      result = '0';

    this.infix = [];
    this.currentOperand = result;
    this.expression = result;
    this.start = false;
    this.isOperandReal = false;

    // console.log(this.expression);
    return result;
  }

  calculateBinaryOperation(
    op1: MathType,
    op2: MathType,
    operator: string
  ): MathType {
    let result: MathType = BIG_NUMBER_CONSTANTS.ZERO;
    switch (operator) {
      case '+':
        result = this.math.add(op1, op2);
        this.show(result);
        break;
      case '-':
        result = this.math.subtract(op1, op2);
        this.show(result);
        break;
      case '*':
        result = this.math.multiply(op1, op2);
        this.show(result);
        break;
      case '/':
        result = this.math.divide(op1, op2);
        this.show(result);
        break;
      case 'sqrty':
        // Calculate cur = 1 / currentOperand
        const cur: MathType = this.math.divide(BIG_NUMBER_CONSTANTS.ONE, op2);
        // Calculate previousOperand^(1/currentOperand)
        result = this.math.pow(op1, cur as BigNumber);
        this.show(result);
        break;
      case 'pow':
      case 'xy':
        result = this.math.pow(op1, op2 as BigNumber);
        this.show(result);
        break;
      case 'pow_2':
        result = this.math.pow(op1, BIG_NUMBER_CONSTANTS.TWO);
        this.show(result);
        break;
      case 'pow_3':
        result = this.math.pow(op1, BIG_NUMBER_CONSTANTS.TWO);
        this.show(result);
        break;
      case 'yx':
        result = this.math.pow(op2, op1 as BigNumber);
        this.show(result);
        break;
      case 'log':
        result = this.math.log(op1 as BigNumber, op2 as BigNumber);
        this.show(result);
        break;
    }
    return result;
  }

  calculateUnaryOperation(unaryOperator: string, operand: BigNumber): MathType {
    let add, sub: BigNumber;
    let result: MathType = BIG_NUMBER_CONSTANTS.ZERO;
    let rad: MathType = BIG_NUMBER_CONSTANTS.ZERO;
    let grad: MathType = this.math.divide(this.math.bignumber(180), getPi());

    // console.log(unaryOperator + ' ' + operand);

    switch (unaryOperator) {
      case 'invert_sign':
        result = this.math.multiply(-1, operand);
        break;
      case 'sqrt2':
        result = this.math.sqrt(operand);
        break;
      case 'sqrt3':
        result = this.math.pow(
          operand,
          this.math.divide(
            BIG_NUMBER_CONSTANTS.ONE,
            BIG_NUMBER_CONSTANTS.THREE
          ) as BigNumber
        );
        break;
      case 'ln':
        result = this.math.log(operand);
        break;
      case 'lg':
        result = this.math.log(operand, BIG_NUMBER_CONSTANTS.TEN);
        break;
      case 'lg2':
        result = this.math.log(operand, BIG_NUMBER_CONSTANTS.TWO);
        break;
      case 'pow_base_10':
        result = this.math.pow(BIG_NUMBER_CONSTANTS.TEN, operand);
        break;
      case 'pow_base_2':
        result = this.math.pow(BIG_NUMBER_CONSTANTS.TWO, operand);
        break;
      case 'pow_base_e':
        result = this.math.pow(getE(), operand);
        break;
      case 'pow':
        let step = this.math.bignumber(operand as BigNumber);
        result = this.math.pow(operand, step);
        break;
      case '1div':
        result = this.math.divide(1, operand);
        break;
      case 'sin':
        rad = this.radians ? operand : this.math.divide(operand, grad);
        result = this.math.sin(rad as BigNumber);
        break;
      case 'cos':
        rad = this.radians ? operand : this.math.divide(operand, grad);
        result = this.math.cos(rad as BigNumber);
        break;
      case 'tan':
        rad = this.radians ? operand : this.math.divide(operand, grad);
        result = this.math.tan(rad as BigNumber);
        break;
      case 'sinh':
        rad = this.radians ? operand : this.math.divide(operand, grad);
        sub = this.math.subtract(
          this.math.exp(rad as BigNumber),
          this.math.exp(this.math.unaryMinus(rad) as BigNumber)
        );
        result = this.math.divide(sub, BIG_NUMBER_CONSTANTS.TWO);
        break;
      case 'cosh':
        rad = this.radians ? operand : this.math.divide(operand, grad);

        add = this.math.add(
          this.math.exp(rad as BigNumber),
          this.math.exp(this.math.unaryMinus(rad) as BigNumber)
        );
        result = this.math.divide(add, BIG_NUMBER_CONSTANTS.TWO);
        break;
      case 'tanh':
        rad = this.radians ? operand : this.math.divide(operand, grad);

        add = this.math.add(
          this.math.exp(rad as BigNumber),
          this.math.exp(this.math.unaryMinus(rad) as BigNumber)
        );
        sub = this.math.subtract(
          this.math.exp(rad as BigNumber),
          this.math.exp(this.math.unaryMinus(rad) as BigNumber)
        );
        result = this.math.divide(sub, add);
        break;
      case 'asin':
        result = this.math.asin(operand);
        result = this.radians ? result : this.math.multiply(result, grad);
        break;
      case 'acos':
        result = this.math.acos(operand);
        result = this.radians ? result : this.math.multiply(result, grad);
        break;
      case 'atan':
        result = this.math.atan(operand);
        result = this.radians ? result : this.math.multiply(result, grad);
        break;
      case 'asinh':
        result = this.math.asinh(operand);
        result = this.radians ? result : this.math.multiply(result, grad);
        break;
      case 'acosh':
        result = this.math.acosh(operand);
        result = this.radians ? result : this.math.multiply(result, grad);
        break;
      case 'atanh':
        result = this.math.atanh(operand);
        result = this.radians ? result : this.math.multiply(result, grad);
        break;
      case 'rand':
        result = this.math.divide(this.math.random(), getE());
        break;
      case 'factorial':
        result = this.math.factorial(operand);
        break;
      case 'percent':
        result = this.math.divide(operand, 100);
        break;
      case 'ee':
        this.expression = operand.toExponential();
        break;
    }

    // this.start = true;

    this.show(result);
    return result;
  }

  getExpression(): string {
    return this.expression;
  }

  setRadians(switcher: boolean): boolean {
    this.radians = switcher;
    return this.radians;
  }

  /* only one level of brackets 
  and they can be set only if user set the operand first
  */
  addBracket(openBracket: boolean): void {
    if (openBracket) {
      this.infix.push('(');
      return;
    }

    this.infix.push(this.currentOperand);
    this.currentOperand = '';
    this.infix.push(')');
  }

  setOperator(operator: string): void {
    if (!isUnaryOperator(operator)) {
      // binary operator
      this.infix.push(this.currentOperand);
      this.currentOperand = '';
    }

    this.infix.push(operator);
    //  this.expression += operator;
    this.start = true;
  }

  addConstant(value: string): string {
    this.currentOperand = value;
    this.expression = value;
    return this.expression;
  }

  addSymbol(value: string, start: boolean): string {
    if (
      start ||
      this.start ||
      (this.isOperandReal == false && this.expression == '' && value != '.')
    ) {
      this.expression = '';
    }

    this.start = start;
    this.currentOperand += value;
    if (value == '.') {
      if (this.isOperandReal == true) {
        return this.expression;
      }
      this.isOperandReal = true;
    }

    this.expression += value;
    return this.expression;
  }

  removeSymbol(): void {
    let length = this.expression.length;
    let last_symbol = this.expression.substring(length - 1, length);
    if (last_symbol == '.') {
      this.isOperandReal = false;
    }
    this.expression = this.expression.slice(0, -1);

    if (this.currentOperand.length > 0)
      this.currentOperand = this.currentOperand.slice(0, -1);
  }

  show(value: MathType): string {
    this.expression = round(value.toString());
    return this.expression;
  }

  clear(): string {
    this.expression = '';

    this.isOperandReal = false;
    this.currentOperand = '';

    this.start = false;
    this.infix = [];
    return this.expression;
  }

  private infixToPostfix() {
    const stack = new Stack<string>();
    const postfix: string[] = [];
    let rank = 0;
    let i = 0;
    let next: string | undefined = this.infix[i++];
    let x: string;

    while (next) {
      if (!isOperator(next) && next != '(' && next != ')') {
        // operand
        postfix.push(next);
        // console.log(i + '. postfix: ' + postfix);
        rank = rank + 1;
      } else {
        if (isUnaryOperator(next)) {
          stack.push(next);
          // console.log(i + '. stack: ' + stack.join());
          rank = rank + getPriority(next).R;
        } else {
          while (
            !stack.isEmpty() &&
            getPriority(next).ipr <= getPriority(stack.top()).spr
          ) {
            x = stack.pop() ?? ''; // ?? because of pop return type can be undefined
            postfix.push(x);
            // console.log(i + '. postfix: ' + postfix);
            rank = rank + getPriority(x).R;

            if (rank < 1) {
              // console.log('rank<1: ' + rank);
              return INVALID_EXPRESSION;
            }
          } // end_while

          if (stack.isEmpty() || next != ')') {
            stack.push(next);
            // console.log(i + '. stack: ' + stack.join());
          } else {
            x = stack.pop() ?? '';
          }
        }
      }
      next = i < this.infix.length ? this.infix[i++] : undefined;
    }
    // console.log('first while finished');

    while (!stack.isEmpty()) {
      x = stack.pop() ?? '';
      postfix.push(x);
      // console.log(i + '. postfix: ' + postfix);
      rank = rank + getPriority(x).R;
    }

    if (rank != 1) {
      // console.log('rank!= 1: ' + rank);
      // console.log(i + ' postfix: ' + postfix);
      return INVALID_EXPRESSION;
    }
    return postfix;
  }

  private evaluatePostfixExpression(postfix: string[]): string {
    const stack = new Stack<string>();
    let i = 0;
    let x: string;
    let rez;

    while (i < postfix.length) {
      x = postfix[i++];
      if (!isOperator(x)) {
        // operand
        stack.push(x);
        //  console.log(i + '. ' + stack.join());
      } else {
        if (isUnaryOperator(x)) {
          if (stack.isEmpty()) return INVALID_EXPRESSION;
          const operand = this.math.bignumber(stack.pop());
          rez = this.calculateUnaryOperation(x, operand);
          stack.push(rez.toString());
          //  console.log(i + '. ' + stack.join());
        } else {
          // if it's not operand nor unary operator, it's binary operator
          if (stack.size() < 2) return INVALID_EXPRESSION;
          const operand2 = this.math.bignumber(stack.pop());
          const operand1 = this.math.bignumber(stack.pop());
          rez = this.calculateBinaryOperation(operand1, operand2, x);
          stack.push(rez.toString());
          //  console.log(i + '. ' + stack.join());
        }
      }
    } // end while

    rez = stack.pop() ?? INVALID_EXPRESSION;
    if (stack.isEmpty()) return rez;
    return INVALID_EXPRESSION;
  }
}

export const INVALID_EXPRESSION = 'ERROR: Invalid expression';

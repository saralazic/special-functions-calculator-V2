import * as math from 'mathjs';
import { BIG_NUMBER_CONSTANTS } from '../../utilities/big_numbers_math';
import { FunctionType } from '../../models/enums';
import {
  FunctionParamsForCalculation,
  FunctionParamsForCalculationWithBigNumbers,
  SpecialFunction,
} from './specialFunction';
import { factorial } from 'mathjs';

export class HermitePhysicist extends SpecialFunction {
  constructor() {
    super(FunctionType.HERMITE_PHYSICIST);
  }

  calculate(params: FunctionParamsForCalculation): number {
    const { alpha, x } = params;

    const alphaFactorial = factorial(alpha);

    let sum = 0;

    let k = 0,
      t,
      n2k,
      den;

    while (2 * k <= alpha) {
      n2k = alpha - 2 * k;
      den = factorial(k) * factorial(n2k);
      den = den * (-1) ** k;
      t = (2 * x) ** n2k / den;
      sum += t;
      k++;
    }

    return alphaFactorial * sum;
  }

  calculate64(params: FunctionParamsForCalculationWithBigNumbers): string {
    const { alpha, x } = this.stringToBigNumber(params);

    const alphaFactorial = this.math.factorial(alpha);

    const x2 = this.math.multiply(BIG_NUMBER_CONSTANTS.TWO, x);

    let sum: math.MathType = 0,
      k = 0,
      t,
      n2k,
      m,
      den;

    while (Number(this.math.compare(this.math.multiply(2, k), alpha)) <= 0) {
      n2k = this.math.subtract(
        alpha,
        this.math.multiply(BIG_NUMBER_CONSTANTS.TWO, k)
      );
      m = this.math.pow(-1, k);

      den = this.math.multiply(
        this.math.factorial(k),
        this.math.factorial(n2k as math.BigNumber)
      );

      t = this.math.multiply(m, this.math.pow(x2, n2k as math.BigNumber));
      t = this.math.divide(t, den);

      sum = this.math.add(sum, t);

      k++;
    }

    sum = this.math.multiply(alphaFactorial, sum);

    return sum.toString();
  }
}

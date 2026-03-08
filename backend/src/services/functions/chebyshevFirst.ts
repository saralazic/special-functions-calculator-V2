import { BigNumber, MathType } from 'mathjs';
import { FunctionType } from '../../models/enums';
import {
  FunctionParamsForCalculation,
  FunctionParamsForCalculationWithBigNumbers,
  SpecialFunction,
} from './specialFunction';

export class ChebyshevPolynomialOfFirstKind extends SpecialFunction {
  constructor() {
    super(FunctionType.CHEBYSHEV_FIRST_KIND);
  }

  calculate(params: FunctionParamsForCalculation): number {
    const { alpha, x } = params;

    return Math.cos(alpha * Math.acos(x));
  }

  calculate64(params: FunctionParamsForCalculationWithBigNumbers): string {
    const { alpha, x } = this.stringToBigNumber(params);

    let result: MathType = this.math.acos(x);
    result = this.math.multiply(result, alpha);
    result = this.math.cos(result as BigNumber);

    return result.toString();
  }
}

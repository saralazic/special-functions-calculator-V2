import { BigNumber, MathType } from 'mathjs';
import { FunctionType } from '../../models/enums';
import { BIG_NUMBER_CONSTANTS } from '../../utilities/big_numbers_math';
import {
  FunctionParamsForCalculation,
  FunctionParamsForCalculationWithBigNumbers,
  SpecialFunction,
} from './specialFunction';

export class ChebyshevPolynomialOfSecondKind extends SpecialFunction {
  constructor() {
    super(FunctionType.CHEBYSHEV_SECOND_KIND);
  }

  calculate(params: FunctionParamsForCalculation): number {
    const { alpha, x } = params;

    const arccosX = Math.acos(x);
    return Math.sin((alpha + 1) * arccosX) / Math.sin(arccosX);
  }

  calculate64(params: FunctionParamsForCalculationWithBigNumbers): string {
    const { alphaBig, xBig } = params;

    const alpha = this.math.bignumber(alphaBig);
    const arccosX = this.math.acos(this.math.bignumber(xBig));

    let result: MathType = this.math.add(alpha, BIG_NUMBER_CONSTANTS.ONE);
    result = this.math.multiply(result, arccosX);
    result = this.math.sin(result as BigNumber);

    result = this.math.divide(result, this.math.sin(arccosX));

    return result.toString();
  }
}

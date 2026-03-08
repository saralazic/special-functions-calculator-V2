import * as math from 'mathjs';
import { BIG_NUMBER_CONSTANTS } from '../../utilities/big_numbers_math';
import { FunctionType } from '../../models/enums';
import {
  FunctionParamsForCalculation,
  FunctionParamsForCalculationWithBigNumbers,
  SpecialFunction,
} from './specialFunction';
import { HermitePhysicist } from './hermitePhysicist';
import { initializeParams64 } from '../../utilities/utilities';

export class HermiteProbabilistic extends SpecialFunction {
  constructor(private hermitePhysicist = new HermitePhysicist()) {
    super(FunctionType.HERMITE_PROBABILISTIC);
  }

  calculate(params: FunctionParamsForCalculation): number {
    let { alpha, x } = params;
    alpha = alpha ?? 0;

    const xPhy = x / 2 ** 0.5;

    const yPhy = this.hermitePhysicist.calculate({
      alpha: params.alpha,
      x: xPhy,
      eps: params.eps,
      a: 0,
      b: 0,
      y: 0,
    });

    const factor = 2 ** (-alpha / 2);

    return factor * yPhy;
  }

  calculate64(params: FunctionParamsForCalculationWithBigNumbers): string {
    const { alpha, x } = this.stringToBigNumber(params);

    const sqrt2 = this.math.sqrt(BIG_NUMBER_CONSTANTS.TWO);
    const xPhy = this.math.divide(x, sqrt2);

    const yPhy = this.hermitePhysicist.calculate64({
      ...initializeParams64(),
      alphaBig: params.alphaBig,
      xBig: xPhy.toString(),
      epsBig: params.epsBig,
    });

    const factor = this.math.pow(
      BIG_NUMBER_CONSTANTS.TWO,
      this.math.divide(
        this.math.unaryMinus(alpha),
        BIG_NUMBER_CONSTANTS.TWO
      ) as math.BigNumber
    );

    const solution = this.math.multiply(this.math.bignumber(yPhy), factor);

    return solution.toString();
  }
}

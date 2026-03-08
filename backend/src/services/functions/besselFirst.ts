import { BigNumber } from 'mathjs';
import { BIG_NUMBER_CONSTANTS } from '../../utilities/big_numbers_math';
import { initializeParams64 } from '../../utilities/utilities';
import { FunctionType } from '../../models/enums';
import { GammaFunction } from './gamma';
import {
  FunctionParamsForCalculation,
  FunctionParamsForCalculationWithBigNumbers,
  SpecialFunction,
} from './specialFunction';

export class BesselFirstKind extends SpecialFunction {
  constructor(private gamma = new GammaFunction()) {
    super(FunctionType.BESSEL_FIRST_KIND);
  }

  calculate(params: FunctionParamsForCalculation): number {
    const { alpha, x } = params;
    const eps: number = params.eps ?? 10 ** -15;

    const xHalf = x / 2.0;
    const xHalfSqr = xHalf ** 2;

    let gammaArg = alpha + 1.0;
    let gammaCurrent: number = this.math.gamma(gammaArg);

    let t = xHalf ** alpha / gammaCurrent;
    let sum = t;

    let gammaPrevious: number;
    let R: number;

    for (let m = 1; this.math.abs(t / sum) > eps; m++) {
      gammaPrevious = gammaCurrent;

      gammaArg += 1;
      gammaCurrent = this.math.gamma(gammaArg);
      R = -(xHalfSqr * gammaPrevious) / (m * gammaCurrent);
      t *= R;
      sum += t;
    }

    return sum;
  }

  calculate64(params: FunctionParamsForCalculationWithBigNumbers): string {
    const { alpha, x, eps } = this.stringToBigNumber(params);

    let gammaArg = this.math.add(alpha, BIG_NUMBER_CONSTANTS.ONE);
    let gammaCurrent = this.calculateGamma64(gammaArg);

    const xHalf = this.math.divide(x, BIG_NUMBER_CONSTANTS.TWO);
    const xHalfSqr = this.math.pow(xHalf, BIG_NUMBER_CONSTANTS.TWO);

    const xHalfPowered = this.math.pow(xHalf, alpha);

    let t = this.math.divide(xHalfPowered, gammaCurrent);
    let sum = t;

    let gammaPrevious;
    let R;

    for (
      let m = 1;
      Number(this.math.compare(this.math.abs(this.math.divide(t, sum)), eps)) >
      0;
      m++
    ) {
      gammaPrevious = gammaCurrent;

      gammaArg = this.math.add(gammaArg, BIG_NUMBER_CONSTANTS.ONE);
      gammaCurrent = this.calculateGamma64(gammaArg);

      R = this.math.divide(gammaPrevious, gammaCurrent);
      R = this.math.multiply(R, xHalfSqr);
      R = this.math.divide(R, m);
      R = this.math.unaryMinus(R);

      t = this.math.multiply(R, t);
      sum = this.math.add(t, sum);
    }

    return sum.toString();
  }

  private calculateGamma64(x: BigNumber): BigNumber {
    return this.math.bignumber(
      this.gamma.calculate64({
        ...initializeParams64(),
        xBig: x.toString(),
      })
    );
  }
}

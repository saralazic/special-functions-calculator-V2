import { BigNumber, MathType } from 'mathjs';
import { FunctionType } from '../../models/enums';
import { BIG_NUMBER_CONSTANTS } from '../../utilities/big_numbers_math';
import {
  binomialCoefficient,
  binomialCoefficient64,
} from '../../utilities/utilities';
import {
  FunctionParamsForCalculation,
  FunctionParamsForCalculationWithBigNumbers,
  SpecialFunction,
} from './specialFunction';

export class JacobiPolynomial extends SpecialFunction {
  constructor() {
    super(FunctionType.JACOBI_POLYNOMIAL);
  }

  calculate(params: FunctionParamsForCalculation): number {
    let { alpha, x } = params;
    alpha = alpha ?? 0;
    const a = params.a ?? 0;
    const b = params.b ?? 0;

    let sum = 0;
    let t;

    for (let k = 0; k <= alpha; k++) {
      t = (x - 1) ** (alpha - k) * (1 + x) ** k;
      t *=
        binomialCoefficient(alpha + a, k) *
        binomialCoefficient(alpha + b, alpha - k);
      sum += t;
    }

    return sum / 2 ** alpha;
  }

  calculate64(params: FunctionParamsForCalculationWithBigNumbers): string {
    const { alpha, x, a, b } = this.stringToBigNumber(params);

    const xPlus1 = this.math.add(x, BIG_NUMBER_CONSTANTS.ONE);
    const xMinus1 = this.math.subtract(x, BIG_NUMBER_CONSTANTS.ONE);

    const alphaPlusA = this.math.add(alpha, a);
    const alphaPlusB = this.math.add(alpha, b);

    let sum = BIG_NUMBER_CONSTANTS.ZERO;

    let t1, t2, t, kBig: MathType;

    for (
      let k = 0;
      Number(this.math.compare(this.math.bignumber(k), alpha)) <= 0;
      k++
    ) {
      kBig = this.math.bignumber(k);
      const nk = this.math.subtract(alpha, kBig);
      const bca = binomialCoefficient64(alphaPlusA, kBig);
      const bcb = binomialCoefficient64(alphaPlusB, nk);
      const factorNK = this.math.pow(xMinus1, nk);
      const factorK = this.math.pow(xPlus1, kBig);
      t1 = this.math.multiply(bca, bcb);
      t2 = this.math.multiply(factorNK, factorK);
      t = this.math.multiply(t1, t2);
      sum = this.math.add(sum, t) as BigNumber;
    }

    const res = this.math.divide(
      sum,
      this.math.pow(BIG_NUMBER_CONSTANTS.TWO, alpha)
    );

    return res.toString();
  }
}

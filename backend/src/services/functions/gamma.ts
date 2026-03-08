import { BIG_NUMBER_CONSTANTS } from '../../utilities/big_numbers_math';
import { FunctionType } from '../../models/enums';
import { binomialCoefficient, factorial } from '../../utilities/utilities';
import {
  FunctionParamsForCalculation,
  FunctionParamsForCalculationWithBigNumbers,
  SpecialFunction,
} from './specialFunction';
import { BigNumber } from 'mathjs';

export class GammaFunction extends SpecialFunction {
  private n: number;
  private g: number;

  private B: BigNumber[][];
  private C: BigNumber[][];
  private D: BigNumber[][];
  private F: BigNumber[][];

  constructor(n?: number, g?: number) {
    super(FunctionType.GAMMA);

    this.n = n ?? 13;
    this.g = g ?? 13.144565;
    this.B = this.populateMatrixB();
    this.C = this.populateMatrixC();
    this.D = this.populateMatrixD();
    this.F = this.populateVectorF();
  }

  calculate(params: FunctionParamsForCalculation): number {
    let { x } = params;

    x--;

    let P = this.math.multiply(this.D, this.B);
    P = this.math.multiply(P, this.C);
    P = this.math.multiply(P, this.F);
    const vectorZ: BigNumber[] = this.populateVectorZ(this.math.bignumber(x));
    let R = this.math.multiply(vectorZ, P);

    let lnZP = this.math.log(R[0]);

    let r = x + 0.5 + this.g;

    const logGx = lnZP.toNumber() + (x + 0.5) * this.math.log(r) - r;

    return this.math.exp(logGx);
  }

  calculate64(params: FunctionParamsForCalculationWithBigNumbers): string {
    let { x } = this.stringToBigNumber(params);

    x = this.math.subtract(x, BIG_NUMBER_CONSTANTS.ONE);

    let P = this.math.multiply(this.D, this.B);
    P = this.math.multiply(P, this.C);
    P = this.math.multiply(P, this.F);

    const vectorZ: BigNumber[] = this.populateVectorZ(x);

    let R = this.math.multiply(vectorZ, P);

    let lnZP = this.math.log(R[0]);

    let xPlusHalf = this.math.add(x, this.math.bignumber(0.5));
    let t = this.math.add(xPlusHalf, this.math.bignumber(this.g));

    let t1 = this.math.multiply(xPlusHalf, this.math.log(t));

    let logGx = this.math.add(lnZP, t1);
    logGx = this.math.subtract(logGx, t);

    const Gx = this.math.exp(logGx as BigNumber);

    return Gx.toString();
  }

  private populateVectorZ(x: BigNumber): BigNumber[] {
    const vectorZ: BigNumber[] = [];
    vectorZ[0] = BIG_NUMBER_CONSTANTS.ONE;

    for (let i = 1; i < this.n; i++) {
      vectorZ[i] = this.math.divide(
        BIG_NUMBER_CONSTANTS.ONE,
        this.math.add(x, i)
      ) as BigNumber;
    }

    return vectorZ;
  }

  private populateMatrixB(): BigNumber[][] {
    const B: number[][] = [];

    for (let i = 0; i < this.n; i++) {
      B[i] = [];
      for (let j = 0; j < this.n; j++) {
        let factor = (i + j) & 1 ? -1 : 1;
        B[i][j] =
          i === 0
            ? 1
            : j >= i
            ? factor * binomialCoefficient(i + j - 1, j - i)
            : 0;
      }
    }
    return this.convertNumberMatrixToBigNumber(B);
  }

  private populateMatrixC(): BigNumber[][] {
    const C: number[][] = [];

    for (let i = 0; i < this.n; i++) {
      C[i] = [];
      for (let j = 0; j < this.n; j++) {
        C[i][j] =
          i === 0 && j === 0
            ? 0.5
            : j > i
            ? 0
            : this.calculateSumForCMatrix(i, j);
      }
    }
    return this.convertNumberMatrixToBigNumber(C);
  }

  private populateMatrixD(): BigNumber[][] {
    const D: BigNumber[][] = [];

    for (let i = 0; i < this.n; i++) {
      D[i] = new Array(this.n).fill(BIG_NUMBER_CONSTANTS.ZERO);
    }

    D[0][0] = BIG_NUMBER_CONSTANTS.ONE;
    D[1][1] = this.math.unaryMinus(BIG_NUMBER_CONSTANTS.ONE);
    for (let i = 2; i < this.n; i++) {
      D[i][i] = this.math.multiply(
        D[i - 1][i - 1],
        this.math.divide(
          this.math.bignumber(2 * (2 * i - 1)),
          this.math.bignumber(i - 1)
        )
      ) as BigNumber;
    }

    return D;
  }

  private populateVectorF(): BigNumber[][] {
    const F: BigNumber[][] = [];

    for (let i = 0; i < this.n; i++) {
      let t1 = this.math.exp(this.math.bignumber(i + this.g + 0.5));
      t1 = this.math.multiply(
        t1,
        this.math.bignumber(factorial(2 * i))
      ) as BigNumber;
      let t2 = this.math.pow(
        BIG_NUMBER_CONSTANTS.TWO,
        this.math.bignumber(2 * i - 1)
      );
      t2 = this.math.multiply(this.math.bignumber(factorial(i)), t2);
      t2 = this.math.multiply(
        t2,
        this.math.pow(
          this.math.bignumber(this.g + i + 0.5),
          this.math.bignumber(i + 0.5)
        )
      );
      F[i] = [this.math.divide(t1, t2) as BigNumber];
    }

    return F;
  }

  private calculateSumForCMatrix(i: number, j: number) {
    const factor = (i + j) & 1 ? -1 : 1;

    let sum = 0,
      t = 0;
    for (let k = 0; k <= i; k++) {
      t = binomialCoefficient(2 * i, 2 * k) * binomialCoefficient(k, k + j - i);
      sum += t;
    }
    return factor * sum;
  }

  private convertNumberMatrixToBigNumber(matrix: number[][]): BigNumber[][] {
    return matrix.map((row) => row.map((cell) => this.math.bignumber(cell)));
  }
}

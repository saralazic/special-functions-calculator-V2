import { math_64 } from '../../utilities/big_numbers_math';
import { FunctionType } from '../../models/enums';

export abstract class SpecialFunction {
  public math = math_64;
  public functionType: FunctionType;

  constructor(type: FunctionType) {
    this.functionType = type;
  }

  public abstract calculate64(
    params: FunctionParamsForCalculationWithBigNumbers
  ): string;

  public abstract calculate(params: FunctionParamsForCalculation): number;

  public stringToBigNumber(params: FunctionParamsForCalculationWithBigNumbers) {
    return {
      x: this.math.bignumber(params.xBig ?? '0'),
      y: this.math.bignumber(params.yBig ?? '0'),
      alpha: this.math.bignumber(params.alphaBig ?? '0'),
      eps: this.math.bignumber(params.epsBig ? params.epsBig : '1e-64'),
      a: this.math.bignumber(params.a ?? '0'),
      b: this.math.bignumber(params.b ?? '0'),
    };
  }
}

export interface FunctionParamsForCalculation {
  alpha: number;
  x: number;
  y: number;
  eps: number;
  a: number;
  b: number;
}

export interface FunctionParamsForCalculationWithBigNumbers {
  alphaBig?: string;
  xBig: string;
  yBig: string;
  epsBig: string;
  a: string;
  b: string;
}

export interface FunctionParams {
  real: FunctionParamsForCalculation;
  bignumber: FunctionParamsForCalculationWithBigNumbers;
}

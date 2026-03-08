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

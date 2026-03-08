import { BigNumber } from 'mathjs';
import { BesselFirstKind } from '../services/functions/besselFirst';
import { BetaFunction } from '../services/functions/beta';
import { ChebyshevPolynomialOfFirstKind } from '../services/functions/chebyshevFirst';
import { ChebyshevPolynomialOfSecondKind } from '../services/functions/chebyshevSecond';
import { GammaFunction } from '../services/functions/gamma';
import { HermitePhysicist } from '../services/functions/hermitePhysicist';
import { HermiteProbabilistic } from '../services/functions/hermiteProbabilistic';
import { JacobiPolynomial } from '../services/functions/jacobi';
import { LaguerrePolynomial } from '../services/functions/laguerre';
import { LegendrePolynomial } from '../services/functions/legendre';
import {
  FunctionParamsForCalculation,
  FunctionParamsForCalculationWithBigNumbers,
  SpecialFunction,
} from '../services/functions/specialFunction';
import { FunctionType } from '../models/enums';
import { BIG_NUMBER_CONSTANTS, math_64 } from './big_numbers_math';

export function factorial(n: number): number {
  if (n === 0 || n === 1) {
    return 1;
  }

  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }

  return result;
}

export function binomialCoefficient(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0) return 1;

  const den = factorial(k) * factorial(n - k);
  return factorial(n) / den;
}

export function binomialCoefficient64(n: BigNumber, k: BigNumber): BigNumber {
  if (k === BIG_NUMBER_CONSTANTS.ZERO) return BIG_NUMBER_CONSTANTS.ONE;

  const den = math_64.multiply(
    math_64.factorial(k),
    math_64.factorial(math_64.subtract(n, k))
  );

  return math_64.divide(math_64.factorial(n), den) as BigNumber;
}

export function createChosenFunction(parameter: string): SpecialFunction {
  let spef: SpecialFunction;
  switch (parameter) {
    case FunctionType.BESSEL_FIRST_KIND:
      spef = new BesselFirstKind();
      break;
    case FunctionType.GAMMA:
      spef = new GammaFunction();
      break;
    case FunctionType.BETA:
      spef = new BetaFunction();
      break;
    case FunctionType.LEGENDRE_POLYNOMIAL:
      spef = new LegendrePolynomial();
      break;
    case FunctionType.LAGUERRE_POLYNOMIAL:
      spef = new LaguerrePolynomial();
      break;
    case FunctionType.CHEBYSHEV_FIRST_KIND:
      spef = new ChebyshevPolynomialOfFirstKind();
      break;
    case FunctionType.CHEBYSHEV_SECOND_KIND:
      spef = new ChebyshevPolynomialOfSecondKind();
      break;
    case FunctionType.JACOBI_POLYNOMIAL:
      spef = new JacobiPolynomial();
      break;
    case FunctionType.HERMITE_PHYSICIST:
      spef = new HermitePhysicist();
      break;
    case FunctionType.HERMITE_PROBABILISTIC:
      spef = new HermiteProbabilistic();
      break;
    default:
      spef = new BesselFirstKind();
      break;
  }

  return spef;
}

export function generateCoordinates(
  parameter: string,
  spef: SpecialFunction,
  data: FunctionParamsForCalculation
) {
  const numParameters: number = 201;
  let startValue: number, endValue: number;

  const drawFullDomain =
    parameter === FunctionType.LEGENDRE_POLYNOMIAL ||
    parameter === FunctionType.CHEBYSHEV_FIRST_KIND ||
    parameter === FunctionType.CHEBYSHEV_SECOND_KIND ||
    parameter === FunctionType.JACOBI_POLYNOMIAL;

  const betaAndGama =
    parameter === FunctionType.GAMMA || parameter === FunctionType.BETA;

  startValue = drawFullDomain
    ? -0.999999
    : betaAndGama
    ? data.x - 2
    : data.x - 3;
  endValue = drawFullDomain ? 0.999999 : betaAndGama ? data.x + 2 : data.x + 3;

  if (parameter === FunctionType.GAMMA || parameter === FunctionType.BETA) {
    if (startValue < 1) {
      startValue = 0.05;
      endValue = 4.0000001;
    }
  }

  const step: number = (endValue - startValue) / (numParameters - 1);
  const xArr: number[] = Array.from(
    { length: numParameters },
    (_, index) => startValue + index * step
  );

  const yArr = xArr.map((x) => spef.calculate({ ...data, x: x }));

  return { xArr, yArr };
}

export function initializeParams(): FunctionParamsForCalculation {
  return {
    x: 0,
    y: 0,
    alpha: 0,
    a: 0,
    b: 0,
    eps: 1e-64,
  };
}

export function initializeParams64(): FunctionParamsForCalculationWithBigNumbers {
  return {
    xBig: '0',
    yBig: '0',
    alphaBig: '0',
    a: '0',
    b: '0',
    epsBig: '1e-64',
  };
}

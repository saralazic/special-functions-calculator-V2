import * as math from 'mathjs';
import { BigNumber, exp, MathType, multiply } from 'mathjs';
import * as Plotly from 'plotly.js-basic-dist';
import { BesselFirstKind } from 'src/app/services/functions/besselFirst';
import { BetaFunction } from 'src/app/services/functions/beta';
import { ChebyshevPolynomialOfFirstKind } from 'src/app/services/functions/chebyshevFirst';
import { ChebyshevPolynomialOfSecondKind } from 'src/app/services/functions/chebyshevSecond';
import { GammaFunction } from 'src/app/services/functions/gamma';
import { HermitePhysicist } from 'src/app/services/functions/hermitePhysicist';
import { HermiteProbabilistic } from 'src/app/services/functions/hermiteProbabilistic';
import { JacobiPolynomial } from 'src/app/services/functions/jacobi';
import { LaguerrePolynomial } from 'src/app/services/functions/laguerre';
import { LegendrePolynomial } from 'src/app/services/functions/legendre';
import {
  FunctionParamsForCalculation,
  FunctionParamsForCalculationWithBigNumbers,
  SpecialFunction,
} from 'src/app/services/functions/specialFunction';
import { FunctionType } from '../app/models/enums';
import { BIG_NUMBER_CONSTANTS, math_64 } from './big_numbers_math';

// factorial for natural numbers
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

// binomialCoefficient for natural numbers
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

export function drawGraph(
  element: HTMLElement,
  xCoordinates: number[],
  yCoordinates: number[],
  x: number,
  y: number
) {
  const functionGraph: Partial<Plotly.ScatterData> = {
    x: xCoordinates,
    y: yCoordinates,
    type: 'scatter',
    mode: 'lines+markers',
    marker: { size: 0.5 },
  };

  const calculatedValue: Partial<Plotly.ScatterData> = {
    x: [x],
    y: [y],
    mode: 'markers',
    type: 'scatter',
    marker: { size: 5, color: 'red' }, // Color for the specific spot
  };

  const layout: Partial<Plotly.Layout> = {
    title: { text: 'Graph' },
    xaxis: {
      title: { text: 'x' },
    },
    yaxis: {
      title: { text: 'f(x)' },
    },
    showlegend: false,
    margin: {
      r: 50,
      b: 50,
      t: 50,
    },
    hovermode: 'closest', // Show hover information for the closest data point
    autosize: false,
  };
  const data = [functionGraph, calculatedValue];

  Plotly.newPlot(element, data, layout);
}

export function loadTranslationForFunction(
  type: FunctionType,
  translations: any
): any {
  let fn: any;
  switch (type) {
    case FunctionType.BESSEL_FIRST_KIND:
      fn = translations.bessel_1;
      break;
    case FunctionType.BETA:
      fn = translations.beta;
      break;
    case FunctionType.GAMMA:
      fn = translations.gamma;
      break;
    case FunctionType.LEGENDRE_POLYNOMIAL:
      fn = translations.legendre;
      break;
    case FunctionType.LAGUERRE_POLYNOMIAL:
      fn = translations.laguerre;
      break;
    case FunctionType.CHEBYSHEV_FIRST_KIND:
      fn = translations.chebyshev_1;
      break;
    case FunctionType.CHEBYSHEV_SECOND_KIND:
      fn = translations.chebyshev_2;
      break;
    case FunctionType.JACOBI_POLYNOMIAL:
      fn = translations.jacobi;
      break;
    case FunctionType.HERMITE_PHYSICIST:
      fn = translations.hermite_1;
      break;
    case FunctionType.HERMITE_PROBABILISTIC:
      fn = translations.hermite_2;
      break;
    default:
      fn = translations.bessel_1;
      break;
  }

  return fn;
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

export function getE(): MathType {
  return math_64.exp(BIG_NUMBER_CONSTANTS.ONE);
}

export function getPi(): MathType {
  // const piValue: BigNumber = math.bignumber(
  //   '3.1415926535897932384626433832795028841971693993751058209749445923078164'
  // );
  const piHalf: BigNumber = math_64.acos(BIG_NUMBER_CONSTANTS.ZERO);
  return math_64.multiply(piHalf, BIG_NUMBER_CONSTANTS.TWO as BigNumber);
}

export function round(stringVal: string): string {
  if (stringVal.length > 60) {
    let lastchars = stringVal.slice(-4);
    if (
      lastchars[0] === 'e' &&
      lastchars[1] === '-' &&
      +lastchars.slice(2) >= 64
    ) {
      return '0';
    }
  }
  return stringVal;
}

export function checkIfBigNumberIsPrecision(value: string): boolean {
  const valueNumber = math_64.bignumber(value);
  const zero = BIG_NUMBER_CONSTANTS.ZERO;
  const one = BIG_NUMBER_CONSTANTS.ONE;

  return (
    Number(math.compare(valueNumber, zero)) > 0 &&
    Number(math.compare(valueNumber, one)) < 0
  );
}

/** parameters are declared as null or undefined only because in special function component 
 this members are not assigned in constructor, they are assigned in onInit
 so they will never be null or undefined actually */
export function generateCoordinates(
  parameter: string | null,
  spef: SpecialFunction | undefined,
  data: FunctionParamsForCalculation
) {
  const numParameters: number = 201;
  let startValue: number, endValue: number;

  /** For this three functions domain is (-1,1), for the rest I will use domain around x */
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

  const yArr = xArr.map((x) => spef?.calculate({ ...data, x: x }) ?? 0);

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

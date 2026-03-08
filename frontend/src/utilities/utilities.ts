import * as math from 'mathjs';
import { BigNumber, MathType } from 'mathjs';
import * as Plotly from 'plotly.js-basic-dist';
import { FunctionType } from '../app/models/enums';
import { BIG_NUMBER_CONSTANTS, math_64 } from './big_numbers_math';

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
    marker: { size: 5, color: 'red' },
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
    hovermode: 'closest',
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

export function getE(): MathType {
  return math_64.exp(BIG_NUMBER_CONSTANTS.ONE);
}

export function getPi(): MathType {
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

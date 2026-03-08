import { ISymbol } from '../models/symbol';
import _ from 'lodash';

export const digits: string[] = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
];

export const operators: ISymbol[] = [
  { symbol: '+', label: '&#43;' },
  { symbol: '-', label: '&minus;' },
  { symbol: '*', label: '&times;' },
  { symbol: '/', label: '&divide;' },
];

export const operators2: ISymbol[] = [
  { symbol: 'xy', label: 'x<sup>y</sup>' },
  { symbol: 'yx', label: 'y<sup>x</sup>' },
  { symbol: 'sqrty', label: '<sup class="small-sup">y</sup>&radic;x' },
  { symbol: 'log', label: 'log<sub>y</sub>x' },
];

export const trigonometry: ISymbol[] = [
  { symbol: 'sin', label: 'sin' },
  { symbol: 'cos', label: 'cos' },
  { symbol: 'tan', label: 'tg' },
  { symbol: 'asin', label: 'arcsin' },
  { symbol: 'acos', label: 'arccos' },
  { symbol: 'atan', label: 'arctg' },
];

export const brackets: ISymbol[] = [
  { symbol: '(', label: '(' },
  { symbol: ')', label: ')' },
];

export const unaryOps1: ISymbol[] = [
  { symbol: 'pow_2', label: 'x<sup>2</sup>' },
  { symbol: 'pow_3', label: 'x<sup>3</sup>' },
  { symbol: 'pow_base_e', label: 'e<sup>x</sup>' },
  {
    symbol: '1div',
    label: '<sup>1</sup>/<sub>x</sub>',
  },
  {
    symbol: 'sqrt2',
    label: `<sup><span [style.font-size]="'0.50em'">2</span></sup>&radic;x`,
  },
  {
    symbol: 'sqrt3',
    label: '<sup class="small-sup">3</sup>&radic;x',
  },
];

export const unaryOps2: ISymbol[] = [
  {
    symbol: 'pow_base_10',
    label: '10<sup>x</sup>',
  },
  {
    symbol: 'pow_base_2',
    label: '2<sup>x</sup>',
  },
  { symbol: 'factorial', label: 'x!' },
  { symbol: 'ln', label: 'ln' },
  { symbol: 'lg', label: 'log<sub>10</sub>' },
  { symbol: 'lg2', label: 'log<sub>2</sub>' },
];

export const hyperbolic: ISymbol[] = [
  { symbol: 'sinh', label: 'sh' },
  { symbol: 'cosh', label: 'ch' },
  { symbol: 'tanh', label: 'th' },
  { symbol: 'asinh', label: 'arsh' },
  { symbol: 'acosh', label: 'arch' },
  { symbol: 'atanh', label: 'arth' },
];

export const unaryOps = _.flatten([
  unaryOps1,
  unaryOps2,
  trigonometry,
  hyperbolic,
  { symbol: 'invert_sign', label: '&#177;' },
  { symbol: 'percent', label: '%' },
]);
export const unarySymbols = unaryOps.map((op) => op.symbol);

export const binaryOps = _.flatten([operators, operators2]);
export const binarySymbols = binaryOps.map((op) => op.symbol);

export const MULTIPLY_SIGN_ASCII_CODE = '&#215;';

export function isOperator(s: string): boolean {
  const operands = unarySymbols.concat(binarySymbols);

  const index = operands.indexOf(s);
  return index != -1;
}

export function isUnaryOperator(s: string): boolean {
  const index = unarySymbols.indexOf(s);
  return index !== -1;
}

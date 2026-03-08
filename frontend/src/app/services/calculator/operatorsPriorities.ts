import { isUnaryOperator, operators } from 'src/app/data/calculatorSymbols';

export interface IOperatorPriority {
  operators?: string[];
  ipr: number; // input priority
  spr: number; // output priority
  R: number; //rank
}
const operatorsPriorities = [
  {
    operators: ['+', '-'],
    ipr: 2,
    spr: 2,
    R: -1,
  },
  {
    operators: ['*', '/'],
    ipr: 3,
    spr: 3,
    R: -1,
  },
  {
    operators: ['^'],
    ipr: 5,
    spr: 4,
    R: -1,
  },
  {
    operators: ['('],
    ipr: 8,
    spr: 0,
    R: 0,
  },
  {
    operators: [')'],
    ipr: 1,
    spr: 0,
    R: 0,
  },
];

export function getPriority(s: string | undefined): IOperatorPriority {
  const empty = {
    operators: [],
    ipr: -1,
    spr: -1,
    R: 0,
  };

  const defBin = {
    ipr: 6,
    spr: 6,
    R: -1,
  };

  const defUn = {
    ipr: 7,
    spr: 7,
    R: 0, // rang is 1-N where N is number of operands needed for this operation
  };

  if (s === undefined) return empty;

  const priority = operatorsPriorities.find(
    (symbol) => !!symbol.operators.find((op) => op === s)
  );

  return priority ?? (isUnaryOperator(s) ? defUn : defBin);
}

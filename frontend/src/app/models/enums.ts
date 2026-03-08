export enum FunctionType {
  BESSEL_FIRST_KIND = 'bessel1',
  GAMMA = 'gamma',
  BETA = 'beta',
  LAGUERRE_POLYNOMIAL = 'laguerre',
  LEGENDRE_POLYNOMIAL = 'legendre',
  JACOBI_POLYNOMIAL = 'jacobi',
  CHEBYSHEV_FIRST_KIND = 'chebyshev1',
  CHEBYSHEV_SECOND_KIND = 'chebyshev2',
  HERMITE_PHYSICIST = 'hermite1',
  HERMITE_PROBABILISTIC = 'hermite2',
}

export enum InputType {
  VARIABLE,
  PRECISION,
  ORDER,
  ALPHA,
  BETA,
  SECOND_VARIABLE,
}

export enum Keys {
  BACKSPACE = 'Backspace',
  ENTER = 'Enter',
  ESC = 'Escape',
  DOT = '.',
  BRACKET_OPEN = '(',
  BRACKET_CLOSED = ')',
  PERCENT = '%',
  STAR = '*',
}

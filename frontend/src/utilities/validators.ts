import { AbstractControl, ValidationErrors } from '@angular/forms';
import { BIG_NUMBER_CONSTANTS, math_64 } from './big_numbers_math';
import { checkIfBigNumberIsPrecision } from './utilities';

export function bigNumberValidatorReal(
  control: AbstractControl
): ValidationErrors | null {
  const bigNumberRegex = /^[+-]?\d+(\.\d+)?([eE][+-]?\d+)?$/;
  if (control.value && !bigNumberRegex.test(control.value)) {
    return { invalidBigNumber: true };
  }
  return null;
}

export function bigNumberValidatorPositiveReal(
  control: AbstractControl
): ValidationErrors | null {
  const bigNumberRegex = /^[+-]?\d+(\.\d+)?([eE][+-]?\d+)?$/;
  if (control.value && !bigNumberRegex.test(control.value)) {
    return { invalidBigNumber: true };
  }

  let k = math_64.bignumber(control.value);
  if (!math_64.isPositive(k)) {
    return { invalidBigNumber: true };
  }

  return null;
}

export function bigNumberValidatorNatural(
  control: AbstractControl
): ValidationErrors | null {
  const bigNumberRegex = /^[+-]?\d+(\.\d+)?([eE][+-]?\d+)?$/;
  if (control.value && !bigNumberRegex.test(control.value)) {
    return { invalidBigNumber: true };
  }

  let nBig = math_64.bignumber(control.value);
  if (!(math_64.isInteger(nBig) && math_64.isPositive(nBig))) {
    return { invalidBigNumber: true };
  }

  return null;
}

export function bigNumberValidatorN0(
  control: AbstractControl
): ValidationErrors | null {
  const bigNumberRegex = /^[+-]?\d+(\.\d+)?([eE]-?\d+)?$/;
  if (control.value && !bigNumberRegex.test(control.value)) {
    return { invalidBigNumber: true };
  }

  let nBig = math_64.bignumber(control.value);
  if (!(math_64.isInteger(nBig) && !math_64.isNegative(nBig))) {
    return { invalidBigNumber: true };
  }

  return null;
}

export function bigNumberValidatorForParams(
  control: AbstractControl
): ValidationErrors | null {
  const bigNumberRegex = /^[+-]?\d+(\.\d+)?([eE][+-]?\d+)?$/;
  if (control.value && !bigNumberRegex.test(control.value)) {
    return { invalidBigNumber: true };
  }

  let k = math_64.bignumber(control.value);
  if (!(Number(math_64.compare(k, BIG_NUMBER_CONSTANTS.MINUS_ONE)) > 0)) {
    return { invalidBigNumber: true };
  }

  return null;
}

export function bigNumberValidatorConstrained(
  control: AbstractControl
): ValidationErrors | null {
  const bigNumberRegex = /^[+-]?\d+(\.\d+)?([eE][+-]?\d+)?$/;
  if (control.value && !bigNumberRegex.test(control.value)) {
    return { invalidBigNumber: true };
  }

  let k = math_64.bignumber(control.value);
  if (
    !(
      Number(math_64.compare(k, BIG_NUMBER_CONSTANTS.MINUS_ONE)) >= 0 &&
      Number(math_64.compare(k, BIG_NUMBER_CONSTANTS.ONE)) <= 0
    )
  ) {
    return { invalidBigNumber: true };
  }

  return null;
}

// same as Constrained excluding borders
export function bigNumberValidatorLegendre(
  control: AbstractControl
): ValidationErrors | null {
  const bigNumberRegex = /^[+-]?\d+(\.\d+)?([eE][+-]?\d+)?$/;
  if (control.value && !bigNumberRegex.test(control.value)) {
    return { invalidBigNumber: true };
  }

  let k = math_64.bignumber(control.value);
  if (
    !(
      Number(math_64.compare(k, BIG_NUMBER_CONSTANTS.MINUS_ONE)) > 0 &&
      Number(math_64.compare(k, BIG_NUMBER_CONSTANTS.ONE)) < 0
    )
  ) {
    return { invalidBigNumber: true };
  }

  return null;
}

export function bigNumberValidatorForPrecision(
  control: AbstractControl
): ValidationErrors | null {
  const precisionNumberRegex = /^-?\d+(\.\d+)?([eE]-?\d+)?$/;

  if (!control.value || !precisionNumberRegex.test(control.value)) {
    return { invalidPrecisionNumber: true };
  }

  if (!checkIfBigNumberIsPrecision(control.value)) {
    return { invalidPrecisionNumber: true };
  }

  return null;
}

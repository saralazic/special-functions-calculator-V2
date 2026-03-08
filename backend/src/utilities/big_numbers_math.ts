import { all, create } from 'mathjs';

export const math_64 = create(all, { number: 'BigNumber', precision: 64 });

export class BIG_NUMBER_CONSTANTS {
  public static ZERO = math_64.bignumber(0);
  public static ONE = math_64.bignumber(1);
  public static TWO = math_64.bignumber(2);
  public static THREE = math_64.bignumber(3);
  public static FOUR = math_64.bignumber(4);
  public static SIX = math_64.bignumber(6);
  public static SEVEN = math_64.bignumber(7);
  public static EIGHT = math_64.bignumber(8);
  public static TEN = math_64.bignumber(10);
  public static c12 = math_64.bignumber(12);
  public static c24 = math_64.bignumber(24);
  public static c30 = math_64.bignumber(30);
  public static c53 = math_64.bignumber(53);
  public static c210 = math_64.bignumber(210);
  public static MINUS_ONE = math_64.bignumber(-1);
}

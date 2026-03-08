import { FunctionType } from '../../models/enums';
import {
  initializeParams,
  initializeParams64,
} from '../../utilities/utilities';
import {
  FunctionParamsForCalculation,
  FunctionParamsForCalculationWithBigNumbers,
  SpecialFunction,
} from './specialFunction';
import { GammaFunction } from './gamma';

export class BetaFunction extends SpecialFunction {
  constructor(private gamma = new GammaFunction()) {
    super(FunctionType.BETA);
  }

  calculate(params: FunctionParamsForCalculation): number {
    const { x, y } = params;
    return (
      (this.gamma.calculate({ ...initializeParams(), x }) *
        this.gamma.calculate({ ...initializeParams(), x: y })) /
      this.gamma.calculate({ ...initializeParams(), x: x + y })
    );
  }

  calculate64(params: FunctionParamsForCalculationWithBigNumbers): string {
    const { x, y } = this.stringToBigNumber(params);

    const Gx = this.math.bignumber(
      this.gamma.calculate64({
        ...initializeParams64(),
        xBig: x.toString(),
      })
    );

    const Gy = this.math.bignumber(
      this.gamma.calculate64({
        ...initializeParams64(),
        xBig: y.toString(),
      })
    );

    const Gxy = this.math.bignumber(
      this.gamma.calculate64({
        ...initializeParams64(),
        xBig: this.math.add(x, y).toString(),
      })
    );

    const mul = this.math.multiply(Gx, Gy);

    return this.math.divide(mul, Gxy).toString();
  }
}

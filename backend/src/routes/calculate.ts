import { Router, Request, Response } from 'express';
import {
  createChosenFunction,
  generateCoordinates,
} from '../utilities/utilities';
import {
  FunctionParamsForCalculation,
  FunctionParamsForCalculationWithBigNumbers,
} from '../services/functions/specialFunction';

export const calculateRouter = Router();

/**
 * POST /api/calculate
 *
 * Computes the special function value (standard + 64-digit precision)
 * and generates graph coordinates in a single request.
 */
calculateRouter.post('/calculate', (req: Request, res: Response) => {
  try {
    const { functionType, params, paramsReal } = req.body as {
      functionType: string;
      params: FunctionParamsForCalculationWithBigNumbers;
      paramsReal: FunctionParamsForCalculation;
    };

    if (!functionType || !params || !paramsReal) {
      res.status(400).json({ error: 'Missing required fields: functionType, params, paramsReal' });
      return;
    }

    const spef = createChosenFunction(functionType);

    const result64 = spef.calculate64(params);
    const resultReal = spef.calculate(paramsReal);
    const coordinates = generateCoordinates(functionType, spef, paramsReal);

    res.json({
      result64,
      resultReal,
      coordinates: {
        xArr: coordinates.xArr,
        yArr: coordinates.yArr,
      },
    });
  } catch (err: any) {
    console.error('Calculation error:', err);
    res.status(500).json({ error: err.message || 'Calculation failed' });
  }
});

/**
 * GET /api/health
 */
calculateRouter.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  FunctionParamsForCalculation,
  FunctionParamsForCalculationWithBigNumbers,
} from '../functions/specialFunction';

export interface CalculateResponse {
  result64: string;
  resultReal: number;
  coordinates: {
    xArr: number[];
    yArr: number[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = '/api';

  constructor(private http: HttpClient) {}

  calculate(
    functionType: string,
    params: FunctionParamsForCalculationWithBigNumbers,
    paramsReal: FunctionParamsForCalculation
  ): Observable<CalculateResponse> {
    return this.http.post<CalculateResponse>(`${this.baseUrl}/calculate`, {
      functionType,
      params,
      paramsReal,
    });
  }
}

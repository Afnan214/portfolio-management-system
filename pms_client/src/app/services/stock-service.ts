import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StockSelector } from '../components/stock-selector/stock-selector';
import { Observable } from 'rxjs';

export interface StockQuote {
  symbol: string;
  currentPrice: number;
  change: number;
  percentChange: number;
  highPrice: number;
  lowPrice: number;
  openPrice: number;
  previousClose: number;
  updatedAt: Date;
}

@Injectable({ providedIn: 'root' })
export class StockService {
  constructor(private httpClient: HttpClient) {}
  private readonly apiUrl = 'http://localhost:8080/api/stocks';

  getStocks(): Observable<StockQuote[]> {
    return this.httpClient.get<StockQuote[]>(`${this.apiUrl}`);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export enum Side {
  BUY = 'BUY',
  SELL = 'SELL',
}
export interface CreateTradeRequest {
  symbol: string;
  side: Side;
  quantity: number;
  pricePerShare: number;
}
export interface TradeStockResponse {
  companyName: string;
  id: number;
  industry: string;
  sector: string;
  symbol: string;
}
export interface TradeResponse {
  id: number;
  symbol: string;
  side: Side;
  stock: TradeStockResponse;
  quantity: number;
  pricePerShare: number;
  totalAmount: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class TradeService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/portfolios';

  createTrade(payload: CreateTradeRequest, id: number): Observable<TradeResponse> {
    return this.http.post<TradeResponse>(`${this.apiUrl}/${id}/trades`, payload, {
      withCredentials: true,
    });
  }
  getTradesByPortfolioId(id: number): Observable<TradeResponse[]> {
    return this.http.get<TradeResponse[]>(`${this.apiUrl}/${id}/trades`);
  }
  getTradeById(id: Number): Observable<TradeResponse> {
    return this.http.get<TradeResponse>(`${this.apiUrl}/${id}`);
  }
  getTradesByUserId(userId: number): Observable<TradeResponse[]> {
    return this.http.get<TradeResponse[]>(`${this.apiUrl}`);
  }
}

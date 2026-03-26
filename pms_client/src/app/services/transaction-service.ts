import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export enum TransactionType {
  BUY_STOCK = 'BUY_STOCK',
  SELL_STOCK = 'SELL_STOCK',
  WITHDRAWAL = 'WITHDRAWAL',
  ADD_FUNDS = 'ADD_FUNDS',
}

export interface TransactionResponse {
  id: number;
  portfolioId: number;
  amount: number;
  type: TransactionType;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/transactions';

  getTransactionsByUserId(userId: number): Observable<TransactionResponse[]> {
    console.log(`Fetching transactions for user ID: ${userId}`);
    return this.http.get<TransactionResponse[]>(`${this.apiUrl}/user/${userId}`);
  }
}

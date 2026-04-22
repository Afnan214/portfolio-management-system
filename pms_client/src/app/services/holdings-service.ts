import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HoldingResponse {
    id: number;
    quantity: number;
    averageCostBasis: number;
    totalCostBasis: number;
    stock: {
        id: number;
        symbol: string;
        companyName?: string;
        currentPrice?: number;
    };
}

@Injectable({ providedIn: 'root' })
export class HoldingService {
    constructor(private httpClient: HttpClient) { }
    apiUrl: string = 'http://localhost:8080/api/portfolios'
    getHoldingsByPortfolioId(id: number): Observable<HoldingResponse[]> {
        return this.httpClient.get<HoldingResponse[]>(`${this.apiUrl}/${id}/holdings`);
    }
}
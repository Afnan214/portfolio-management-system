import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CurrentUser } from '../../auth/auth-service';

export interface CreatePortfolioRequest {
  name: string;
  cashBalance: number;
  isDefault: boolean;
}

export interface PortfolioResponse {
  id: number;
  name: string;
  cashBalance: number;
  isDefault: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PortfolioService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/portfolios';

  createPortfolio(payload: CreatePortfolioRequest): Observable<PortfolioResponse> {
    return this.http.post<PortfolioResponse>(this.apiUrl, payload, {
      withCredentials: true,
    });
  }
  getPortfolioById(id: Number): Observable<PortfolioResponse> {
    return this.http.get<PortfolioResponse>(`${this.apiUrl}/${id}`);
  }
  getPortfoliosByUserId(userId: number): Observable<PortfolioResponse[]> {
    return this.http.get<PortfolioResponse[]>(`${this.apiUrl}`);
  }
}

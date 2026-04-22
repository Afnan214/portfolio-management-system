import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MarketNews {
  id: number;
  category: string;
  datetime: number;
  headline: string;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class MarketNewsService {
  private readonly apiUrl = 'http://localhost:8080/api/market-news';

  constructor(private httpClient: HttpClient) {}

  getMarketNews(): Observable<MarketNews[]> {
    return this.httpClient.get<MarketNews[]>(this.apiUrl);
  }
}

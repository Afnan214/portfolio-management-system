import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface CreateWatchlistRequest {
  name: string;
  description: string | null;
  isDefault: boolean;
}

export interface UpdateWatchlistRequest {
  name: string;
  description: string | null;
  isDefault: boolean;
}

export interface WatchlistResponse {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  isDefault: boolean;
  stockIds: number[];
  createdAt: Date;
  updatedAt: Date;
}

type WatchlistApiResponse = Omit<WatchlistResponse, 'createdAt' | 'updatedAt'> & {
  createdAt: string | Date;
  updatedAt: string | Date;
};

@Injectable({
  providedIn: 'root',
})
export class WatchlistService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/watchlists';

  getWatchlists(): Observable<WatchlistResponse[]> {
    return this.http
      .get<WatchlistApiResponse[]>(this.apiUrl)
      .pipe(map((watchlists) => watchlists.map((watchlist) => this.normalizeWatchlist(watchlist))));
  }

  getDefaultWatchlist(): Observable<WatchlistResponse> {
    return this.http
      .get<WatchlistApiResponse>(`${this.apiUrl}/default`)
      .pipe(map((watchlist) => this.normalizeWatchlist(watchlist)));
  }

  getWatchlistById(id: number): Observable<WatchlistResponse> {
    return this.http
      .get<WatchlistApiResponse>(`${this.apiUrl}/${id}`)
      .pipe(map((watchlist) => this.normalizeWatchlist(watchlist)));
  }

  createWatchlist(payload: CreateWatchlistRequest): Observable<WatchlistResponse> {
    return this.http
      .post<WatchlistApiResponse>(this.apiUrl, payload)
      .pipe(map((watchlist) => this.normalizeWatchlist(watchlist)));
  }

  updateWatchlist(id: number, payload: UpdateWatchlistRequest): Observable<WatchlistResponse> {
    return this.http
      .put<WatchlistApiResponse>(`${this.apiUrl}/${id}`, payload)
      .pipe(map((watchlist) => this.normalizeWatchlist(watchlist)));
  }

  addStockToWatchlist(id: number, stockId: number): Observable<WatchlistResponse> {
    return this.http
      .post<WatchlistApiResponse>(`${this.apiUrl}/${id}/stocks/${stockId}`, null)
      .pipe(map((watchlist) => this.normalizeWatchlist(watchlist)));
  }

  removeStockFromWatchlist(id: number, stockId: number): Observable<WatchlistResponse> {
    return this.http
      .delete<WatchlistApiResponse>(`${this.apiUrl}/${id}/stocks/${stockId}`)
      .pipe(map((watchlist) => this.normalizeWatchlist(watchlist)));
  }

  deleteWatchlist(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private normalizeWatchlist(watchlist: WatchlistApiResponse): WatchlistResponse {
    return {
      ...watchlist,
      createdAt: this.toDate(watchlist.createdAt),
      updatedAt: this.toDate(watchlist.updatedAt),
    };
  }

  private toDate(value: string | Date): Date {
    return value instanceof Date ? value : new Date(value);
  }
}

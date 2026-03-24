import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, merge, Observable, shareReplay } from 'rxjs';
import { SocketService } from './socket-service';

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

type StockQuoteResponse = Omit<StockQuote, 'updatedAt'> & {
  updatedAt: string | Date;
};

@Injectable({ providedIn: 'root' })
export class StockService {
  private readonly apiUrl = 'http://localhost:8080/api/stocks';
  private readonly stockQuotesTopic = '/topic/stock-quotes';
  private readonly liveStocks$: Observable<StockQuote[]>;

  constructor(
    private httpClient: HttpClient,
    private socketService: SocketService,
  ) {
    this.liveStocks$ = merge(
      this.getStocks(),
      this.socketService
        .watch<StockQuoteResponse[]>(this.stockQuotesTopic)
        .pipe(map((stocks) => this.normalizeQuotes(stocks))),
    ).pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  getStocks(): Observable<StockQuote[]> {
    return this.httpClient
      .get<StockQuoteResponse[]>(this.apiUrl)
      .pipe(map((stocks) => this.normalizeQuotes(stocks)));
  }

  getLiveStocks(): Observable<StockQuote[]> {
    return this.liveStocks$;
  }

  getLiveStocksBySymbols(symbols: string[]): Observable<StockQuote[]> {
    const allowedSymbols = new Set(symbols.map((symbol) => this.normalizeSymbol(symbol)));

    return this.getLiveStocks().pipe(
      map((stocks) =>
        stocks.filter((stock) => allowedSymbols.has(this.normalizeSymbol(stock.symbol))),
      ),
    );
  }

  getLiveStock(symbol: string): Observable<StockQuote | undefined> {
    const normalizedSymbol = this.normalizeSymbol(symbol);

    return this.getLiveStocks().pipe(
      map((stocks) =>
        stocks.find((stock) => this.normalizeSymbol(stock.symbol) === normalizedSymbol),
      ),
    );
  }

  private normalizeQuotes(stocks: StockQuoteResponse[]): StockQuote[] {
    return stocks.map((stock) => ({
      ...stock,
      updatedAt: new Date(stock.updatedAt),
    }));
  }

  private normalizeSymbol(symbol: string): string {
    return symbol.trim().toUpperCase();
  }
}

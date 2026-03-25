import { CommonModule, NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, NgZone, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {
  CircleAlert,
  Eye,
  LoaderCircle,
  LucideAngularModule,
  Plus,
  RefreshCcw,
  Star,
  Trash2,
  X,
} from 'lucide-angular';
import {
  map,
  Observable,
  Subject,
  catchError,
  finalize,
  of,
  startWith,
  switchMap,
  tap,
  timeout,
} from 'rxjs';

import { STOCK_DIRECTORY, STOCK_SYMBOL_BY_ID } from '../../constants/stock-directory';
import { StockQuote, StockService } from '../../services/stock-service';
import {
  CreateWatchlistRequest,
  WatchlistResponse,
  WatchlistService,
} from '../../services/watchlist-service';
import { StockSelector } from '../stock-selector/stock-selector';

export interface WatchlistStock extends StockQuote {
  stockId: number;
  name: string;
}

export interface WatchlistWithStocks extends WatchlistResponse {
  stocks: WatchlistStock[];
}

@Component({
  selector: 'app-watchlist-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, NgClass, StockSelector],
  templateUrl: './watchlist-panel.html',
  styleUrl: './watchlist-panel.css',
  host: {
    class: 'block h-full',
  },
})
export class WatchlistPanel implements OnInit {
  Eye = Eye;
  Plus = Plus;
  Trash2 = Trash2;
  RefreshCcw = RefreshCcw;
  LoaderCircle = LoaderCircle;
  CircleAlert = CircleAlert;
  Star = Star;
  X = X;

  readonly allSymbols = Object.keys(STOCK_DIRECTORY);

  watchlist: WatchlistWithStocks | null = null;
  selectedStock: StockQuote | null = null;
  isLoading = true;
  isMutating = false;
  errorMessage = '';
  hasAnyWatchlists = false;
  hasResolvedWatchlistExistence = false;
  showCreateWatchlistModal = false;
  newWatchlistName = '';
  newWatchlistDescription = '';

  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);
  private readonly reload$ = new Subject<void>();
  private readonly watchlistService = inject(WatchlistService);
  private readonly stockService = inject(StockService);

  ngOnInit(): void {
    this.reload$
      .pipe(
        startWith(void 0),
        tap(() =>
          this.syncView(() => {
            this.isLoading = true;
            this.errorMessage = '';
            this.hasResolvedWatchlistExistence = false;
          }),
        ),
        switchMap(() =>
          this.watchlistService.getWatchlists().pipe(
            timeout({ first: 8000 }),
            map((watchlists) => watchlists ?? []),
            tap((watchlists) =>
              this.syncView(() => {
                console.log('Watchlist API response:', watchlists);
                this.hasAnyWatchlists = watchlists.length > 0;
                this.hasResolvedWatchlistExistence = true;
              }),
            ),
            switchMap((watchlists) => this.loadPrimaryWatchlist(watchlists)),
            catchError((error) => {
              this.syncView(() => {
                console.error('Failed to load watch list', error);
                this.errorMessage = 'Unable to load your watch list right now.';
              });
              return of(null);
            }),
            finalize(() => {
              this.syncView(() => {
                this.isLoading = false;
                console.log('Watchlist loading complete ', this.isLoading);
              });
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((watchlist) =>
        this.syncView(() => {
          this.watchlist = watchlist;

          if (
            this.selectedStock &&
            !this.availableSymbols.includes(this.normalizeSymbol(this.selectedStock.symbol))
          ) {
            this.selectedStock = null;
          }
        }),
      );
  }

  get availableSymbols(): string[] {
    const selectedSymbols = new Set(
      (this.watchlist?.stockIds ?? [])
        .map((stockId) => STOCK_SYMBOL_BY_ID[stockId])
        .filter((symbol): symbol is string => Boolean(symbol)),
    );

    return this.allSymbols.filter((symbol) => !selectedSymbols.has(symbol));
  }

  refresh(): void {
    if (this.isMutating) {
      return;
    }

    this.reload$.next();
  }

  openCreateWatchlistModal(): void {
    if (this.isMutating) {
      return;
    }

    this.errorMessage = '';
    this.showCreateWatchlistModal = true;
  }

  closeCreateWatchlistModal(): void {
    if (this.isMutating) {
      return;
    }

    this.showCreateWatchlistModal = false;
    this.newWatchlistName = '';
    this.newWatchlistDescription = '';
    this.errorMessage = '';
  }

  createWatchlist(): void {
    const name = this.newWatchlistName.trim();
    const description = this.newWatchlistDescription.trim();

    if (!name || this.isMutating) {
      return;
    }

    const payload: CreateWatchlistRequest = {
      name,
      description: description || null,
      isDefault: true,
    };

    this.isMutating = true;
    this.errorMessage = '';

    this.watchlistService
      .createWatchlist(payload)
      .pipe(
        finalize(() => {
          this.isMutating = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.showCreateWatchlistModal = false;
          this.newWatchlistName = '';
          this.newWatchlistDescription = '';
          this.reload$.next();
        },
        error: (error) => {
          console.error('Failed to create watch list', error);
          this.errorMessage = 'Unable to create a watch list right now.';
        },
      });
  }

  addSelectedStock(): void {
    if (!this.watchlist || !this.selectedStock || this.isMutating) {
      return;
    }

    const symbol = this.normalizeSymbol(this.selectedStock.symbol);
    const stockId = STOCK_DIRECTORY[symbol]?.id;

    if (!stockId) {
      this.errorMessage = `Unable to add ${symbol} because its stock id is unavailable.`;
      return;
    }

    this.isMutating = true;
    this.errorMessage = '';

    this.watchlistService
      .addStockToWatchlist(this.watchlist.id, stockId)
      .pipe(
        finalize(() => {
          this.isMutating = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.selectedStock = null;
          this.reload$.next();
        },
        error: (error) => {
          console.error(`Failed to add ${symbol} to the watch list`, error);
          this.errorMessage = `Unable to add ${symbol} right now.`;
        },
      });
  }

  removeStock(stockId: number, symbol: string): void {
    if (!this.watchlist || this.isMutating) {
      return;
    }

    this.isMutating = true;
    this.errorMessage = '';

    this.watchlistService
      .removeStockFromWatchlist(this.watchlist.id, stockId)
      .pipe(
        finalize(() => {
          this.isMutating = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.reload$.next();
        },
        error: (error) => {
          console.error(`Failed to remove ${symbol} from the watch list`, error);
          this.errorMessage = `Unable to remove ${symbol} right now.`;
        },
      });
  }

  formatPriceChange(change: number): string {
    return `${change >= 0 ? '+' : '-'}$${Math.abs(change).toFixed(2)}`;
  }

  formatPercentChange(percentChange: number): string {
    return `${percentChange >= 0 ? '+' : '-'}${Math.abs(percentChange).toFixed(2)}%`;
  }

  getChangeTone(percentChange: number): string {
    return percentChange >= 0
      ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
      : 'bg-rose-50 text-rose-700 ring-rose-200';
  }

  private loadPrimaryWatchlist(
    watchlists: WatchlistResponse[],
  ): Observable<WatchlistWithStocks | null> {
    const watchlist = watchlists.find((candidate) => candidate.isDefault) ?? watchlists[0] ?? null;

    if (!watchlist) {
      return of(null);
    }

    if (watchlist.stockIds.length === 0) {
      return of({
        ...watchlist,
        stocks: [],
      });
    }

    return this.stockService.getStocks().pipe(
      timeout({ first: 8000 }),
      map((stocks) => ({
        ...watchlist,
        stocks: this.mapStocksForWatchlist(watchlist.stockIds, stocks),
      })),
    );
  }

  private mapStocksForWatchlist(stockIds: number[], stocks: StockQuote[]): WatchlistStock[] {
    const stocksBySymbol = new Map(
      stocks.map((stock) => [this.normalizeSymbol(stock.symbol), stock]),
    );

    return stockIds.flatMap((stockId) => {
      const symbol = STOCK_SYMBOL_BY_ID[stockId];

      if (!symbol) {
        return [];
      }

      const stockQuote = stocksBySymbol.get(this.normalizeSymbol(symbol));

      if (!stockQuote) {
        return [];
      }

      return [
        {
          ...stockQuote,
          stockId,
          name: STOCK_DIRECTORY[symbol]?.companyName ?? symbol,
        },
      ];
    });
  }

  private normalizeSymbol(symbol: string): string {
    return symbol.trim().toUpperCase();
  }

  private syncView(update: () => void): void {
    if (NgZone.isInAngularZone()) {
      update();
      return;
    }

    this.ngZone.run(() => {
      update();
      this.changeDetectorRef.detectChanges();
    });
  }
}

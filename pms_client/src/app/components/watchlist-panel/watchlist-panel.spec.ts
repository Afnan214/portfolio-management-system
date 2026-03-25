import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { StockService } from '../../services/stock-service';
import { WatchlistService } from '../../services/watchlist-service';
import { WatchlistPanel, WatchlistWithStocks } from './watchlist-panel';

describe('WatchlistPanel', () => {
  let component: WatchlistPanel;
  let fixture: ComponentFixture<WatchlistPanel>;

  const watchlist: WatchlistWithStocks = {
    id: 1,
    userId: 7,
    name: 'Core Names',
    description: 'Megacaps worth watching',
    isDefault: true,
    stockIds: [1],
    createdAt: new Date('2026-03-24T09:00:00Z'),
    updatedAt: new Date('2026-03-24T09:15:00Z'),
    stocks: [
      {
        stockId: 1,
        symbol: 'AAPL',
        name: 'Apple Inc.',
        currentPrice: 193.42,
        change: 2.14,
        percentChange: 1.12,
        highPrice: 195.0,
        lowPrice: 190.8,
        openPrice: 191.1,
        previousClose: 191.28,
        updatedAt: new Date('2026-03-24T09:15:00Z'),
      },
    ],
  };

  const microsoftQuote = {
    symbol: 'MSFT',
    currentPrice: 421.17,
    change: -1.43,
    percentChange: -0.34,
    highPrice: 425.0,
    lowPrice: 419.2,
    openPrice: 422.5,
    previousClose: 422.6,
    updatedAt: new Date('2026-03-24T09:15:00Z'),
  };

  let watchlistService: {
    getWatchlists: ReturnType<typeof vi.fn>;
    createWatchlist: ReturnType<typeof vi.fn>;
    addStockToWatchlist: ReturnType<typeof vi.fn>;
    removeStockFromWatchlist: ReturnType<typeof vi.fn>;
  };
  let stockService: {
    getStocks: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    watchlistService = {
      getWatchlists: vi.fn().mockReturnValue(
        of([
          {
            id: watchlist.id,
            userId: watchlist.userId,
            name: watchlist.name,
            description: watchlist.description,
            isDefault: watchlist.isDefault,
            stockIds: watchlist.stockIds,
            createdAt: watchlist.createdAt,
            updatedAt: watchlist.updatedAt,
          },
        ]),
      ),
      createWatchlist: vi.fn().mockReturnValue(
        of({
          id: 2,
          userId: 7,
          name: 'New Watch List',
          description: null,
          isDefault: true,
          stockIds: [],
          createdAt: new Date('2026-03-24T09:16:00Z'),
          updatedAt: new Date('2026-03-24T09:16:00Z'),
        }),
      ),
      addStockToWatchlist: vi.fn().mockReturnValue(of(watchlist)),
      removeStockFromWatchlist: vi.fn().mockReturnValue(of(watchlist)),
    };
    stockService = {
      getStocks: vi.fn().mockReturnValue(of([watchlist.stocks[0], microsoftQuote])),
    };

    await TestBed.configureTestingModule({
      imports: [WatchlistPanel],
      providers: [
        {
          provide: WatchlistService,
          useValue: watchlistService,
        },
        {
          provide: StockService,
          useValue: stockService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WatchlistPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should render the primary watch list stocks', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Core Names');
    expect(text).toContain('AAPL');
    expect(text).toContain('Apple Inc.');
  });

  it('should add the selected stock to the watch list', () => {
    component.selectedStock = microsoftQuote;

    component.addSelectedStock();

    expect(watchlistService.addStockToWatchlist).toHaveBeenCalledWith(1, 2);
  });

  it('should remove a stock from the watch list', () => {
    component.removeStock(1, 'AAPL');

    expect(watchlistService.removeStockFromWatchlist).toHaveBeenCalledWith(1, 1);
  });

  it('should show the create option when the user has no watchlists', async () => {
    watchlistService.getWatchlists.mockReturnValue(of([]));

    fixture = TestBed.createComponent(WatchlistPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Create Watch List');
  });

  it('should open the create watch list modal', () => {
    component.openCreateWatchlistModal();

    expect(component.showCreateWatchlistModal).toBe(true);
  });

  it('should create a watch list when none exist', () => {
    component.watchlist = null;
    component.hasAnyWatchlists = false;
    component.hasResolvedWatchlistExistence = true;
    component.showCreateWatchlistModal = true;
    component.newWatchlistName = 'New Watch List';
    component.newWatchlistDescription = 'Fresh ideas';

    component.createWatchlist();

    expect(watchlistService.createWatchlist).toHaveBeenCalledWith({
      name: 'New Watch List',
      description: 'Fresh ideas',
      isDefault: true,
    });
    expect(component.showCreateWatchlistModal).toBe(false);
  });
});

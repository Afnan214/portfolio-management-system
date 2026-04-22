import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { StockService } from '../../services/stock-service';
import { WatchlistService } from '../../services/watchlist-service';
import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let watchlistService: {
    getWatchlists: ReturnType<typeof vi.fn>;
  };
  let stockService: {
    getStocks: ReturnType<typeof vi.fn>;
  };

  const createComponent = async () => {
    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    watchlistService = {
      getWatchlists: vi.fn().mockReturnValue(of([])),
    };
    stockService = {
      getStocks: vi.fn().mockReturnValue(of([])),
    };

    await TestBed.configureTestingModule({
      imports: [Dashboard],
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
  });

  it('should create', async () => {
    await createComponent();

    expect(component).toBeTruthy();
  });

  it('should render the watchlist section', async () => {
    await createComponent();

    expect(fixture.nativeElement.textContent).toContain('Watch List');
    expect(fixture.nativeElement.textContent).toContain('Transaction History');
  });
});

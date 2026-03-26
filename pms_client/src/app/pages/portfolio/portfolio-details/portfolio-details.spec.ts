import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { HoldingService } from '../../../services/holdings-service';
import { PortfolioService } from '../../../services/portfolio-service';
import { StockService } from '../../../services/stock-service';
import { TradeService } from '../../../services/trade-service';
import { PortfolioDetails } from './portfolio-details';

describe('PortfolioDetails', () => {
  let component: PortfolioDetails;
  let fixture: ComponentFixture<PortfolioDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioDetails],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '1' }),
            },
          },
        },
        {
          provide: PortfolioService,
          useValue: {
            getPortfolioById: () =>
              of({
                id: 1,
                name: 'Growth',
                cashBalance: 1500,
                isDefault: false,
              }),
          },
        },
        {
          provide: TradeService,
          useValue: {
            getTradesByPortfolioId: () => of([]),
            createTrade: () => of(),
          },
        },
        {
          provide: HoldingService,
          useValue: {
            getHoldingsByPortfolioId: () => of([]),
          },
        },
        {
          provide: StockService,
          useValue: {
            getLiveStocksBySymbols: () => of([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PortfolioDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

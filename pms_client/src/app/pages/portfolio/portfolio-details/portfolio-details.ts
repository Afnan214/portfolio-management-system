import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs';
import {
  PortfolioService,
  PortfolioResponse,
  PortfolioValuationResponse,
} from '../../../services/portfolio-service';
import { StockQuote, StockService } from '../../../services/stock-service';
import {
  CreateTradeRequest,
  Side,
  TradeResponse,
  TradeService,
} from '../../../services/trade-service';
import { HoldingResponse, HoldingService } from '../../../services/holdings-service';
import { PortfolioTabs } from './components/portfolio-tabs/portfolio-tabs';
import { PortfolioSummaryCard } from './components/portfolio-summary-card/portfolio-summary-card';
import { PortfolioHoldingsList } from './components/portfolio-holdings-list/portfolio-holdings-list';
import { PortfolioTradesList } from './components/portfolio-trades-list/portfolio-trades-list';
import { PortfolioQuickTrade } from './components/portfolio-quick-trade/portfolio-quick-trade';
import { PortfolioStatsPanel } from './components/portfolio-stats/portfolio-stats-panel';

export type PortfolioDetailsTab = 'dashboard' | 'transactions' | 'holdings' | 'stats';

@Component({
  selector: 'app-portfolio-details',
  standalone: true,
  imports: [
    CommonModule,
    PortfolioTabs,
    PortfolioSummaryCard,
    PortfolioHoldingsList,
    PortfolioTradesList,
    PortfolioQuickTrade,
    PortfolioStatsPanel,
  ],
  templateUrl: './portfolio-details.html',
  styleUrl: './portfolio-details.css',
})
export class PortfolioDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private portfolioService = inject(PortfolioService);
  private tradeService = inject(TradeService);
  private holdingService = inject(HoldingService);
  private stockService = inject(StockService);
  private cdr = inject(ChangeDetectorRef);

  readonly tabs: Array<{ id: PortfolioDetailsTab; label: string }> = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'holdings', label: 'Holdings' },
    { id: 'stats', label: 'Stats' },
  ];

  recentTrades: TradeResponse[] = [];
  holdings: HoldingResponse[] = [];
  valuations: PortfolioValuationResponse[] = [];
  currentPrices: Record<string, number> = {};

  isAddingFunds = false;
  isSubmittingTrade = false;
  tradeErrorMessage = '';
  tradeSuccessMessage = '';

  portfolio: PortfolioResponse | null = null;
  isLoading = true;
  errorMessage = '';

  activeTab: PortfolioDetailsTab = 'dashboard';
  tradeAction: Side = Side.BUY;
  readonly Side = Side;
  selectedStock: StockQuote | null = null;
  tradeQuantity: number | null = null;

  readonly idParam = this.route.snapshot.paramMap.get('id');

  get estimatedTradeTotal(): number {
    if (!this.selectedStock || !this.tradeQuantity || this.tradeQuantity <= 0) {
      return 0;
    }

    return this.tradeQuantity * this.selectedStock.currentPrice;
  }

  get activeHoldings(): HoldingResponse[] {
    return [...this.holdings]
      .filter((holding) => holding.quantity > 0)
      .sort((left, right) => this.getMarketValue(right) - this.getMarketValue(left));
  }

  get dashboardHoldings(): HoldingResponse[] {
    return this.activeHoldings.slice(0, 5);
  }

  get sortedRecentTrades(): TradeResponse[] {
    return [...this.recentTrades].sort(
      (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );
  }

  get dashboardTrades(): TradeResponse[] {
    return this.sortedRecentTrades.slice(0, 5);
  }

  get sellableHoldings(): HoldingResponse[] {
    return this.activeHoldings;
  }

  get sellableSymbols(): string[] {
    return this.sellableHoldings.map((holding) => holding.stock.symbol);
  }

  get selectedHolding(): HoldingResponse | null {
    if (!this.selectedStock) {
      return null;
    }

    return (
      this.holdings.find(
        (holding) =>
          holding.stock.symbol.toUpperCase() === this.selectedStock?.symbol.toUpperCase(),
      ) ?? null
    );
  }

  get maxSellQuantity(): number {
    return this.tradeAction === Side.SELL ? this.selectedHolding?.quantity ?? 0 : 0;
  }

  get canSubmitTrade(): boolean {
    if (!this.selectedStock || !this.tradeQuantity || this.tradeQuantity <= 0 || this.isSubmittingTrade) {
      return false;
    }

    if (this.tradeAction === Side.SELL) {
      return this.maxSellQuantity > 0 && this.tradeQuantity <= this.maxSellQuantity;
    }

    return true;
  }

  get totalHoldingsCostBasis(): number {
    return this.activeHoldings.reduce((total, holding) => total + holding.totalCostBasis, 0);
  }

  get totalHoldingsMarketValue(): number {
    return this.activeHoldings.reduce((total, holding) => total + this.getMarketValue(holding), 0);
  }

  get totalUnrealizedGain(): number {
    return this.totalHoldingsMarketValue - this.totalHoldingsCostBasis;
  }

  get buyTradeCount(): number {
    return this.recentTrades.filter((trade) => trade.side === Side.BUY).length;
  }

  get sellTradeCount(): number {
    return this.recentTrades.filter((trade) => trade.side === Side.SELL).length;
  }

  get topHolding(): HoldingResponse | null {
    return this.activeHoldings[0] ?? null;
  }

  ngOnInit(): void {
    if (!this.idParam) {
      this.isLoading = false;
      this.errorMessage = 'Portfolio id is missing.';
      this.cdr.detectChanges();
      return;
    }

    const portfolioId = Number(this.idParam);

    if (Number.isNaN(portfolioId)) {
      this.isLoading = false;
      this.errorMessage = 'Invalid portfolio id.';
      this.cdr.detectChanges();
      return;
    }

    this.portfolioService.getPortfolioById(portfolioId).subscribe({
      next: (response) => {
        this.portfolio = response;
        this.isLoading = false;
        this.loadTrades();
        this.loadHoldings();
        this.loadValuations();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = 'Failed to load portfolio.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  setActiveTab(tab: PortfolioDetailsTab): void {
    this.activeTab = tab;
  }

  onAddFunds(amount: number): void {
    if (!this.portfolio) {
      return;
    }

    this.isAddingFunds = true;
    this.portfolioService.addFunds(this.portfolio.id, amount).subscribe({
      next: (updated) => {
        this.portfolio = updated;
        this.isAddingFunds = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to add funds', error);
        this.isAddingFunds = false;
        this.cdr.detectChanges();
      },
    });
  }

  showAllHoldings(): void {
    this.activeTab = 'holdings';
  }

  showAllTransactions(): void {
    this.activeTab = 'transactions';
  }

  getMarketValue(holding: HoldingResponse): number {
    return holding.quantity * this.getCurrentPrice(holding.stock.symbol);
  }

  getUnrealizedGain(holding: HoldingResponse): number {
    return this.getMarketValue(holding) - holding.totalCostBasis;
  }

  makeTrade(): void {
    if (!this.selectedStock?.currentPrice || !this.tradeQuantity || !this.idParam) {
      return;
    }

    if (this.tradeAction === Side.SELL) {
      if (!this.selectedHolding) {
        this.tradeErrorMessage = 'You can only sell stocks currently held in this portfolio.';
        return;
      }

      if (this.tradeQuantity > this.selectedHolding.quantity) {
        this.tradeQuantity = this.selectedHolding.quantity;
        this.tradeErrorMessage = `You can sell up to ${this.selectedHolding.quantity} share${this.selectedHolding.quantity === 1 ? '' : 's'
          } of ${this.selectedHolding.stock.symbol}.`;
        return;
      }
    }

    const payload: CreateTradeRequest = {
      symbol: this.selectedStock.symbol,
      side: this.tradeAction,
      quantity: this.tradeQuantity,
      pricePerShare: this.selectedStock.currentPrice,
    };

    this.isSubmittingTrade = true;
    this.tradeErrorMessage = '';
    this.tradeSuccessMessage = '';

    this.tradeService.createTrade(payload, Number(this.idParam)).subscribe({
      next: (trade) => {
        this.recentTrades = [trade, ...this.recentTrades];
        this.tradeSuccessMessage = `${trade.side} order for ${trade.stock.symbol} placed successfully.`;
        this.tradeErrorMessage = '';

        if (this.portfolio) {
          this.portfolio = {
            ...this.portfolio,
            cashBalance:
              trade.side === Side.BUY
                ? this.portfolio.cashBalance - trade.totalAmount
                : this.portfolio.cashBalance + trade.totalAmount,
          };
        }

        this.resetTradeForm();
        this.isSubmittingTrade = false;
        this.loadHoldings();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.tradeErrorMessage = 'Failed to place trade.';
        this.isSubmittingTrade = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadTrades(): void {
    if (!this.portfolio) {
      return;
    }

    this.tradeService.getTradesByPortfolioId(this.portfolio.id).subscribe({
      next: (trades) => {
        this.recentTrades = trades;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load trades', error);
      },
    });
  }

  loadHoldings(): void {
    if (!this.portfolio) {
      return;
    }

    this.holdingService.getHoldingsByPortfolioId(this.portfolio.id).subscribe({
      next: (holdings) => {
        this.holdings = holdings;
        this.loadHoldingPrices();
        this.syncTradeStateWithHoldings();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load holdings', error);
      },
    });
  }

  loadValuations(): void {
    if (!this.portfolio) {
      return;
    }

    this.portfolioService.getPortfolioValuationsById(this.portfolio.id).subscribe({
      next: (portfolioValuations) => {
        this.valuations = portfolioValuations;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log('Failed to load valuations', error);
      },
    });
  }

  setTradeAction(action: Side): void {
    this.tradeAction = action;
    this.tradeErrorMessage = '';
    this.tradeSuccessMessage = '';
    this.syncTradeStateWithHoldings();
  }

  onSelectedStockChange(stock: StockQuote | null): void {
    this.selectedStock = stock;
    this.tradeErrorMessage = '';
    this.tradeSuccessMessage = '';
    this.syncTradeStateWithHoldings();
  }

  onTradeQuantityChange(quantity: number | null): void {
    this.tradeQuantity = quantity;

    if (this.tradeQuantity == null) {
      return;
    }

    if (this.tradeQuantity < 1) {
      this.tradeQuantity = 1;
    }

    if (this.tradeAction === Side.SELL && this.maxSellQuantity > 0 && this.tradeQuantity > this.maxSellQuantity) {
      this.tradeQuantity = this.maxSellQuantity;
    }
  }

  private syncTradeStateWithHoldings(): void {
    if (this.tradeAction !== Side.SELL) {
      return;
    }

    if (this.selectedStock && !this.selectedHolding) {
      this.selectedStock = null;
      this.tradeQuantity = null;
      this.tradeErrorMessage = 'You can only sell stocks currently held in this portfolio.';
      return;
    }

    if (this.tradeQuantity && this.maxSellQuantity > 0 && this.tradeQuantity > this.maxSellQuantity) {
      this.tradeQuantity = this.maxSellQuantity;
    }
  }

  private resetTradeForm(): void {
    this.tradeQuantity = null;
    this.selectedStock = null;
    this.tradeAction = Side.BUY;
    this.tradeErrorMessage = '';
  }

  private getCurrentPrice(symbol: string): number {
    return this.currentPrices[symbol.toUpperCase()] ?? 0;
  }

  private loadHoldingPrices(): void {
    const symbols = [...new Set(this.holdings.map((holding) => holding.stock.symbol).filter(Boolean))];

    if (symbols.length === 0) {
      this.currentPrices = {};
      return;
    }

    this.stockService.getLiveStocksBySymbols(symbols).pipe(take(1)).subscribe({
      next: (quotes) => {
        this.currentPrices = quotes.reduce<Record<string, number>>((prices, quote) => {
          prices[quote.symbol.toUpperCase()] = quote.currentPrice;
          return prices;
        }, {});
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load holding prices', error);
      },
    });
  }
}

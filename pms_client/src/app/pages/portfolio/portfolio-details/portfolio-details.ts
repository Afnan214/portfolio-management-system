import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PortfolioService, PortfolioResponse } from '../../../services/portfolio-service';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ArrowRightLeft, Search } from 'lucide-angular';
import { StockSelector } from '../../../components/stock-selector/stock-selector';
import { StockQuote } from '../../../services/stock-service';
import {
  CreateTradeRequest,
  Side,
  TradeResponse,
  TradeService,
} from '../../../services/trade-service';
import { HoldingResponse, HoldingService } from '../../../services/holdings-service';

@Component({
  selector: 'app-portfolio-details',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, StockSelector],
  templateUrl: './portfolio-details.html',
  styleUrl: './portfolio-details.css',
})
export class PortfolioDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private portfolioService = inject(PortfolioService);
  private tradeService = inject(TradeService);
  private holdingService = inject(HoldingService);
  private cdr = inject(ChangeDetectorRef);

  recentTrades: TradeResponse[] = [];
  holdings: HoldingResponse[] = [];

  isSubmittingTrade = false;
  tradeErrorMessage = '';
  tradeSuccessMessage = '';

  portfolio: PortfolioResponse | null = null;
  isLoading = true;
  errorMessage = '';
  ArrowRightLeft = ArrowRightLeft;
  Search = Search;
  fundBalance = 12500.0;

  tradeAction: Side = Side.BUY;
  readonly Side = Side;
  selectedStock: StockQuote | null = null;
  tradeSymbol = '';
  tradeQuantity: number | null = null;
  showAddFundsModal = false;
  addFundsAmount: number | null = null;

  idParam = this.route.snapshot.paramMap.get('id');

  totalBalance = 48250.75;
  allTimeReturn = 12.4;

  get estimatedTradeTotal(): number {
    if (!this.selectedStock || !this.tradeQuantity || this.tradeQuantity <= 0) {
      return 0;
    }

    return this.tradeQuantity * this.selectedStock.currentPrice;
  }

  get sellableHoldings(): HoldingResponse[] {
    return this.holdings.filter((holding) => holding.quantity > 0);
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
          holding.stock.symbol.toUpperCase() === this.selectedStock!.symbol.toUpperCase(),
      ) ?? null
    );
  }

  get maxSellQuantity(): number {
    return this.tradeAction === Side.SELL ? this.selectedHolding?.quantity ?? 0 : 0;
  }

  get canSubmitTrade(): boolean {
    if (this.isSubmittingTrade || !this.selectedStock || !this.tradeQuantity || this.tradeQuantity <= 0) {
      return false;
    }

    if (this.tradeAction === Side.SELL) {
      return this.maxSellQuantity > 0 && this.tradeQuantity <= this.maxSellQuantity;
    }

    return true;
  }

  getMarketValue(holding: HoldingResponse): number {
    return holding.quantity * (holding.stock.currentPrice ?? 0);
  }

  getUnrealizedGain(holding: HoldingResponse): number {
    return this.getMarketValue(holding) - holding.totalCostBasis;
  }

  makeTrade() {
    if (!this.selectedStock?.currentPrice || !this.tradeQuantity || !this.idParam) {
      console.log('trade quantity, current pricce are null OORR  idparam not given');
      return;
    }

    if (this.tradeAction === Side.SELL) {
      if (!this.selectedHolding) {
        this.tradeErrorMessage = 'You can only sell stocks currently held in this portfolio.';
        return;
      }

      if (this.tradeQuantity > this.selectedHolding.quantity) {
        this.tradeQuantity = this.selectedHolding.quantity;
        this.tradeErrorMessage = `You can sell up to ${this.selectedHolding.quantity} share${
          this.selectedHolding.quantity === 1 ? '' : 's'
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
        this.recentTrades.unshift(trade);
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

  ngOnInit(): void {
    console.log('idParam:', this.idParam);

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

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load portfolio.';
        this.isLoading = false;
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
        this.syncTradeStateWithHoldings();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load holdings', error);
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
    this.syncTradeStateWithHoldings();
  }

  onTradeQuantityChange(): void {
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
}

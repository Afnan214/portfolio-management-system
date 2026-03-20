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
  private cdr = inject(ChangeDetectorRef);

  //trade information:
  recentTrades: TradeResponse[] = [];
  isSubmittingTrade = false;
  tradeErrorMessage = '';
  tradeSuccessMessage = '';

  portfolio: PortfolioResponse | null = null;
  isLoading = true;
  errorMessage = '';
  ArrowRightLeft = ArrowRightLeft;
  Search = Search;
  fundBalance = 12500.0;

  // Quick Trade
  tradeAction: Side = Side.BUY;
  readonly Side = Side;
  selectedStock: StockQuote | null = null;
  tradeSymbol = '';
  tradeQuantity: number | null = null;
  showAddFundsModal = false;
  addFundsAmount: number | null = null;

  //portfolio id
  idParam = this.route.snapshot.paramMap.get('id');

  // Mock data
  totalBalance = 48250.75;
  allTimeReturn = 12.4;

  get estimatedTradeTotal(): number {
    if (!this.selectedStock || !this.tradeQuantity || this.tradeQuantity <= 0) {
      return 0;
    }

    return this.tradeQuantity * this.selectedStock.currentPrice;
  }

  getTransactionColor(type: string) {
    switch (type) {
      case 'buy':
        return 'text-blue-500 bg-blue-50';
      case 'sell':
        return 'text-orange-500 bg-orange-50';
      case 'deposit':
        return 'text-green-500 bg-green-50';
      case 'withdraw':
        return 'text-red-500 bg-red-50';
      default:
        return 'text-slate-500 bg-slate-50';
    }
  }

  getInitials(symbol: string): string {
    return symbol.substring(0, 2);
  }

  makeTrade() {
    if (!this.selectedStock?.currentPrice || !this.tradeQuantity || !this.idParam) {
      console.log('trade quantity, current pricce are null OORR  idparam not given');
      return;
    }
    const payload: CreateTradeRequest = {
      symbol: this.selectedStock.symbol,
      side: this.tradeAction,
      quantity: this.tradeQuantity,
      pricePerShare: this.selectedStock?.currentPrice,
    };
    console.log(payload);

    this.tradeService.createTrade(payload, Number(this.idParam)).subscribe({
      next: (trade) => {
        this.recentTrades.unshift(trade);
        this.tradeSuccessMessage = `${trade.side} order for ${trade.stock.symbol} placed successfully.`;

        if (this.portfolio) {
          this.portfolio = {
            ...this.portfolio,
            cashBalance:
              trade.side === Side.BUY
                ? this.portfolio.cashBalance - trade.totalAmount
                : this.portfolio.cashBalance + trade.totalAmount,
          };
        }

        this.tradeQuantity = 0;
        this.selectedStock = null;
        this.tradeAction = Side.BUY;
        this.isSubmittingTrade = false;
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
        console.log('response:', response);
        this.portfolio = response;
        this.isLoading = false;

        this.loadTrades();

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
        console.log('Trades should show here', this.recentTrades);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load trades', error);
      },
    });
  }
}

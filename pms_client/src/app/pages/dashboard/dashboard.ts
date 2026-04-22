import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import {
  LucideAngularModule,
  ChartLine,
  HandCoins,
  ArrowBigUp,
  BanknoteArrowUp,
  BanknoteArrowDown,
  Wallet,
  Percent,
  Plus,
  X,
} from 'lucide-angular';

import {
  TransactionService,
  TransactionResponse,
  TransactionType,
} from '../../services/transaction-service';
import { AuthService } from '../../auth/auth-service';
import {
  PortfolioService,
  PortfolioResponse,
  PortfolioValuationResponse,
} from '../../services/portfolio-service';
import { CreateTradeRequest, Side, TradeService } from '../../services/trade-service';
import { HoldingResponse, HoldingService } from '../../services/holdings-service';
import { StockQuote } from '../../services/stock-service';
import { WatchlistPanel } from '../../components/watchlist-panel/watchlist-panel';
import { PortfolioQuickTrade } from '../portfolio/portfolio-details/components/portfolio-quick-trade/portfolio-quick-trade';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BaseChartDirective,
    LucideAngularModule,
    WatchlistPanel,
    PortfolioQuickTrade,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private transactionService = inject(TransactionService);
  private authService = inject(AuthService);
  private portfolioService = inject(PortfolioService);
  private tradeService = inject(TradeService);
  private holdingService = inject(HoldingService);
  private cdr = inject(ChangeDetectorRef);

  sidebarCollapsed = false;

  // Lucide icons
  ChartLine = ChartLine;
  HandCoins = HandCoins;
  ArrowBigUp = ArrowBigUp;
  BanknoteArrowUp = BanknoteArrowUp;
  BanknoteArrowDown = BanknoteArrowDown;
  Wallet = Wallet;
  Percent = Percent;
  Plus = Plus;
  X = X;

  defaultPortfolio: PortfolioResponse | null = null;
  portfolioName = ""
  fundBalance = 0;
  totalGainLoss = 0;
  isAddingFunds = false;

  // Quick Trade
  readonly Side = Side;
  tradeAction: Side = Side.BUY;
  selectedStock: StockQuote | null = null;
  tradeQuantity: number | null = null;
  holdings: HoldingResponse[] = [];
  isSubmittingTrade = false;
  tradeErrorMessage = '';
  tradeSuccessMessage = '';

  showAddFundsModal = false;
  addFundsAmount: number | null = null;

  valuations: PortfolioValuationResponse[] = [];
  totalBalance = 0;
  allTimeReturn = 0;

  transactions: { id: number; type: string; label: string; date: string; amount: number }[] = [];

  // Chart config
  chartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [],
  };

  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' },
      },
      y: {
        grid: { color: 'rgba(148,163,184,0.1)' },
        ticks: {
          color: '#94a3b8',
          callback: (value) => '$' + Number(value).toLocaleString(),
        },
      },
    },
  };

  ngOnInit(): void {
    this.portfolioService.getDefaultPortfolio().subscribe({
      next: (portfolio) => {
        this.defaultPortfolio = portfolio;
        this.portfolioName = portfolio.name;
        this.fundBalance = portfolio.cashBalance;
        this.totalGainLoss = portfolio.totalGainLoss
        this.loadValuations(portfolio.id);
        this.loadHoldings();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load default portfolio', error);
      },
    });

    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.transactionService.getTransactionsByUserId(user.id).subscribe((data) => {
          this.transactions = data.map((tx) => this.mapTransaction(tx));
          this.cdr.detectChanges();
        });
      }
    });
  }

  private mapTransaction(tx: TransactionResponse): {
    id: number;
    type: string;
    label: string;
    date: string;
    amount: number;
  } {
    const typeMap: Record<TransactionType, string> = {
      [TransactionType.BUY_STOCK]: 'buy',
      [TransactionType.SELL_STOCK]: 'sell',
      [TransactionType.ADD_FUNDS]: 'deposit',
      [TransactionType.WITHDRAWAL]: 'withdraw',
    };

    const labelMap: Record<TransactionType, string> = {
      [TransactionType.BUY_STOCK]: 'Buy Stock',
      [TransactionType.SELL_STOCK]: 'Sell Stock',
      [TransactionType.ADD_FUNDS]: 'Deposit',
      [TransactionType.WITHDRAWAL]: 'Withdrawal',
    };

    return {
      id: tx.id,
      type: typeMap[tx.type],
      label: labelMap[tx.type],
      date: tx.createdAt.substring(0, 10),
      amount:
        tx.type === TransactionType.BUY_STOCK || tx.type === TransactionType.WITHDRAWAL
          ? -tx.amount
          : tx.amount,
    };
  }

  getTransactionIcon(type: string) {
    switch (type) {
      case 'buy':
        return this.HandCoins;
      case 'sell':
        return this.ArrowBigUp;
      case 'deposit':
        return this.BanknoteArrowUp;
      case 'withdraw':
        return this.BanknoteArrowDown;
      default:
        return this.HandCoins;
    }
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

  openAddFundsModal() {
    this.addFundsAmount = null;
    this.showAddFundsModal = true;
  }

  closeAddFundsModal() {
    this.showAddFundsModal = false;
  }

  confirmAddFunds() {
    if (!this.addFundsAmount || this.addFundsAmount <= 0 || !this.defaultPortfolio) {
      return;
    }

    this.isAddingFunds = true;
    this.portfolioService.addFunds(this.defaultPortfolio.id, this.addFundsAmount).subscribe({
      next: (updated) => {
        this.defaultPortfolio = updated;
        this.fundBalance = updated.cashBalance;
        this.isAddingFunds = false;
        this.closeAddFundsModal();
        this.reloadTransactions();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to add funds', error);
        this.isAddingFunds = false;
        this.cdr.detectChanges();
      },
    });
  }

  private loadValuations(portfolioId: number): void {
    this.portfolioService.getPortfolioValuationsById(portfolioId).subscribe({
      next: (valuations) => {
        this.valuations = valuations;
        this.buildChart();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load valuations', error);
      },
    });
  }

  private buildChart(): void {
    const labels = this.valuations.map((v) => {
      const d = new Date(v.snapshotTime);
      return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d);
    });
    const values = this.valuations.map((v) => v.profitLossAmount);

    this.chartData = {
      labels,
      datasets: [
        {
          data: values,
          label: 'profit/loss ',
          fill: true,
          tension: 0.35,
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.1)',
          pointBackgroundColor: '#22c55e',
          pointBorderColor: '#fff',
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    };

    if (this.valuations.length > 0) {
      const latest = this.valuations[this.valuations.length - 1];
      this.totalBalance = latest.totalValue;
      this.allTimeReturn = latest.profitLossPercent;
      latest.snapshotTime;
    }
  }

  // Quick Trade computed properties
  get activeHoldings(): HoldingResponse[] {
    return this.holdings.filter((h) => h.quantity > 0);
  }

  get sellableHoldings(): HoldingResponse[] {
    return this.activeHoldings;
  }

  get sellableSymbols(): string[] {
    return this.sellableHoldings.map((h) => h.stock.symbol);
  }

  get selectedHolding(): HoldingResponse | null {
    if (!this.selectedStock) return null;
    return (
      this.holdings.find(
        (h) => h.stock.symbol.toUpperCase() === this.selectedStock?.symbol.toUpperCase(),
      ) ?? null
    );
  }

  get maxSellQuantity(): number {
    return this.tradeAction === Side.SELL ? (this.selectedHolding?.quantity ?? 0) : 0;
  }

  get estimatedTradeTotal(): number {
    if (!this.selectedStock || !this.tradeQuantity || this.tradeQuantity <= 0) return 0;
    return this.tradeQuantity * this.selectedStock.currentPrice;
  }

  get canSubmitTrade(): boolean {
    if (
      !this.selectedStock ||
      !this.tradeQuantity ||
      this.tradeQuantity <= 0 ||
      this.isSubmittingTrade
    ) {
      return false;
    }
    if (this.tradeAction === Side.SELL) {
      return this.maxSellQuantity > 0 && this.tradeQuantity <= this.maxSellQuantity;
    }
    return true;
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
    if (this.tradeQuantity == null) return;
    if (this.tradeQuantity < 1) this.tradeQuantity = 1;
    if (
      this.tradeAction === Side.SELL &&
      this.maxSellQuantity > 0 &&
      this.tradeQuantity > this.maxSellQuantity
    ) {
      this.tradeQuantity = this.maxSellQuantity;
    }
  }

  makeTrade(): void {
    if (!this.selectedStock?.currentPrice || !this.tradeQuantity || !this.defaultPortfolio) return;

    if (this.tradeAction === Side.SELL) {
      if (!this.selectedHolding) {
        this.tradeErrorMessage = 'You can only sell stocks currently held in this portfolio.';
        return;
      }
      if (this.tradeQuantity > this.selectedHolding.quantity) {
        this.tradeQuantity = this.selectedHolding.quantity;
        this.tradeErrorMessage = `You can sell up to ${this.selectedHolding.quantity} share${this.selectedHolding.quantity === 1 ? '' : 's'} of ${this.selectedHolding.stock.symbol}.`;
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

    this.tradeService.createTrade(payload, this.defaultPortfolio.id).subscribe({
      next: (trade) => {
        this.tradeSuccessMessage = `${trade.side} order for ${trade.stock.symbol} placed successfully.`;
        this.tradeErrorMessage = '';

        if (this.defaultPortfolio) {
          const newBalance =
            trade.side === Side.BUY
              ? this.defaultPortfolio.cashBalance - trade.totalAmount
              : this.defaultPortfolio.cashBalance + trade.totalAmount;
          this.defaultPortfolio = { ...this.defaultPortfolio, cashBalance: newBalance };
          this.fundBalance = newBalance;
        }

        this.resetTradeForm();
        this.isSubmittingTrade = false;
        this.loadHoldings();
        this.reloadTransactions();
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

  private loadHoldings(): void {
    if (!this.defaultPortfolio) return;
    this.holdingService.getHoldingsByPortfolioId(this.defaultPortfolio.id).subscribe({
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

  private syncTradeStateWithHoldings(): void {
    if (this.tradeAction !== Side.SELL) return;
    if (this.selectedStock && !this.selectedHolding) {
      this.selectedStock = null;
      this.tradeQuantity = null;
      this.tradeErrorMessage = 'You can only sell stocks currently held in this portfolio.';
      return;
    }
    if (
      this.tradeQuantity &&
      this.maxSellQuantity > 0 &&
      this.tradeQuantity > this.maxSellQuantity
    ) {
      this.tradeQuantity = this.maxSellQuantity;
    }
  }

  private resetTradeForm(): void {
    this.tradeQuantity = null;
    this.selectedStock = null;
    this.tradeAction = Side.BUY;
    this.tradeErrorMessage = '';
  }

  private reloadTransactions(): void {
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.transactionService.getTransactionsByUserId(user.id).subscribe((data) => {
          this.transactions = data.map((tx) => this.mapTransaction(tx));
          this.cdr.detectChanges();
        });
      }
    });
  }
}

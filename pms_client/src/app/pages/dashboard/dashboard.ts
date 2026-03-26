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
  ArrowRightLeft,
  Search,
} from 'lucide-angular';
import {
  TransactionService,
  TransactionResponse,
  TransactionType,
} from '../../services/transaction-service';
import { AuthService } from '../../auth/auth-service';
import { PortfolioService, PortfolioResponse } from '../../services/portfolio-service';
import { WatchlistPanel } from '../../components/watchlist-panel/watchlist-panel';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, LucideAngularModule, WatchlistPanel],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private transactionService = inject(TransactionService);
  private authService = inject(AuthService);
  private portfolioService = inject(PortfolioService);
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
  ArrowRightLeft = ArrowRightLeft;
  Search = Search;

  defaultPortfolio: PortfolioResponse | null = null;
  fundBalance = 0;
  isAddingFunds = false;

  // Quick Trade
  tradeAction: 'buy' | 'sell' = 'buy';
  tradeSymbol = '';
  tradeQuantity: number | null = null;
  showAddFundsModal = false;
  addFundsAmount: number | null = null;

  // Mock data
  totalBalance = 48250.75;
  allTimeReturn = 12.4;

  transactions: { id: number; type: string; label: string; date: string; amount: number }[] = [];

  // Chart config
  chartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    datasets: [
      {
        data: [35000, 38200, 36800, 41500, 43900, 45100, 48250],
        label: 'Portfolio Value',
        fill: true,
        tension: 0.4,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.1)',
        pointBackgroundColor: '#22c55e',
        pointBorderColor: '#fff',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
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
        this.fundBalance = portfolio.cashBalance;
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

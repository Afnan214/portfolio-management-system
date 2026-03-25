import { Component } from '@angular/core';
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
import { WatchlistPanel } from '../../components/watchlist-panel/watchlist-panel';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, LucideAngularModule, WatchlistPanel],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
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

  fundBalance = 12500.0;

  // Quick Trade
  tradeAction: 'buy' | 'sell' = 'buy';
  tradeSymbol = '';
  tradeQuantity: number | null = null;
  showAddFundsModal = false;
  addFundsAmount: number | null = null;

  // Mock data
  totalBalance = 48250.75;
  allTimeReturn = 12.4;

  transactions = [
    { type: 'buy', label: 'Bought AAPL', date: '2026-03-18', amount: -1520.0 },
    { type: 'deposit', label: 'Deposit', date: '2026-03-17', amount: 5000.0 },
    { type: 'sell', label: 'Sold TSLA', date: '2026-03-15', amount: 2480.5 },
    { type: 'buy', label: 'Bought NVDA', date: '2026-03-14', amount: -990.44 },
    { type: 'withdraw', label: 'Withdrawal', date: '2026-03-12', amount: -1000.0 },
    { type: 'sell', label: 'Sold GOOGL', date: '2026-03-10', amount: 1415.6 },
  ];

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
    if (this.addFundsAmount && this.addFundsAmount > 0) {
      this.fundBalance += this.addFundsAmount;
      this.closeAddFundsModal();
    }
  }
}

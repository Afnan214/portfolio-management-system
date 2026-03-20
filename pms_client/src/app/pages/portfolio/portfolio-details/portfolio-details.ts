import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PortfolioService, PortfolioResponse } from '../portfolio-service';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  ArrowRightLeft,
  Search,
} from 'lucide-angular';



@Component({
  selector: 'app-portfolio-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,],
  templateUrl: './portfolio-details.html',
  styleUrl: './portfolio-details.css',
})
export class PortfolioDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private portfolioService = inject(PortfolioService);
  private cdr = inject(ChangeDetectorRef);

  portfolio: PortfolioResponse | null = null;
  isLoading = true;
  errorMessage = '';
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

  watchList = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 189.84, changePercent: 1.23 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 141.56, changePercent: -0.45 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.91, changePercent: 0.87 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 185.07, changePercent: 2.15 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.42, changePercent: -1.78 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 495.22, changePercent: 3.41 },
    { symbol: 'META', name: 'Meta Platforms', price: 505.75, changePercent: 0.62 },
  ];

  transactions = [
    { type: 'buy', label: 'Bought AAPL', date: '2026-03-18', amount: -1520.0 },
    { type: 'deposit', label: 'Deposit', date: '2026-03-17', amount: 5000.0 },
    { type: 'sell', label: 'Sold TSLA', date: '2026-03-15', amount: 2480.5 },
    { type: 'buy', label: 'Bought NVDA', date: '2026-03-14', amount: -990.44 },
    { type: 'withdraw', label: 'Withdrawal', date: '2026-03-12', amount: -1000.0 },
    { type: 'sell', label: 'Sold GOOGL', date: '2026-03-10', amount: 1415.6 },
  ];



  getTransactionColor(type: string) {
    switch (type) {
      case 'buy': return 'text-blue-500 bg-blue-50';
      case 'sell': return 'text-orange-500 bg-orange-50';
      case 'deposit': return 'text-green-500 bg-green-50';
      case 'withdraw': return 'text-red-500 bg-red-50';
      default: return 'text-slate-500 bg-slate-50';
    }
  }


  getInitials(symbol: string): string {
    return symbol.substring(0, 2);
  }



  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    console.log('idParam:', idParam);

    if (!idParam) {
      this.isLoading = false;
      this.errorMessage = 'Portfolio id is missing.';
      this.cdr.detectChanges();
      return;
    }

    const portfolioId = Number(idParam);

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
}

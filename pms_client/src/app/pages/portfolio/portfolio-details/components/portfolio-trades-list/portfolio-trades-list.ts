import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Side, TradeResponse } from '../../../../../services/trade-service';

@Component({
  selector: 'app-portfolio-trades-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio-trades-list.html',
})
export class PortfolioTradesList {
  @Input() eyebrow = 'Activity';
  @Input() title = 'Recent Trades';
  @Input() description = '';
  @Input() trades: TradeResponse[] = [];
  @Input() emptyTitle = 'No trades yet';
  @Input() emptyDescription = 'Trades will appear here.';
  @Input() showViewAll = false;
  @Input() viewAllLabel = 'View all';
  @Input() sideEnum = Side;
  @Output() viewAll = new EventEmitter<void>();

  getLogoUrl(symbol: string): string {
    const base = symbol.replace('.US', '').toLowerCase();
    return `https://assets.parqet.com/logos/symbol/${base}?format=jpg`;
  }
}

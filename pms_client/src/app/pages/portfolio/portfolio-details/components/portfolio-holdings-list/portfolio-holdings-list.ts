import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HoldingResponse } from '../../../../../services/holdings-service';

@Component({
  selector: 'app-portfolio-holdings-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio-holdings-list.html',
})
export class PortfolioHoldingsList {
  @Input() eyebrow = 'Holdings';
  @Input() title = 'Holdings';
  @Input() description = '';
  @Input() holdings: HoldingResponse[] = [];
  @Input() currentPrices: Record<string, number> = {};
  @Input() emptyTitle = 'No holdings yet';
  @Input() emptyDescription = 'Holdings will appear here.';
  @Input() showViewAll = false;
  @Input() viewAllLabel = 'View all';
  @Output() viewAll = new EventEmitter<void>();

  getLogoUrl(symbol: string): string {
    const base = symbol.replace('.US', '').toLowerCase();
    return `https://assets.parqet.com/logos/symbol/${base}?format=jpg`;
  }

  getCurrentPrice(symbol: string): number {
    return this.currentPrices[symbol.toUpperCase()] ?? 0;
  }

  getMarketValue(holding: HoldingResponse): number {
    return holding.quantity * this.getCurrentPrice(holding.stock.symbol);
  }

  getUnrealizedGain(holding: HoldingResponse): number {
    return this.getMarketValue(holding) - holding.totalCostBasis;
  }
}

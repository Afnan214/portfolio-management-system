import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { HoldingResponse } from '../../../../services/holdings-service';
import { PortfolioResponse } from '../../../../services/portfolio-service';

@Component({
  selector: 'app-portfolio-stats-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio-stats-panel.html',
})
export class PortfolioStatsPanel {
  @Input({ required: true }) portfolio!: PortfolioResponse;
  @Input() holdingsCount = 0;
  @Input() tradesCount = 0;
  @Input() buyTradeCount = 0;
  @Input() sellTradeCount = 0;
  @Input() costBasis = 0;
  @Input() marketValue = 0;
  @Input() unrealizedGain = 0;
  @Input() topHolding: HoldingResponse | null = null;
  @Input() topHoldingValue = 0;
}

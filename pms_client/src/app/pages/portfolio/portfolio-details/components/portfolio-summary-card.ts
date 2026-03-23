import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PortfolioResponse } from '../../../../services/portfolio-service';

@Component({
  selector: 'app-portfolio-summary-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio-summary-card.html',
})
export class PortfolioSummaryCard {
  @Input({ required: true }) portfolio!: PortfolioResponse;
}

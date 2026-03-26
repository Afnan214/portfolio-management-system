import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortfolioResponse } from '../../../../../services/portfolio-service';

@Component({
  selector: 'app-portfolio-summary-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './portfolio-summary-card.html',
})
export class PortfolioSummaryCard {
  @Input({ required: true }) portfolio!: PortfolioResponse;
  @Input() isAddingFunds = false;

  @Output() addFunds = new EventEmitter<number>();

  showAddFundsForm = false;
  fundAmount: number | null = null;

  submitAddFunds(): void {
    if (this.fundAmount && this.fundAmount > 0) {
      this.addFunds.emit(this.fundAmount);
    }
  }

  resetForm(): void {
    this.showAddFundsForm = false;
    this.fundAmount = null;
  }
}

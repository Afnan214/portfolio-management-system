import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortfolioResponse } from '../../../../../services/portfolio-service';
import { ArrowDownRight, ArrowUpRight, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-portfolio-summary-card',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './portfolio-summary-card.html',
})
export class PortfolioSummaryCard {
  @Input({ required: true }) portfolio!: PortfolioResponse;
  @Input() isAddingFunds = false;

  @Output() addFunds = new EventEmitter<number>();

  showAddFundsForm = false;
  fundAmount: number | null = null;
  ArrowUpRight = ArrowUpRight;
  ArrowDownRight = ArrowDownRight;

  submitAddFunds(): void {
    if (this.fundAmount && this.fundAmount > 0) {
      this.addFunds.emit(this.fundAmount);
      this.showAddFundsForm = false
    }
  }

  resetForm(): void {
    this.showAddFundsForm = false;
    this.fundAmount = null;
  }
}

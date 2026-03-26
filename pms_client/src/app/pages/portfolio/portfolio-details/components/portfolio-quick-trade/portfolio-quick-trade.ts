import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ArrowRightLeft } from 'lucide-angular';
import { StockSelector } from '../../../../../components/stock-selector/stock-selector';
import { HoldingResponse } from '../../../../../services/holdings-service';
import { StockQuote } from '../../../../../services/stock-service';
import { Side } from '../../../../../services/trade-service';

@Component({
  selector: 'app-portfolio-quick-trade',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, StockSelector],
  templateUrl: './portfolio-quick-trade.html',
})
export class PortfolioQuickTrade {
  @Input() tradeAction: Side = Side.BUY;
  @Input() sideEnum = Side;
  @Input() selectedStock: StockQuote | null = null;
  @Input() tradeQuantity: number | null = null;
  @Input() selectedHolding: HoldingResponse | null = null;
  @Input() sellableHoldings: HoldingResponse[] = [];
  @Input() sellableSymbols: string[] = [];
  @Input() maxSellQuantity = 0;
  @Input() estimatedTradeTotal = 0;
  @Input() canSubmitTrade = false;
  @Input() isSubmittingTrade = false;
  @Input() tradeErrorMessage = '';
  @Input() tradeSuccessMessage = '';

  @Output() tradeActionChange = new EventEmitter<Side>();
  @Output() selectedStockChange = new EventEmitter<StockQuote | null>();
  @Output() tradeQuantityChange = new EventEmitter<number | null>();
  @Output() submitTrade = new EventEmitter<void>();

  readonly arrowRightLeft = ArrowRightLeft;
}

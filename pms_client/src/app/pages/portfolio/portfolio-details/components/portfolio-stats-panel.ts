import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { HoldingResponse } from '../../../../services/holdings-service';
import {
  PortfolioResponse,
  PortfolioValuationResponse,
} from '../../../../services/portfolio-service';

@Component({
  selector: 'app-portfolio-stats-panel',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './portfolio-stats-panel.html',
})
export class PortfolioStatsPanel implements OnChanges {
  @Input({ required: true }) portfolio!: PortfolioResponse;
  @Input() holdingsCount = 0;
  @Input() tradesCount = 0;
  @Input() buyTradeCount = 0;
  @Input() sellTradeCount = 0;
  @Input() costBasis = 0;
  @Input() marketValue = 0;
  @Input() unrealizedGain = 0;
  @Input() valuations: PortfolioValuationResponse[] = [];
  @Input() topHolding: HoldingResponse | null = null;
  @Input() topHoldingValue = 0;

  valueHistoryChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [],
  };

  performanceChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [],
  };

  readonly valueHistoryChartOptions: ChartConfiguration<'line'>['options'] = {
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

  readonly performanceChartOptions: ChartConfiguration<'bar'>['options'] = {
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
          callback: (value) => Number(value).toFixed(2) + '%',
        },
      },
    },
  };

  get hasValuationHistory(): boolean {
    return this.valuations.length > 0;
  }

  ngOnChanges(): void {
    this.buildCharts();
  }

  private buildCharts(): void {
    const labels = this.valuations.map((valuation) => this.formatSnapshotLabel(valuation.snapshotTime));
    const totalValues = this.valuations.map((valuation) => valuation.totalValue);
    const profitLossPercents = this.valuations.map((valuation) => valuation.profitLossPercent);

    this.valueHistoryChartData = {
      labels,
      datasets: [
        {
          data: totalValues,
          label: 'Portfolio Value',
          fill: true,
          tension: 0.35,
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.12)',
          pointBackgroundColor: '#22c55e',
          pointBorderColor: '#ffffff',
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    };

    this.performanceChartData = {
      labels,
      datasets: [
        {
          data: profitLossPercents,
          label: 'Profit / Loss %',
          backgroundColor: profitLossPercents.map((value) =>
            value >= 0 ? 'rgba(34,197,94,0.75)' : 'rgba(239,68,68,0.75)',
          ),
          borderRadius: 6,
          maxBarThickness: 36,
        },
      ],
    };
  }

  private formatSnapshotLabel(snapshotTime: string): string {
    const snapshotDate = new Date(snapshotTime);

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(snapshotDate);
  }
}

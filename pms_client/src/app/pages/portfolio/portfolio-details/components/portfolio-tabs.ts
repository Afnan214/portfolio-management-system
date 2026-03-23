import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { PortfolioDetailsTab } from '../portfolio-details';

@Component({
  selector: 'app-portfolio-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio-tabs.html',
})
export class PortfolioTabs {
  @Input() tabs: Array<{ id: PortfolioDetailsTab; label: string }> = [];
  @Input() activeTab: PortfolioDetailsTab = 'dashboard';
  @Output() activeTabChange = new EventEmitter<PortfolioDetailsTab>();
}

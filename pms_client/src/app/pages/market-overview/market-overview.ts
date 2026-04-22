import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Coins,
  Radio,
  TrendingUp,
  TrendingDown,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Check,
  Newspaper,
  ExternalLink,
  Flame,
} from 'lucide-angular';
import { map, Observable, startWith, tap } from 'rxjs';
import { StockQuote, StockService } from '../../services/stock-service';
import { MarketNews, MarketNewsService } from '../../services/market-news-service';
import { STOCK_META, StockMeta } from '../../constants/stock-meta';

type ChangeFilter = 'all' | 'gainers' | 'losers';

@Component({
  selector: 'app-market-overview',
  standalone: true,
  imports: [LucideAngularModule, CommonModule, FormsModule],
  templateUrl: './market-overview.html',
  styleUrl: './market-overview.css',
})
export class MarketOverview {
  private readonly stockService = inject(StockService);
  private readonly marketNewsService = inject(MarketNewsService);
  private readonly elRef = inject(ElementRef);

  Coins = Coins;
  Radio = Radio;
  TrendingUp = TrendingUp;
  TrendingDown = TrendingDown;
  Search = Search;
  SlidersHorizontal = SlidersHorizontal;
  ChevronDown = ChevronDown;
  Check = Check;
  Newspaper = Newspaper;
  ExternalLink = ExternalLink;
  Flame = Flame;

  activeTab: 'stocks' | 'news' = 'stocks';

  searchTerm = '';
  activeFilter: ChangeFilter = 'all';
  activeSector = '';
  activeIndustry = '';
  dropdownOpen = false;

  sectors = [...new Set(Object.values(STOCK_META).map((m) => m.sector))].sort();
  industries = [...new Set(Object.values(STOCK_META).map((m) => m.industry))].sort();
  filteredIndustries = this.industries;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.querySelector('.filter-dropdown')?.contains(event.target)) {
      this.dropdownOpen = false;
    }
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  get activeFilterLabel(): string {
    const parts: string[] = [];
    if (this.activeFilter !== 'all') parts.push(this.activeFilter === 'gainers' ? 'Gainers' : 'Losers');
    if (this.activeSector) parts.push(this.activeSector);
    if (this.activeIndustry) parts.push(this.activeIndustry);
    return parts.length ? parts.join(' · ') : 'Filters';
  }

  get hasActiveFilters(): boolean {
    return this.activeFilter !== 'all' || !!this.activeSector || !!this.activeIndustry;
  }

  readonly mostActiveStocks$ = this.stockService.getLiveStocks().pipe(
    tap((stocks) => {
      console.log('Live stocks update:', stocks);
    }),
    map((stocks) =>
      [...stocks]
        .sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange))
        .slice(0, 8),
    ),
  );

  readonly allStocks$ = this.stockService.getLiveStocks();

  readonly marketNews$: Observable<MarketNews[] | null> = this.marketNewsService.getMarketNews().pipe(
    tap((news) => console.log('Market news received:', news)),
    startWith(null),
  );

  filterStocks(stocks: StockQuote[]): StockQuote[] {
    let filtered = stocks;

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.trim().toUpperCase();
      filtered = filtered.filter((s) => s.symbol.toUpperCase().includes(term));
    }

    if (this.activeFilter === 'gainers') {
      filtered = filtered.filter((s) => s.percentChange >= 0);
    } else if (this.activeFilter === 'losers') {
      filtered = filtered.filter((s) => s.percentChange < 0);
    }

    if (this.activeSector) {
      filtered = filtered.filter((s) => this.getMeta(s.symbol).sector === this.activeSector);
    }

    if (this.activeIndustry) {
      filtered = filtered.filter((s) => this.getMeta(s.symbol).industry === this.activeIndustry);
    }

    return filtered;
  }

  setFilter(filter: ChangeFilter): void {
    this.activeFilter = filter;
  }

  onSectorChange(): void {
    this.activeIndustry = '';
    if (this.activeSector) {
      this.filteredIndustries = [...new Set(
        Object.entries(STOCK_META)
          .filter(([, m]) => m.sector === this.activeSector)
          .map(([, m]) => m.industry),
      )].sort();
    } else {
      this.filteredIndustries = this.industries;
    }
  }

  getMeta(symbol: string): StockMeta {
    return STOCK_META[symbol] ?? { sector: 'Other', industry: 'Other' };
  }

  getLogoUrl(symbol: string): string {
    const base = symbol.replace('.US', '').toLowerCase();
    return `https://assets.parqet.com/logos/symbol/${base}?format=jpg`;
  }

  formatNewsDate(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp * 1000;
    const hours = Math.floor(diff / 3_600_000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }

  private sparklineCache = new Map<string, string>();

  getSparklinePath(symbol: string, percentChange: number): string {
    const key = `${symbol}_${percentChange.toFixed(2)}`;
    if (this.sparklineCache.has(key)) {
      return this.sparklineCache.get(key)!;
    }

    const points = 12;
    const width = 100;
    const height = 32;
    const padding = 2;

    // Seeded random from symbol
    let seed = 0;
    for (let i = 0; i < symbol.length; i++) {
      seed = ((seed << 5) - seed + symbol.charCodeAt(i)) | 0;
    }
    const seededRandom = () => {
      seed = (seed * 16807 + 0) % 2147483647;
      return (seed & 0x7fffffff) / 0x7fffffff;
    };

    // Generate y values with a trend matching percentChange
    const trend = percentChange >= 0 ? 1 : -1;
    const ys: number[] = [];
    let y = height / 2;
    for (let i = 0; i < points; i++) {
      const noise = (seededRandom() - 0.5) * height * 0.35;
      const trendPush = trend * (i / points) * height * 0.3;
      y = Math.max(padding, Math.min(height - padding, height / 2 - trendPush + noise));
      ys.push(y);
    }

    const stepX = width / (points - 1);
    const path = ys.map((py, i) => `${i === 0 ? 'M' : 'L'}${(i * stepX).toFixed(1)},${py.toFixed(1)}`).join(' ');

    this.sparklineCache.set(key, path);
    return path;
  }
}

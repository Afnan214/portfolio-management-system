import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  forwardRef,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { StockQuote, StockService } from '../../services/stock-service';

@Component({
  selector: 'app-stock-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-selector.html',
  styleUrl: './stock-selector.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StockSelector),
      multi: true,
    },
  ],
})
export class StockSelector implements ControlValueAccessor, OnInit, OnChanges {
  @Input() allowedSymbols: string[] | null = null;

  private readonly destroyRef = inject(DestroyRef);

  stocks: StockQuote[] = [];
  filteredStocks: StockQuote[] = [];

  searchTerm = '';
  selectedSymbol = '';
  selectedStock: StockQuote | null = null;

  dropdownOpen = false;
  disabled = false;
  isLoading = false;

  private onChange: (value: StockQuote | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private stockService: StockService) {}

  ngOnInit(): void {
    this.loadStocks();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['allowedSymbols']) {
      this.applyFilter();

      if (this.selectedStock && !this.isStockAllowed(this.selectedStock)) {
        this.clearSelection(true);
      }
    }
  }

  loadStocks(): void {
    this.isLoading = true;

    this.stockService
      .getLiveStocks()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (stocks) => {
          this.stocks = stocks;

          if (this.selectedSymbol) {
            this.selectedStock =
              this.stocks.find((stock) => stock.symbol === this.selectedSymbol) ?? null;

            if (this.selectedStock) {
              this.onChange(this.selectedStock);
            }
          }

          this.applyFilter();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load stocks', error);
          this.isLoading = false;
        },
      });
  }

  onInputChange(): void {
    const value = this.searchTerm.trim().toUpperCase();

    this.clearSelection();

    if (value === '') {
      this.filteredStocks = this.getAllowedStocks();
    } else {
      this.filteredStocks = this.getAllowedStocks().filter((stock) =>
        stock.symbol.toUpperCase().includes(value),
      );
    }

    this.dropdownOpen = true;
  }

  selectStock(stock: StockQuote): void {
    if (!this.isStockAllowed(stock)) {
      return;
    }

    this.selectedSymbol = stock.symbol;
    this.searchTerm = stock.symbol;
    this.selectedStock = stock;
    this.dropdownOpen = false;

    this.onChange(stock);
    this.onTouched();
  }

  onFocus(): void {
    this.dropdownOpen = true;
    this.filteredStocks = this.searchTerm.trim()
      ? this.getAllowedStocks().filter((stock) =>
          stock.symbol.toUpperCase().includes(this.searchTerm.trim().toUpperCase()),
        )
      : this.getAllowedStocks();
  }

  onBlur(): void {
    setTimeout(() => {
      this.dropdownOpen = false;
      this.onTouched();
    }, 150);
  }

  writeValue(value: StockQuote | null): void {
    this.selectedStock = value;
    this.selectedSymbol = value?.symbol ?? '';
    this.searchTerm = value?.symbol ?? '';
  }

  registerOnChange(fn: (value: StockQuote | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private applyFilter(): void {
    const searchTerm = this.searchTerm.trim().toUpperCase();
    const allowedStocks = this.getAllowedStocks();

    this.filteredStocks = searchTerm
      ? allowedStocks.filter((stock) => stock.symbol.toUpperCase().includes(searchTerm))
      : allowedStocks;
  }

  private getAllowedStocks(): StockQuote[] {
    if (this.allowedSymbols === null) {
      return this.stocks;
    }

    const allowedSymbolSet = new Set(this.allowedSymbols.map((symbol) => symbol.toUpperCase()));
    return this.stocks.filter((stock) => allowedSymbolSet.has(stock.symbol.toUpperCase()));
  }

  private isStockAllowed(stock: StockQuote): boolean {
    if (this.allowedSymbols === null) {
      return true;
    }

    return this.allowedSymbols.some(
      (symbol) => symbol.toUpperCase() === stock.symbol.toUpperCase(),
    );
  }

  private clearSelection(resetSearchTerm = false): void {
    this.selectedStock = null;
    this.selectedSymbol = '';
    if (resetSearchTerm) {
      this.searchTerm = '';
    }
    this.onChange(null);
  }
}

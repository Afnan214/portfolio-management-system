import { CommonModule } from '@angular/common';
import { Component, forwardRef, OnInit } from '@angular/core';
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
export class StockSelector implements ControlValueAccessor, OnInit {
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

  loadStocks(): void {
    this.isLoading = true;

    this.stockService.getStocks().subscribe({
      next: (stocks) => {
        this.stocks = stocks;
        this.filteredStocks = stocks;
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

    this.selectedStock = null;
    this.onChange(null);

    if (value === '') {
      this.filteredStocks = this.stocks;
    } else {
      this.filteredStocks = this.stocks.filter((stock) =>
        stock.symbol.toUpperCase().includes(value),
      );
    }

    this.dropdownOpen = true;
  }

  selectStock(stock: StockQuote): void {
    this.selectedSymbol = stock.symbol;
    this.searchTerm = stock.symbol;
    this.dropdownOpen = false;

    this.onChange(stock);
    this.onTouched();
  }

  onFocus(): void {
    this.dropdownOpen = true;
    this.filteredStocks = this.searchTerm.trim()
      ? this.stocks.filter((stock) =>
          stock.symbol.toUpperCase().includes(this.searchTerm.trim().toUpperCase()),
        )
      : this.stocks;
  }

  onBlur(): void {
    setTimeout(() => {
      this.dropdownOpen = false;
      this.onTouched();
    }, 150);
  }

  writeValue(value: string | null): void {
    this.selectedSymbol = value ?? '';
    this.searchTerm = value ?? '';
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
}

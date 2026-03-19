package com.tradetracker.pms.service.stock;

import com.tradetracker.pms.dto.response.stock.StockQuote;
import com.tradetracker.pms.store.StockStore;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StockServiceImpl implements StockService {

  private final StockStore stockStore;

  public StockServiceImpl(StockStore stockStore) {
    this.stockStore = stockStore;
  }

  @Override
  public List<StockQuote> getAllQuotes() {
    return stockStore.getAll();
  }

  @Override
  public Optional<StockQuote> getQuote(String symbol) {
    return stockStore.get(symbol);
  }
}

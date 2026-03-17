package com.tradetracker.pms.service.stock;

import com.tradetracker.pms.dto.response.stock.StockQuote;

import java.util.List;
import java.util.Optional;

public interface StockService {
    List<StockQuote> getAllQuotes();
    Optional<StockQuote> getQuote(String symbol);
}

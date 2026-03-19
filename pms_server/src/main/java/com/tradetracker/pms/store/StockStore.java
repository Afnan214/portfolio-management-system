package com.tradetracker.pms.store;

import com.tradetracker.pms.dto.response.stock.StockQuote;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class StockStore {

    private final ConcurrentHashMap<String, StockQuote> quotes = new ConcurrentHashMap<>();

    public void update(String symbol, StockQuote quote) {
        quotes.put(symbol.toUpperCase(), quote);
    }

    public Optional<StockQuote> get(String symbol) {
        return Optional.ofNullable(quotes.get(symbol.toUpperCase()));
    }

    public List<StockQuote> getAll() {
        return List.copyOf(quotes.values());
    }

    public int size() {
        return quotes.size();
    }
}

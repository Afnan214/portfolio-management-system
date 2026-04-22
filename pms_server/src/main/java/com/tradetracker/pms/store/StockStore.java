package com.tradetracker.pms.store;

import com.tradetracker.pms.dto.response.stock.StockQuote;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory store for stock quotes, acting as a cache layer between the Finnhub API and the application.
 *
 * Why a store instead of a database?
 * - Stock prices are ephemeral and change every few seconds — there's no need to persist them to a DB.
 * - Using an in-memory ConcurrentHashMap provides fast, thread-safe read/write access.
 * - ConcurrentHashMap is used because multiple threads access this store concurrently:
 *   the scheduled polling thread writes to it, while HTTP request threads and WebSocket threads read from it.
 *
 * Data flow:
 * - FinnhubPollingService.pollStockQuotes() writes quotes here every 90 seconds.
 * - StockServiceImpl reads from here to serve REST API requests.
 * - FinnhubPollingService also broadcasts the full store contents via WebSocket after each poll cycle.
 */
@Component
public class StockStore {

    // Thread-safe map: key = stock symbol (e.g. "AAPL"), value = latest quote data
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

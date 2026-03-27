package com.tradetracker.pms.store;

import com.tradetracker.pms.dto.response.stock.MarketNewsResponse;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

/**
 * In-memory store for market news articles, acting as a cache between the Finnhub API and the REST layer.
 *
 * - Uses AtomicReference for thread-safe atomic swaps of the entire news list.
 *   Unlike ConcurrentHashMap (used in StockStore), we replace the full list at once since news is fetched as a batch.
 * - List.copyOf() creates an immutable snapshot, so readers always get a consistent view even during updates.
 *
 * Data flow:
 * - MarketNewsService fetches news from Finnhub once daily (6 AM cron) and on startup, then calls update().
 * - The REST controller reads from getAll() to serve news to the frontend.
 */
@Component
public class MarketNewsStore {

    // Atomic reference to an immutable list — allows safe concurrent reads while the polling thread swaps in new data
    private final AtomicReference<List<MarketNewsResponse>> news = new AtomicReference<>(Collections.emptyList());

    public void update(List<MarketNewsResponse> articles) {
        news.set(List.copyOf(articles));
    }

    public List<MarketNewsResponse> getAll() {
        return news.get();
    }

    public int size() {
        return news.get().size();
    }
}

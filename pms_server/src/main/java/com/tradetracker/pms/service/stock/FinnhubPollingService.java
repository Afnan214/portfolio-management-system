package com.tradetracker.pms.service.stock;

import com.tradetracker.pms.dto.response.stock.StockQuote;
import com.tradetracker.pms.store.StockStore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class FinnhubPollingService {

    private static final Logger log = LoggerFactory.getLogger(FinnhubPollingService.class);

    private static final List<String> TOP_30_SYMBOLS = List.of(
            "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA",
            "META", "TSLA", "BRK.B", "JPM", "V",
            "UNH", "XOM", "MA", "JNJ", "PG",
            "HD", "COST", "ABBV", "CRM", "BAC",
            "AVGO", "KO", "WMT", "PEP", "MRK",
            "LLY", "TMO", "CSCO", "ADBE", "NFLX"
    );

    private final RestClient restClient;
    private final StockStore stockStore;

    public FinnhubPollingService(@Value("${finnhub.api.key}") String apiKey, StockStore stockStore) {
        this.stockStore = stockStore;
        this.restClient = RestClient.builder()
                .baseUrl("https://finnhub.io/api/v1")
                .defaultHeader("X-Finnhub-Token", apiKey)
                .build();
    }

    @Scheduled(fixedRate = 30000)
    public void pollStockQuotes() {
        log.info("Polling Finnhub for {} stock quotes...", TOP_30_SYMBOLS.size());

        for (String symbol : TOP_30_SYMBOLS) {
            try {
                fetchQuote(symbol);
            } catch (Exception e) {
                log.warn("Failed to fetch quote for {}: {}", symbol, e.getMessage());
            }
        }

        log.info("Polling complete. {} quotes in store.", stockStore.getAll().size());
    }

    @SuppressWarnings("unchecked")
    private void fetchQuote(String symbol) {
        Map<String, Object> response = restClient.get()
                .uri("/quote?symbol={symbol}", symbol)
                .retrieve()
                .body(Map.class);

        if (response == null || response.get("c") == null) {
            log.warn("Empty response for symbol {}", symbol);
            return;
        }

        double currentPrice = toDouble(response.get("c"));
        if (currentPrice == 0.0) {
            log.warn("No price data for symbol {}", symbol);
            return;
        }

        StockQuote quote = new StockQuote(
                symbol,
                currentPrice,
                toDouble(response.get("d")),
                toDouble(response.get("dp")),
                toDouble(response.get("h")),
                toDouble(response.get("l")),
                toDouble(response.get("o")),
                toDouble(response.get("pc")),
                Instant.now()
        );

        stockStore.update(symbol, quote);
    }

    private double toDouble(Object value) {
        if (value instanceof Number n) {
            return n.doubleValue();
        }
        return 0.0;
    }
}

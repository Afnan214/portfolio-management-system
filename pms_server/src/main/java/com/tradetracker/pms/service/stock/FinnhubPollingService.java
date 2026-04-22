package com.tradetracker.pms.service.stock;

import com.tradetracker.pms.dto.response.stock.FinnhubQuoteResponse;
import com.tradetracker.pms.dto.response.stock.StockQuote;
import com.tradetracker.pms.store.StockStore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.List;

/**
 * Scheduled service (cron job) that polls the Finnhub API for stock quotes at a fixed interval.
 *
 * Cron / Scheduling:
 * - Uses Spring's @Scheduled(fixedRate = 90000) to run pollStockQuotes() every 90 seconds.
 * - This acts as a cron job: the method is automatically invoked by Spring's task scheduler on a fixed interval,
 *   without any HTTP request triggering it.
 * - A 1-second delay between each API call avoids hitting Finnhub's rate limit.
 *
 * WebSocket integration:
 * - After fetching all quotes, the service broadcasts the full stock data to all connected WebSocket clients
 *   via SimpMessagingTemplate.convertAndSend("/topic/stock-quotes", ...).
 * - This means the frontend receives live stock updates without needing to poll the backend.
 *
 * Store:
 * - Fetched quotes are stored in StockStore (an in-memory ConcurrentHashMap-based cache).
 * - The store is also used by the REST API (StockServiceImpl) to serve stock data on demand.
 */
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
  private final SimpMessagingTemplate messagingTemplate;

  public FinnhubPollingService(@Value("${finnhub.api.key}") String apiKey, StockStore stockStore,
      SimpMessagingTemplate messagingTemplate) {
    this.stockStore = stockStore;
    this.messagingTemplate = messagingTemplate;
    this.restClient = RestClient.builder()
        .baseUrl("https://finnhub.io/api/v1")
        .defaultHeader("X-Finnhub-Token", apiKey)
        .build();
  }

  @Scheduled(fixedRate = 90000)
  public void pollStockQuotes() {
    log.info("Polling Finnhub for {} stock quotes...", TOP_30_SYMBOLS.size());

    for (String symbol : TOP_30_SYMBOLS) {
      try {
        fetchQuote(symbol);
      } catch (Exception e) {
        log.warn("Failed to fetch quote for {}: {}", symbol, e.getMessage());
      }
      try {
        Thread.sleep(1000);
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        return;
      }
    }

    log.info("Polling complete. {} quotes in store.", stockStore.size());

    // Sending stock quotes to clients 
    messagingTemplate.convertAndSend("/topic/stock-quotes", stockStore.getAll());
  }

  private void fetchQuote(String symbol) {
    FinnhubQuoteResponse response = restClient.get()
        .uri("/quote?symbol={symbol}", symbol)
        .retrieve()
        .body(FinnhubQuoteResponse.class);

    if (response == null || response.currentPrice() == 0.0) {
      log.warn("No price data for symbol {}", symbol);
      return;
    }

    StockQuote quote = new StockQuote(
        symbol,
        response.currentPrice(),
        response.change(),
        response.percentChange(),
        response.highPrice(),
        response.lowPrice(),
        response.openPrice(),
        response.previousClose(),
        Instant.now()
    );
    log.info("Stock: {} obtained", quote.toString());

    stockStore.update(symbol, quote);
  }
}

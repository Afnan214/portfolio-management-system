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

    public FinnhubPollingService(@Value("${finnhub.api.key}") String apiKey, StockStore stockStore, SimpMessagingTemplate messagingTemplate) {
        this.stockStore = stockStore;
        this.messagingTemplate = messagingTemplate;
        this.restClient = RestClient.builder()
                .baseUrl("https://finnhub.io/api/v1")
                .defaultHeader("X-Finnhub-Token", apiKey)
                .build();
    }

    @Scheduled(fixedRate = 60000)
    public void pollStockQuotes() {
        log.debug("Polling Finnhub for {} stock quotes...", TOP_30_SYMBOLS.size());

        for (String symbol : TOP_30_SYMBOLS) {
            try {
                fetchQuote(symbol);
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.warn("Polling interrupted");
                return;
            } catch (Exception e) {
                log.warn("Failed to fetch quote for {}: {}", symbol, e.getMessage());
            }
        }

        log.debug("Polling complete. {} quotes in store.", stockStore.size());

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

        stockStore.update(symbol, quote);
    }
}

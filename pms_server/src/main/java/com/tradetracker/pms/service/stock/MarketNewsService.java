package com.tradetracker.pms.service.stock;

import com.tradetracker.pms.dto.response.stock.MarketNewsResponse;
import com.tradetracker.pms.store.MarketNewsStore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import jakarta.annotation.PostConstruct;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Collections;
import java.util.List;

/**
 * Scheduled service (cron job) that fetches market news articles from the Finnhub API.
 *
 * Cron / Scheduling:
 * - Uses @Scheduled(cron = "0 0 6 * * *") to run once daily at 6:00 AM.
 *   Cron format: second minute hour day month weekday → "0 0 6 * * *" means "at 06:00:00 every day".
 * - Also uses @PostConstruct to fetch news immediately on application startup,
 *   so the store is populated before any client requests arrive.
 *
 * Store:
 * - Fetched articles are stored in MarketNewsStore (an in-memory AtomicReference-based cache).
 * - The REST API reads from this store to serve news to the frontend without hitting Finnhub on every request.
 */
@Service
public class MarketNewsService {

    private static final Logger log = LoggerFactory.getLogger(MarketNewsService.class);

    private final RestClient restClient;
    private final MarketNewsStore marketNewsStore;

    public MarketNewsService(@Value("${finnhub.api.key}") String apiKey, MarketNewsStore marketNewsStore) {
        this.marketNewsStore = marketNewsStore;
        this.restClient = RestClient.builder()
            .baseUrl("https://finnhub.io/api/v1")
            .defaultHeader("X-Finnhub-Token", apiKey)
            .build();
    }

    @PostConstruct
    @Scheduled(cron = "0 0 6 * * *")
    public void pollMarketNews() {
        log.info("Polling Finnhub for market news...");
        List<MarketNewsResponse> news = fetchMarketNews("general");
        marketNewsStore.update(news);
        log.info("Market news polling complete. {} articles stored.", marketNewsStore.size());
    }

    public List<MarketNewsResponse> getMarketNews() {
        return marketNewsStore.getAll();
    }

    private List<MarketNewsResponse> fetchMarketNews(String category) {
        try {
            List<MarketNewsResponse> news = restClient.get()
                .uri("/news?category={category}", category)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

            if (news == null) {
                return Collections.emptyList();
            }

            log.info("Fetched {} market news articles", news.size());
            return news;
        } catch (Exception e) {
            log.error("Failed to fetch market news: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
}

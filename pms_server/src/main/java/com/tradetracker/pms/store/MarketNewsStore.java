package com.tradetracker.pms.store;

import com.tradetracker.pms.dto.response.stock.MarketNewsResponse;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

@Component
public class MarketNewsStore {

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

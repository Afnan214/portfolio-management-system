package com.tradetracker.pms.controller;

import com.tradetracker.pms.dto.response.stock.MarketNewsResponse;
import com.tradetracker.pms.service.stock.MarketNewsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/market-news")
public class MarketNewsController {

    private final MarketNewsService marketNewsService;

    public MarketNewsController(MarketNewsService marketNewsService) {
        this.marketNewsService = marketNewsService;
    }

    @GetMapping
    public ResponseEntity<List<MarketNewsResponse>> getMarketNews() {
        return ResponseEntity.ok(marketNewsService.getMarketNews());
    }
}

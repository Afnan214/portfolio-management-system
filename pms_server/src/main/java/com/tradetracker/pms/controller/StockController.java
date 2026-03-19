package com.tradetracker.pms.controller;

import com.tradetracker.pms.dto.response.stock.StockQuote;
import com.tradetracker.pms.service.stock.StockService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/stocks")
public class StockController {

    private final StockService stockService;

    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    @GetMapping
    public ResponseEntity<List<StockQuote>> getAllQuotes() {
        return ResponseEntity.ok(stockService.getAllQuotes());
    }

    @GetMapping("/{symbol}")
    public ResponseEntity<StockQuote> getQuote(@PathVariable String symbol) {
        return stockService.getQuote(symbol)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

package com.tradetracker.pms.dto.response.stock;

import java.time.Instant;

public record StockQuote(
    String symbol,
    double currentPrice,
    double change,
    double percentChange,
    double highPrice,
    double lowPrice,
    double openPrice,
    double previousClose,
    Instant updatedAt
) {

}

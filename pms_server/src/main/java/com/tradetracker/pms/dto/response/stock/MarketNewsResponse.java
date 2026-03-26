package com.tradetracker.pms.dto.response.stock;

public record MarketNewsResponse(
    long id,
    String category,
    long datetime,
    String headline,
    String image,
    String related,
    String source,
    String summary,
    String url
) {
}

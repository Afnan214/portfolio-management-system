package com.tradetracker.pms.repository;

import com.tradetracker.pms.entity.Trade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TradeRepository extends JpaRepository<Trade, Long> {
    public List<Trade> findTradeByPortfolioId(Long portfolioId);
}

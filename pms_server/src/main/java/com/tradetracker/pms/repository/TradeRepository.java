package com.tradetracker.pms.repository;

import com.tradetracker.pms.entity.Trade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface TradeRepository extends JpaRepository<Trade, Long> {
    public List<Trade> findTradeByPortfolioId(Long portfolioId);
}

package com.tradetracker.pms.repository;

import com.tradetracker.pms.entity.Holding;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HoldingRepository extends JpaRepository<Holding, Long> {
    public Holding findByStockIdAndPortfolioId(Long stockId, Long portfolioId);
}

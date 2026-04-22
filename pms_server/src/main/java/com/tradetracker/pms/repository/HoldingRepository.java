package com.tradetracker.pms.repository;

import com.tradetracker.pms.entity.Holding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HoldingRepository extends JpaRepository<Holding, Long> {
    public Holding findByStockIdAndPortfolioId(Long stockId, Long portfolioId);
    public List<Holding> findByPortfolioId(Long portfolioId);
}

package com.tradetracker.pms.repository;

import com.tradetracker.pms.entity.PortfolioValuation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface PortfolioValuationRepository extends JpaRepository<PortfolioValuation, Long> {
    List<PortfolioValuation> findByPortfolio_IdOrderBySnapshotTimeAsc(Long portfolioId);
}

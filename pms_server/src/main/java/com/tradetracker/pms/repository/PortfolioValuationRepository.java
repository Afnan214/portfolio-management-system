package com.tradetracker.pms.repository;

import com.tradetracker.pms.entity.PortfolioValuation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


public interface PortfolioValuationRepository extends JpaRepository<PortfolioValuation, Long> {
    List<PortfolioValuation> findByPortfolio_IdOrderBySnapshotTimeAsc(Long portfolioId);
    Optional<PortfolioValuation> findTopByPortfolio_IdOrderBySnapshotTimeDesc(Long portfolioId);
    Optional<PortfolioValuation> findByPortfolio_IdAndSnapshotTimeBetween(
            Long portfolioId,
            LocalDateTime startOfDay,
            LocalDateTime endOfDay
    );
}

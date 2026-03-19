package com.tradetracker.pms.repository;

import com.tradetracker.pms.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PortfolioRepository extends JpaRepository<Portfolio,Long> {
    List<Portfolio> findByUserId(Long userId);
    Optional<Portfolio> findByUserIdAndIsDefault(Long userId, boolean isDefault);
    Optional<Portfolio> findById(Long id);

}

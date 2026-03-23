package com.tradetracker.pms.repository;

import com.tradetracker.pms.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {

  List<Portfolio> findByUserId(Long userId);

  Optional<Portfolio> findByUserIdAndIsDefault(Long userId, boolean isDefault);

  Optional<Portfolio> findById(Long id);

}

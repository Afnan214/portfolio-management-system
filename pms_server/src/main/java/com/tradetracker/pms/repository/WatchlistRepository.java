package com.tradetracker.pms.repository;

import com.tradetracker.pms.entity.Watchlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchlistRepository extends JpaRepository<Watchlist, Long> {

  List<Watchlist> findByUserId(Long userId);

  Optional<Watchlist> findByUserIdAndIsDefault(Long userId, boolean isDefault);

  Optional<Watchlist> findByIdAndUserId(Long id, Long userId);

  Optional<Watchlist> findById(Long id);
}

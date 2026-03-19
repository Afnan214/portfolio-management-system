package com.tradetracker.pms.repository;

import com.tradetracker.pms.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StockRepository extends JpaRepository<Stock, Long> {

  Optional<Stock> findBySymbol(String symbol);

  boolean existsBySymbol(String symbol);

  List<Stock> findAllByCompanyName(String companyName);

  List<Stock> findAllByIndustry(String industry);

  List<Stock> findAllBySector(String sector);
}

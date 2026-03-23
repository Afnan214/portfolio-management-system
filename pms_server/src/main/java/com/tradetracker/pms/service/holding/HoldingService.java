package com.tradetracker.pms.service.holding;


import com.tradetracker.pms.entity.Holding;
import com.tradetracker.pms.repository.HoldingRepository;
import com.tradetracker.pms.repository.PortfolioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HoldingService {
    private final HoldingRepository holdingRepository;
    private final PortfolioRepository portfolioRepository;

    public HoldingService(HoldingRepository holdingRepository, PortfolioRepository portfolioRepository) {
        this.holdingRepository = holdingRepository;
        this.portfolioRepository = portfolioRepository;
    }

    public List<Holding> getHoldigsByPortfolioId(Long portfolioId){
        return holdingRepository.findByPortfolioId(portfolioId);
    }
}

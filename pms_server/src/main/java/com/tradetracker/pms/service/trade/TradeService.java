package com.tradetracker.pms.service.trade;

import com.tradetracker.pms.dto.request.portfolio.CreatePortfolioRequest;
import com.tradetracker.pms.dto.request.portfolio.UpdatePortfolioRequest;
import com.tradetracker.pms.dto.request.portfolio.trade.CreateTradeRequest;
import com.tradetracker.pms.dto.response.portfolio.PortfolioResponse;
import com.tradetracker.pms.entity.*;
import com.tradetracker.pms.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


@Service
public class TradeService{
    PortfolioRepository portfolioRepository;
    UserRepository userRepository;
    TradeRepository tradeRepository;
    StockRepository stockRepository;
    HoldingRepository holdingRepository;
    public TradeService(PortfolioRepository portfolioRepository, UserRepository userRepository, TradeRepository tradeRepository, StockRepository stockRepository, HoldingRepository holdingRepository) {
        this.portfolioRepository = portfolioRepository;
        this.userRepository = userRepository;
        this.stockRepository = stockRepository;
        this.tradeRepository = tradeRepository;
        this.holdingRepository = holdingRepository;
    }
    public List<Trade> getTradesByPortfolio(Long portfolioId){
        return tradeRepository.findTradeByPortfolioId(portfolioId);
    }

    public Trade getTradeById(Long tradeId){
        return tradeRepository.findById(tradeId).orElseThrow(()-> new RuntimeException("Trade could not be found for id: " + tradeId));
    }

    @Transactional
    public Trade createTrade(Long portfolioId, CreateTradeRequest createTradeRequest) {
        Stock stock = stockRepository.findBySymbol(createTradeRequest.getSymbol())
                .orElseThrow(() -> new RuntimeException("Stock not found"));

        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));

        BigDecimal tradeQuantity = createTradeRequest.getQuantity();
        BigDecimal pricePerShare = createTradeRequest.getPricePerShare();
        BigDecimal tradeCost = pricePerShare.multiply(tradeQuantity);

        if (tradeQuantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Quantity must be greater than zero");
        }

        if (pricePerShare.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Price per share must be greater than zero");
        }

        Holding holding = holdingRepository.findByStockIdAndPortfolioId(stock.getId(), portfolio.getId());

        if (createTradeRequest.getSide() == Side.BUY) {
            if (portfolio.getCashBalance().compareTo(tradeCost) < 0) {
                throw new RuntimeException(
                        "Insufficient funds: Total amount " + tradeCost +
                                " exceeds balance " + portfolio.getCashBalance()
                );
            }

            portfolio.setCashBalance(portfolio.getCashBalance().subtract(tradeCost));

            if (holding == null) {
                holding = new Holding();
                holding.setStock(stock);
                holding.setPortfolio(portfolio);
                holding.setQuantity(tradeQuantity);
                holding.setTotalCostBasis(tradeCost);
            } else {
                holding.setQuantity(holding.getQuantity().add(tradeQuantity));
                holding.setTotalCostBasis(holding.getTotalCostBasis().add(tradeCost));
            }

            holding.setAverageCostBasis(
                    holding.getTotalCostBasis().divide(holding.getQuantity(), 2, RoundingMode.HALF_EVEN)
            );

            holdingRepository.save(holding);

        } else if (createTradeRequest.getSide() == Side.SELL) {
            if (holding == null) {
                throw new RuntimeException("Cannot sell: holding does not exist");
            }

            if (holding.getQuantity().compareTo(tradeQuantity) < 0) {
                throw new RuntimeException("Cannot sell more shares than currently owned");
            }

            BigDecimal costBasisRemoved = holding.getAverageCostBasis().multiply(tradeQuantity);

            portfolio.setCashBalance(portfolio.getCashBalance().add(tradeCost));
            holding.setQuantity(holding.getQuantity().subtract(tradeQuantity));
            holding.setTotalCostBasis(holding.getTotalCostBasis().subtract(costBasisRemoved));

            if (holding.getQuantity().compareTo(BigDecimal.ZERO) == 0) {
                holding.setTotalCostBasis(BigDecimal.ZERO);
                holding.setAverageCostBasis(BigDecimal.ZERO);
            } else {
                holding.setAverageCostBasis(
                        holding.getTotalCostBasis().divide(holding.getQuantity(), 2, RoundingMode.HALF_EVEN)
                );
            }

            holdingRepository.save(holding);
        }

        Trade trade = new Trade();
        trade.setPortfolio(portfolio);
        trade.setStock(stock);
        trade.setSide(createTradeRequest.getSide());
        trade.setQuantity(tradeQuantity);
        trade.setPricePerShare(pricePerShare);
        trade.setTotalAmount(tradeCost);

        return tradeRepository.save(trade);
    }
}

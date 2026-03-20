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
    public TradeService(PortfolioRepository portfolioRepository, UserRepository userRepository, TradeRepository tradeRepository, StockRepository stockRepository) {
        this.portfolioRepository = portfolioRepository;
        this.userRepository = userRepository;
        this.stockRepository = stockRepository;
        this.tradeRepository = tradeRepository;
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

        BigDecimal totalAmount = createTradeRequest.getQuantity()
                .multiply(createTradeRequest.getPricePerShare());


        //need to update Holding when a trade is made. If holding for this stock doesn't exist, we must create a new holding
        Holding holding =  holdingRepository.findByStockIdAndPortfolioId(stock.getId(), portfolio.getId());
        if(holding == null){
            holding = new Holding();
            holding.setStock(stock);
            holding.setPortfolio(portfolio);
            holding.setQuantity(new BigDecimal(0));
            holding.setAverageCostBasis(new BigDecimal(0));
            holding.setTotalCostBasis(new BigDecimal(0));
        }

        // 1. Update Portfolio Cash Balance
        if (createTradeRequest.getSide() == Side.BUY) {
            //  cashBalance >= totalAmount
            if (portfolio.getCashBalance().compareTo(totalAmount) < 0) {
                throw new RuntimeException("Insufficient funds: Total amount " + totalAmount +
                        " exceeds balance " + portfolio.getCashBalance());
            }
            portfolio.setCashBalance(portfolio.getCashBalance().subtract(totalAmount));
        } else if (createTradeRequest.getSide() == Side.SELL) {
            // Add proceeds to balance
            portfolio.setCashBalance(portfolio.getCashBalance().add(totalAmount));
        }

        // Need to implement holdings updates when trade is made

        Trade trade = new Trade();
        trade.setPortfolio(portfolio);
        trade.setStock(stock);
        trade.setSide(createTradeRequest.getSide());
        trade.setQuantity(createTradeRequest.getQuantity());
        trade.setPricePerShare(createTradeRequest.getPricePerShare());
        trade.setTotalAmount(totalAmount);

        return tradeRepository.save(trade);
    }
    // need to implement update trade:

}

package com.tradetracker.pms.service.trade;

import com.tradetracker.pms.dto.request.portfolio.CreatePortfolioRequest;
import com.tradetracker.pms.dto.request.portfolio.UpdatePortfolioRequest;
import com.tradetracker.pms.dto.request.portfolio.trade.CreateTradeRequest;
import com.tradetracker.pms.dto.response.portfolio.PortfolioResponse;
import com.tradetracker.pms.entity.Portfolio;
import com.tradetracker.pms.entity.Stock;
import com.tradetracker.pms.entity.Trade;
import com.tradetracker.pms.entity.User;
import com.tradetracker.pms.repository.PortfolioRepository;
import com.tradetracker.pms.repository.StockRepository;
import com.tradetracker.pms.repository.TradeRepository;
import com.tradetracker.pms.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;


@Service
public class TradeService{
    PortfolioRepository portfolioRepository;
    UserRepository userRepository;
    TradeRepository tradeRepository;
    StockRepository stockRepository;
    public TradeService(PortfolioRepository portfolioRepository, UserRepository userRepository, TradeRepository tradeRepository, StockRepository stockRepository) {
        this.portfolioRepository = portfolioRepository;
        this.userRepository = userRepository;
    }
    public List<Trade> getTradesByPortfolio(Long portfolioId){
        return tradeRepository.findTradeByPortfolioId(portfolioId);
    }

    public Trade getTradeById(Long tradeId){
        return tradeRepository.findById(tradeId).orElseThrow(()-> new RuntimeException("Trade could not be found for id: " + tradeId));
    }

    public Trade createTrade(Long portfolioId, CreateTradeRequest createTradeRequest) {
        Stock stock = stockRepository.findById(createTradeRequest.getStockId())
                .orElseThrow(() -> new RuntimeException("Stock not found"));

        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));

        BigDecimal totalAmount = createTradeRequest.getQuantity()
                .multiply(createTradeRequest.getPricePerShare());

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

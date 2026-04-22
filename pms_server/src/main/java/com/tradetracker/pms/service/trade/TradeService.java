package com.tradetracker.pms.service.trade;

import com.tradetracker.pms.dto.request.portfolio.trade.CreateTradeRequest;
import com.tradetracker.pms.entity.Holding;
import com.tradetracker.pms.entity.Portfolio;
import com.tradetracker.pms.entity.PortfolioValuation;
import com.tradetracker.pms.entity.Side;
import com.tradetracker.pms.entity.Stock;
import com.tradetracker.pms.entity.Trade;
import com.tradetracker.pms.entity.TransactionType;
import com.tradetracker.pms.repository.HoldingRepository;
import com.tradetracker.pms.repository.PortfolioRepository;
import com.tradetracker.pms.repository.PortfolioValuationRepository;
import com.tradetracker.pms.repository.StockRepository;
import com.tradetracker.pms.repository.TradeRepository;
import com.tradetracker.pms.repository.UserRepository;
import com.tradetracker.pms.service.stock.StockService;
import com.tradetracker.pms.service.transaction.TransactionService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;


@Service
public class TradeService{
    PortfolioRepository portfolioRepository;
    PortfolioValuationRepository portfolioValuationRepository;
    UserRepository userRepository;
    TradeRepository tradeRepository;
    StockRepository stockRepository;
    HoldingRepository holdingRepository;
    StockService stockService;
    TransactionService transactionService;
    public TradeService(PortfolioRepository portfolioRepository, UserRepository userRepository, TradeRepository tradeRepository, StockRepository stockRepository, HoldingRepository holdingRepository, PortfolioValuationRepository portfolioValuationRepository, StockService stockService, TransactionService transactionService) {
        this.portfolioRepository = portfolioRepository;
        this.userRepository = userRepository;
        this.stockRepository = stockRepository;
        this.tradeRepository = tradeRepository;
        this.holdingRepository = holdingRepository;
        this.portfolioValuationRepository = portfolioValuationRepository;
        this.stockService = stockService;
        this.transactionService = transactionService;
    }
    public List<Trade> getTradesByPortfolio(Long portfolioId){
        return tradeRepository.findTradeByPortfolioId(portfolioId);
    }

    public Trade getTradeById(Long tradeId){
        return tradeRepository.findById(tradeId).orElseThrow(()-> new RuntimeException("Trade could not be found for id: " + tradeId));
    }
    private void refreshPortfolioSnapshot(Portfolio portfolio) {
        List<Holding> holdings = holdingRepository.findByPortfolioId(portfolio.getId());

        BigDecimal holdingsValue = BigDecimal.ZERO;
        BigDecimal totalCostBasis = BigDecimal.ZERO;

        for (Holding holding : holdings) {
            BigDecimal quantity = holding.getQuantity();
            BigDecimal currentPrice = stockService.getQuote(holding.getStock().getSymbol())
                    .map(quote -> BigDecimal.valueOf(quote.currentPrice()))
                    .orElse(holding.getAverageCostBasis());

            holdingsValue = holdingsValue.add(currentPrice.multiply(quantity));
            totalCostBasis = totalCostBasis.add(holding.getTotalCostBasis());
        }

        BigDecimal totalMarketValue = holdingsValue.setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalValue = portfolio.getCashBalance().add(holdingsValue).setScale(2, RoundingMode.HALF_UP);
        BigDecimal investedAmount = totalCostBasis.add(portfolio.getCashBalance());
        BigDecimal profitLossAmount = totalValue.subtract(investedAmount).setScale(2, RoundingMode.HALF_UP);

        BigDecimal profitLossPercent = BigDecimal.ZERO;
        if (investedAmount.compareTo(BigDecimal.ZERO) > 0) {
            profitLossPercent = profitLossAmount
                    .divide(investedAmount, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        portfolio.setTotalMarketValue(totalMarketValue);
        portfolio.setTotalGainLoss(profitLossAmount);
        portfolio.setTotalGainLossPercentage(profitLossPercent);
        portfolioRepository.save(portfolio);

        LocalDateTime snapshotTime = LocalDateTime.now();
        LocalDate snapshotDate = snapshotTime.toLocalDate();

        PortfolioValuation valuation = portfolioValuationRepository
                .findTopByPortfolio_IdOrderBySnapshotTimeDesc(portfolio.getId())
                .filter(existingValuation -> existingValuation.getSnapshotTime() != null
                        && existingValuation.getSnapshotTime().toLocalDate().isEqual(snapshotDate))
                .orElseGet(PortfolioValuation::new);

        valuation.setPortfolio(portfolio);
        valuation.setSnapshotTime(snapshotTime);
        valuation.setTotalValue(totalValue);
        valuation.setProfitLossAmount(profitLossAmount);
        valuation.setProfitLossPercent(profitLossPercent);

        portfolioValuationRepository.save(valuation);
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

        portfolioRepository.save(portfolio);

        Trade trade = new Trade();
        trade.setPortfolio(portfolio);
        trade.setStock(stock);
        trade.setSide(createTradeRequest.getSide());
        trade.setQuantity(tradeQuantity);
        trade.setPricePerShare(pricePerShare);
        trade.setTotalAmount(tradeCost);

        Trade savedTrade = tradeRepository.save(trade);

        TransactionType txType = createTradeRequest.getSide() == Side.BUY
                ? TransactionType.BUY_STOCK
                : TransactionType.SELL_STOCK;
        transactionService.logTransaction(portfolio, tradeCost, txType);

        refreshPortfolioSnapshot(portfolio);

        return savedTrade;
    }
}

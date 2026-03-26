package com.tradetracker.pms.service.portfolio;

import com.tradetracker.pms.dto.request.portfolio.CreatePortfolioRequest;
import com.tradetracker.pms.dto.request.portfolio.UpdatePortfolioRequest;
import com.tradetracker.pms.dto.request.portfolio.trade.CreateTradeRequest;
import com.tradetracker.pms.dto.response.portfolio.PortfolioResponse;
import com.tradetracker.pms.entity.Portfolio;
import com.tradetracker.pms.entity.PortfolioValuation;
import com.tradetracker.pms.entity.Trade;
import com.tradetracker.pms.entity.TransactionType;
import com.tradetracker.pms.entity.User;
import com.tradetracker.pms.repository.PortfolioRepository;
import com.tradetracker.pms.repository.PortfolioValuationRepository;
import com.tradetracker.pms.repository.UserRepository;
import com.tradetracker.pms.service.transaction.TransactionService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;


@Service
public class PortfolioService {
    PortfolioRepository portfolioRepository;
    UserRepository userRepository;
    PortfolioValuationRepository portfolioValuationRepository;
    TransactionService transactionService;
    public PortfolioService(PortfolioRepository portfolioRepository, UserRepository userRepository, PortfolioValuationRepository portfolioValuationRepository, TransactionService transactionService) {
        this.portfolioRepository = portfolioRepository;
        this.userRepository = userRepository;
        this.portfolioValuationRepository = portfolioValuationRepository;
        this.transactionService = transactionService;
    }
    public List<Portfolio> getPortfolioByUser(String email){
        User user = userRepository.findByEmail(email).orElseThrow(()-> new RuntimeException("User does not exist"));
        return portfolioRepository.findByUserId(user.getId());
    }
    public PortfolioResponse getPortfolioById(Long id){
        Portfolio portfolio = portfolioRepository.findById(id)
                .orElseThrow(()-> new RuntimeException(("portfolio not found")));
        return new PortfolioResponse(
                portfolio.getId(),
                portfolio.getName(),
                portfolio.getCashBalance(),
                portfolio.getTotalMarketValue(),
                portfolio.getTotalGainLoss(),
                portfolio.getTotalGainLossPercentage(),
                portfolio.isDefault(),
                portfolio.getCreatedAt(),
                portfolio.getUpdatedAt());
    }
    public List<PortfolioValuation> getPortfolioValuationByIId(long id){
        return portfolioValuationRepository.findByPortfolio_IdOrderBySnapshotTimeAsc(id);
    }
    public Portfolio getDefaultPortfolioByUser(String email){
        User user =  userRepository.findByEmail(email)
                .orElseThrow(()->new RuntimeException("User cannot be found"));

        return portfolioRepository.findByUserIdAndIsDefault(user.getId(), true)
                .orElse(null);
    }
    public PortfolioResponse createPortfolio(CreatePortfolioRequest createPortfolioRequest, String email){
        User user =  userRepository.findByEmail(email)
                .orElseThrow(()->new RuntimeException("User cannot be found"));

        if(createPortfolioRequest.isDefault()){
            Portfolio prevDefaultPortfolio = portfolioRepository.findByUserIdAndIsDefault(user.getId(), createPortfolioRequest.isDefault())
                    .orElse(null);
            if(prevDefaultPortfolio != null){
                prevDefaultPortfolio.setDefault(false);
                portfolioRepository.save(prevDefaultPortfolio);
            }
        }


        Portfolio portfolio = new Portfolio();
        portfolio.setUser(user);
        portfolio.setName(createPortfolioRequest.getName());
        portfolio.setCashBalance(createPortfolioRequest.getCashBalance());
        portfolio.setDefault(createPortfolioRequest.isDefault());
        Portfolio newPortfolio = portfolioRepository.save(portfolio);

        if (newPortfolio.getCashBalance().compareTo(BigDecimal.ZERO) > 0) {
            transactionService.logTransaction(newPortfolio, newPortfolio.getCashBalance(), TransactionType.ADD_FUNDS);
        }

        return new PortfolioResponse(
                newPortfolio.getId(),
                newPortfolio.getName(),
                newPortfolio.getCashBalance(),
                newPortfolio.getTotalMarketValue(),
                newPortfolio.getTotalGainLoss(),
                newPortfolio.getTotalGainLossPercentage(),
                newPortfolio.isDefault(),
                newPortfolio.getCreatedAt(),
                newPortfolio.getUpdatedAt()
        );
    }
    public PortfolioResponse updatePortfolioById(Long id, UpdatePortfolioRequest updatePortfolioRequest, String email){
        User user = userRepository.findByEmail(email).orElseThrow(()->new RuntimeException("This user does not exist"));
        Portfolio portfolio = portfolioRepository.findById(id).orElseThrow(()->new RuntimeException("Portfolio not found"));

        if(updatePortfolioRequest.isDefault() && !portfolio.isDefault()){
            Portfolio prevDefaultPortfolio = portfolioRepository.findByUserIdAndIsDefault(user.getId(), true)
                    .orElse(null);
            if(prevDefaultPortfolio != null && !prevDefaultPortfolio.getId().equals(portfolio.getId())){
                prevDefaultPortfolio.setDefault(false);
                portfolioRepository.save(prevDefaultPortfolio);
            }
        }

        BigDecimal oldBalance = portfolio.getCashBalance();
        BigDecimal newBalance = updatePortfolioRequest.getCashBalance();

        portfolio.setName(updatePortfolioRequest.getName());
        portfolio.setCashBalance(newBalance);
        portfolio.setDefault(updatePortfolioRequest.isDefault());

        Portfolio updatedPortfolio = portfolioRepository.save(portfolio);

        BigDecimal difference = newBalance.subtract(oldBalance);
        if (difference.compareTo(BigDecimal.ZERO) > 0) {
            transactionService.logTransaction(updatedPortfolio, difference, TransactionType.ADD_FUNDS);
        } else if (difference.compareTo(BigDecimal.ZERO) < 0) {
            transactionService.logTransaction(updatedPortfolio, difference.abs(), TransactionType.WITHDRAWAL);
        }
        return new PortfolioResponse(
                updatedPortfolio.getId(),
                updatedPortfolio.getName(),
                updatedPortfolio.getCashBalance(),
                updatedPortfolio.getTotalMarketValue(),
                updatedPortfolio.getTotalGainLoss(),
                updatedPortfolio.getTotalGainLossPercentage(),
                updatedPortfolio.isDefault(),
                updatedPortfolio.getCreatedAt(),
                updatedPortfolio.getUpdatedAt()
        );
    }
    public PortfolioResponse addFunds(Long id, BigDecimal amount) {
        Portfolio portfolio = portfolioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));

        portfolio.setCashBalance(portfolio.getCashBalance().add(amount));
        Portfolio updatedPortfolio = portfolioRepository.save(portfolio);

        transactionService.logTransaction(updatedPortfolio, amount, TransactionType.ADD_FUNDS);

        return new PortfolioResponse(
                updatedPortfolio.getId(),
                updatedPortfolio.getName(),
                updatedPortfolio.getCashBalance(),
                updatedPortfolio.getTotalMarketValue(),
                updatedPortfolio.getTotalGainLoss(),
                updatedPortfolio.getTotalGainLossPercentage(),
                updatedPortfolio.isDefault(),
                updatedPortfolio.getCreatedAt(),
                updatedPortfolio.getUpdatedAt()
        );
    }

    public void deletePortfolioById(Long id){
        Portfolio portfolio = portfolioRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Portfolio not found"));

        portfolioRepository.delete(portfolio);

    }


}

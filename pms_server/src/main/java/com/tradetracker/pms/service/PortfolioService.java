package com.tradetracker.pms.service;

import com.tradetracker.pms.dto.request.portfolio.CreatePortfolioRequest;
import com.tradetracker.pms.dto.request.portfolio.UpdatePortfolioRequest;
import com.tradetracker.pms.dto.response.portfolio.PortfolioResponse;
import com.tradetracker.pms.entity.Portfolio;
import com.tradetracker.pms.entity.User;
import com.tradetracker.pms.repository.PortfolioRepository;
import com.tradetracker.pms.repository.UserRepository;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;

import javax.sound.sampled.Port;
import java.util.List;


@Service
public class PortfolioService {
    PortfolioRepository portfolioRepository;
    UserRepository userRepository;
    public PortfolioService(PortfolioRepository portfolioRepository, UserRepository userRepository) {
        this.portfolioRepository = portfolioRepository;
        this.userRepository = userRepository;
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

        portfolio.setName(updatePortfolioRequest.getName());
        portfolio.setCashBalance(updatePortfolioRequest.getCashBalance());
        portfolio.setDefault(updatePortfolioRequest.isDefault());

        Portfolio updatedPortfolio = portfolioRepository.save(portfolio);
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

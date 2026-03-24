package com.tradetracker.pms.controller;

import com.tradetracker.pms.dto.request.portfolio.CreatePortfolioRequest;
import com.tradetracker.pms.dto.request.portfolio.UpdatePortfolioRequest;
import com.tradetracker.pms.dto.request.portfolio.trade.CreateTradeRequest;
import com.tradetracker.pms.dto.response.portfolio.PortfolioResponse;
import com.tradetracker.pms.entity.Holding;
import com.tradetracker.pms.entity.Portfolio;
import com.tradetracker.pms.entity.PortfolioValuation;
import com.tradetracker.pms.entity.Trade;
import com.tradetracker.pms.service.holding.HoldingService;
import com.tradetracker.pms.service.portfolio.PortfolioService;
import com.tradetracker.pms.service.portfoliovaluation.PortfolioValuationService;
import com.tradetracker.pms.service.trade.TradeService;
import jakarta.validation.Valid;
import org.apache.coyote.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portfolios")
public class PortfolioController {
    PortfolioService portfolioService;
    TradeService tradeService;
    HoldingService holdingService;
    PortfolioValuationService portfolioValuationService;
    public PortfolioController(PortfolioService portfolioService, TradeService tradeService, HoldingService holdingService, PortfolioValuationService portfolioValuationService){
        this.holdingService = holdingService;
        this.portfolioService= portfolioService;
        this.tradeService = tradeService;
        this.portfolioValuationService = portfolioValuationService;
    }
    @GetMapping
    public ResponseEntity<List<Portfolio>> getPortfolios(Authentication authentication){
        String email = authentication.getName();
        List<Portfolio> portfolios=  portfolioService.getPortfolioByUser(email);
        return ResponseEntity.ok(portfolios);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PortfolioResponse> getPortfolioById(@PathVariable Long id){
        PortfolioResponse portfolioResponse= portfolioService.getPortfolioById(id);

        return ResponseEntity.ok(portfolioResponse);
    }
    @GetMapping("/default")
    public ResponseEntity<Portfolio> getDefaultPortfolio(Authentication authentication){
        String email = authentication.getName();
        Portfolio portfolio = portfolioService.getDefaultPortfolioByUser(email);
        return ResponseEntity.ok(portfolio);
    }
    @PostMapping
    public ResponseEntity<PortfolioResponse> createPortfolio(
            @Valid @RequestBody CreatePortfolioRequest createPortfolioRequest,
            Authentication authentication){
        String email = authentication.getName();
        PortfolioResponse newPortfolio = portfolioService.createPortfolio(createPortfolioRequest, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(newPortfolio);
    }
    @PutMapping("/{id}")
    public ResponseEntity<PortfolioResponse> updatePortfolio(
            @Valid @PathVariable Long id,
            @RequestBody UpdatePortfolioRequest updatePortfolioRequest,
            Authentication authentication
    ){
        String email = authentication.getName();
        PortfolioResponse newPortfolio = portfolioService.updatePortfolioById(id, updatePortfolioRequest, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(newPortfolio);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePortfolio(@PathVariable Long id){

        return ResponseEntity.noContent().build();
    }

    //=========================================================================================
    //Trades section
    @GetMapping("/{id}/trades")
    public ResponseEntity<List<Trade>> getTradesByPortfolio(@PathVariable Long id){
        return ResponseEntity.ok(tradeService.getTradesByPortfolio(id));
    }

    @GetMapping("/{id}/trades/{tradeid}")
    public ResponseEntity<Trade> getTradeById(@PathVariable Long id, @PathVariable Long tradeid){
        return ResponseEntity.ok(tradeService.getTradeById(tradeid));
    }

    @PostMapping("/{id}/trades")
    public ResponseEntity<Trade> createTrade(@PathVariable Long id, @Valid @RequestBody CreateTradeRequest createTradeRequest){
        return ResponseEntity.status(HttpStatus.CREATED).body(tradeService.createTrade(id, createTradeRequest));
    }

    //======================================================================================
    //Holdings section ----> implemented in
    @GetMapping("/{id}/holdings")
    public ResponseEntity<List<Holding>> getHoldingsByPortfolio(@PathVariable Long id){
        List<Holding> holdings = holdingService.getHoldigsByPortfolioId(id);
        return ResponseEntity.ok(holdings);
    }
    //======================================================================================
//    //Portfolio Valuations (aka -> profit/loss data)
    @GetMapping("/{id}/valuations")
    public ResponseEntity<List<PortfolioValuation>> getPortfolioValuations(@PathVariable Long id){
        List<PortfolioValuation> valuations = portfolioService.getPortfolioValuationByIId(id);
        return ResponseEntity.ok(valuations);
    }
}

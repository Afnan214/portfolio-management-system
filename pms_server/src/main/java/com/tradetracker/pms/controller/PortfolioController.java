package com.tradetracker.pms.controller;

import com.tradetracker.pms.dto.request.portfolio.CreatePortfolioRequest;
import com.tradetracker.pms.dto.request.portfolio.UpdatePortfolioRequest;
import com.tradetracker.pms.dto.response.portfolio.PortfolioResponse;
import com.tradetracker.pms.entity.Portfolio;
import com.tradetracker.pms.service.PortfolioService;
import jakarta.validation.Valid;
import org.apache.coyote.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.function.EntityResponse;

import java.util.List;

@RestController
@RequestMapping("/api/portfolios")
public class PortfolioController {
    PortfolioService portfolioService;
    public PortfolioController(PortfolioService portfolioService){
        this.portfolioService= portfolioService;
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

}

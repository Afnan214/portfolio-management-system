package com.tradetracker.pms.dto.response.portfolio;

import com.tradetracker.pms.entity.User;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PortfolioResponse {
    private Long id;
    private String name;
    private BigDecimal cashBalance;
    private BigDecimal totalMarketValue;
    private BigDecimal totalGainLoss;
    private BigDecimal totalGainLossPercentage;
    private boolean isDefault;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public PortfolioResponse(Long id, String name, BigDecimal cashBalance, BigDecimal totalMarketValue, BigDecimal totalGainLoss, BigDecimal totalGainLossPercentage, boolean isDefault, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.cashBalance = cashBalance;
        this.totalMarketValue = totalMarketValue;
        this.totalGainLoss = totalGainLoss;
        this.totalGainLossPercentage = totalGainLossPercentage;
        this.isDefault = isDefault;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getCashBalance() {
        return cashBalance;
    }

    public void setCashBalance(BigDecimal cashBalance) {
        this.cashBalance = cashBalance;
    }

    public BigDecimal getTotalGainLoss() {
        return totalGainLoss;
    }

    public void setTotalGainLoss(BigDecimal totalGainLoss) {
        this.totalGainLoss = totalGainLoss;
    }

    public BigDecimal getTotalMarketValue() {
        return totalMarketValue;
    }

    public void setTotalMarketValue(BigDecimal totalMarketValue) {
        this.totalMarketValue = totalMarketValue;
    }

    public BigDecimal getTotalGainLossPercentage() {
        return totalGainLossPercentage;
    }

    public void setTotalGainLossPercentage(BigDecimal totalGainLossPercentage) {
        this.totalGainLossPercentage = totalGainLossPercentage;
    }

    public boolean isDefault() {
        return isDefault;
    }

    public void setDefault(boolean aDefault) {
        isDefault = aDefault;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

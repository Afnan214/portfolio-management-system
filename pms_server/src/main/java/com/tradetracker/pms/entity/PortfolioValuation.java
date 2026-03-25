package com.tradetracker.pms.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "portfolio_valuations")
public class PortfolioValuation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @Column(name = "snapshot_time", nullable = false)
    private LocalDateTime snapshotTime;

    @Column(name = "total_value", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalValue;

    @Column(name = "profit_loss_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal profitLossAmount;

    @Column(name = "profit_loss_percent", nullable = false, precision = 8, scale = 2)
    private BigDecimal profitLossPercent;

    public PortfolioValuation() {
    }

    public PortfolioValuation(Long id, Portfolio portfolio, LocalDateTime snapshotTime,
                              BigDecimal totalValue, BigDecimal profitLossAmount,
                              BigDecimal profitLossPercent) {
        this.id = id;
        this.portfolio = portfolio;
        this.snapshotTime = snapshotTime;
        this.totalValue = totalValue;
        this.profitLossAmount = profitLossAmount;
        this.profitLossPercent = profitLossPercent;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Portfolio getPortfolio() {
        return portfolio;
    }

    public void setPortfolio(Portfolio portfolio) {
        this.portfolio = portfolio;
    }

    public LocalDateTime getSnapshotTime() {
        return snapshotTime;
    }

    public void setSnapshotTime(LocalDateTime snapshotTime) {
        this.snapshotTime = snapshotTime;
    }

    public BigDecimal getTotalValue() {
        return totalValue;
    }

    public void setTotalValue(BigDecimal totalValue) {
        this.totalValue = totalValue;
    }

    public BigDecimal getProfitLossAmount() {
        return profitLossAmount;
    }

    public void setProfitLossAmount(BigDecimal profitLossAmount) {
        this.profitLossAmount = profitLossAmount;
    }

    public BigDecimal getProfitLossPercent() {
        return profitLossPercent;
    }

    public void setProfitLossPercent(BigDecimal profitLossPercent) {
        this.profitLossPercent = profitLossPercent;
    }
}
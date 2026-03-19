package com.tradetracker.pms.entity;


import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "portfolios")
public class Portfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length=100)
    private String name;

    @Column(nullable = false)
    private BigDecimal cashBalance = new BigDecimal("10000.00");

    // addition of every stock (quantity*currentMarketPrice) in this portfolio
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalMarketValue = new BigDecimal(0.00);

    // profit or loss in dollars
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalGainLoss = new BigDecimal(0.00);

    // profit or loss in percentage
    @Column(nullable = false, precision = 7, scale=2)
    private BigDecimal TotalGainLossPercentage = new BigDecimal(0.00);

    //whether this portfolio is users default portfolio
    @Column(nullable = false)
    private boolean isDefault = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public Portfolio(){}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public BigDecimal getTotalMarketValue() {
        return totalMarketValue;
    }

    public void setTotalMarketValue(BigDecimal totalMarketValue) {
        this.totalMarketValue = totalMarketValue;
    }

    public BigDecimal getTotalGainLoss() {
        return totalGainLoss;
    }

    public void setTotalGainLoss(BigDecimal totalGainLoss) {
        this.totalGainLoss = totalGainLoss;
    }

    public BigDecimal getTotalGainLossPercentage() {
        return TotalGainLossPercentage;
    }

    public void setTotalGainLossPercentage(BigDecimal totalGainLossPercentage) {
        TotalGainLossPercentage = totalGainLossPercentage;
    }

    public boolean isDefault() {
        return isDefault;
    }

    public void setDefault(boolean aDefault) {
        isDefault = aDefault;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

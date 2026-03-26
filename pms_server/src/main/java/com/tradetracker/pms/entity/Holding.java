package com.tradetracker.pms.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "holdings")
public class Holding {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "stock_id")
    private Stock stock;

    @ManyToOne
    @JoinColumn(name = "portfolio_id")
    private Portfolio portfolio;

    @Column(nullable = false)
    private BigDecimal quantity;

    @Column(nullable = false)
    private BigDecimal averageCostBasis;

    @Column(nullable = false)
    private BigDecimal totalCostBasis; // total amount invested for this stock


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Stock getStock() {
        return stock;
    }

    public void setStock(Stock stock) {
        this.stock = stock;
    }

    public Portfolio getPortfolio() {
        return portfolio;
    }

    public void setPortfolio(Portfolio portfolio) {
        this.portfolio = portfolio;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getAverageCostBasis() {
        return averageCostBasis;
    }

    public void setAverageCostBasis(BigDecimal averageCostBasis) {
        this.averageCostBasis = averageCostBasis;
    }

    public BigDecimal getTotalCostBasis() {
        return totalCostBasis;
    }

    public void setTotalCostBasis(BigDecimal totalCostBasis) {
        this.totalCostBasis = totalCostBasis;
    }

}

package com.tradetracker.pms.dto.request.portfolio.trade;

import com.tradetracker.pms.entity.Side;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public class CreateTradeRequest {

    @NotNull(message="Must provide a stock id")
    private Long stockId;

    @NotBlank(message="Must provide BUY or SELL")
    private Side side;

    @NotNull(message = "quantity is required")
    @Positive(message = "Cash balance must be zero or positive")
    private BigDecimal quantity;


    @NotNull(message = "price per share is required")
    @Positive(message = "Cash balance must be zero or positive")
    private BigDecimal pricePerShare;
    public CreateTradeRequest(Long stockId, Side sideEnum, BigDecimal quantity, BigDecimal pricePerShare) {
        this.stockId = stockId;
        this.side = sideEnum;
        this.quantity = quantity;
        this.pricePerShare = pricePerShare;
    }

    public Long getStockId() {
        return stockId;
    }

    public void setStockId(Long stockId) {
        this.stockId = stockId;
    }

    public Side getSide() {
        return side;
    }

    public void setSide(Side side) {
        this.side = side;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getPricePerShare() {
        return pricePerShare;
    }

    public void setPricePerShare(BigDecimal pricePerShare) {
        this.pricePerShare = pricePerShare;
    }
}

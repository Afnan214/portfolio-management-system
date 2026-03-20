package com.tradetracker.pms.dto.request.portfolio.trade;

import com.tradetracker.pms.entity.Side;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public class CreateTradeRequest {

    @NotNull(message="Must provide a symbol")
    private String symbol;

    @NotNull(message="Must provide BUY or SELL")
    private Side side;

    @NotNull(message = "quantity is required")
    @Positive(message = "Cash balance must be zero or positive")
    private BigDecimal quantity;


    @NotNull(message = "price per share is required")
    @Positive(message = "Cash balance must be zero or positive")
    private BigDecimal pricePerShare;
    public CreateTradeRequest(String symbol, Side sideEnum, BigDecimal quantity, BigDecimal pricePerShare) {
        this.symbol = symbol;
        this.side = sideEnum;
        this.quantity = quantity;
        this.pricePerShare = pricePerShare;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
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

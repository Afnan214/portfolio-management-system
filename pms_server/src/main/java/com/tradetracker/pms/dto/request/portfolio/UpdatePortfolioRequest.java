package com.tradetracker.pms.dto.request.portfolio;

import com.tradetracker.pms.entity.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class UpdatePortfolioRequest {

    @NotBlank(message= "User id is requried")
    private Long userId;

    @NotBlank(message = "Portfolio nmae is required")
    private String name;

    @NotNull(message = "Cash balance is required")
    @PositiveOrZero(message = "Cash balance must be zero or positive")
    private BigDecimal cashBalance;

    private boolean isDefault;


    public UpdatePortfolioRequest(Long userId, String name, BigDecimal cashBalance, boolean isDefault) {

        this.name = name;
        this.cashBalance = cashBalance;

        this.isDefault = isDefault;
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

    public boolean isDefault() {
        return isDefault;
    }

    public void setDefault(boolean aDefault) {
        isDefault = aDefault;
    }

}

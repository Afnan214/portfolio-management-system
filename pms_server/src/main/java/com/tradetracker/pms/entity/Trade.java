package com.tradetracker.pms.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "trades")
public class Trade {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    @Enumerated(EnumType.STRING)
    private Side side;

    @Column(nullable = false, )
    private BigDecimal quantity;

    @Column(nullable = false)
    private BigDecimal pricePerShare
}

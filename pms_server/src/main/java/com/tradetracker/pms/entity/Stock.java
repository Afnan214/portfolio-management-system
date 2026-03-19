package com.tradetracker.pms.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "stocks")
public class Stock {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "symbol", nullable = false, unique = true, length = 10)
  private String symbol;

  @Column(name = "company_name", nullable = false, length = 255)
  private String companyName;

  @Column(name = "industry", length = 255)
  private String industry;

  @Column(name = "sector", length = 255)
  private String sector;

  @CreationTimestamp
  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  public Stock() {
  }

}

package com.tradetracker.pms.dto.response.watchlist;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WatchlistResponse {

  private Long id;
  private Long userId;
  private String name;
  private String description;
  private boolean isDefault;
  private List<Long> stockIds;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}

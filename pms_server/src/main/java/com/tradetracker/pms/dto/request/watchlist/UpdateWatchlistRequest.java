package com.tradetracker.pms.dto.request.watchlist;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateWatchlistRequest {

  @NotBlank(message = "Watchlist name is required")
  @Size(max = 100, message = "Watchlist name must be 100 characters or less")
  private String name;

  @Size(max = 500, message = "Description must be 500 characters or less")
  private String description;

  private boolean isDefault;
}

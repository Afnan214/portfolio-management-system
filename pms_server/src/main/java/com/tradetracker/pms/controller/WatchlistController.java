package com.tradetracker.pms.controller;

import com.tradetracker.pms.dto.request.watchlist.CreateWatchlistRequest;
import com.tradetracker.pms.dto.request.watchlist.UpdateWatchlistRequest;
import com.tradetracker.pms.dto.response.watchlist.WatchlistResponse;
import com.tradetracker.pms.service.watchlist.WatchlistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/watchlists")
@RequiredArgsConstructor
public class WatchlistController {

  private final WatchlistService watchlistService;

  @GetMapping
  public ResponseEntity<List<WatchlistResponse>> getWatchlists(Authentication authentication) {
    String email = authentication.getName();
    return ResponseEntity.ok(watchlistService.getWatchlistsByUser(email));
  }

  @GetMapping("/default")
  public ResponseEntity<WatchlistResponse> getDefaultWatchlist(Authentication authentication) {
    String email = authentication.getName();
    return ResponseEntity.ok(watchlistService.getDefaultWatchlist(email));
  }

  @GetMapping("/{id}")
  public ResponseEntity<WatchlistResponse> getWatchlistById(@PathVariable Long id,
      Authentication authentication) {
    String email = authentication.getName();
    return ResponseEntity.ok(watchlistService.getWatchlistById(id, email));
  }

  @PostMapping
  public ResponseEntity<WatchlistResponse> createWatchlist(
      @Valid @RequestBody CreateWatchlistRequest request,
      Authentication authentication
  ) {
    String email = authentication.getName();
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(watchlistService.createWatchlist(request, email));
  }

  @PutMapping("/{id}")
  public ResponseEntity<WatchlistResponse> updateWatchlist(
      @PathVariable Long id,
      @Valid @RequestBody UpdateWatchlistRequest request,
      Authentication authentication
  ) {
    String email = authentication.getName();
    return ResponseEntity.ok(watchlistService.updateWatchlist(id, request, email));
  }

  @PostMapping("/{id}/stocks/{stockId}")
  public ResponseEntity<WatchlistResponse> addStockToWatchlist(
      @PathVariable Long id,
      @PathVariable Long stockId,
      Authentication authentication
  ) {
    String email = authentication.getName();
    return ResponseEntity.ok(watchlistService.addStockToWatchlist(id, stockId, email));
  }

  @DeleteMapping("/{id}/stocks/{stockId}")
  public ResponseEntity<WatchlistResponse> removeStockFromWatchlist(
      @PathVariable Long id,
      @PathVariable Long stockId,
      Authentication authentication
  ) {
    String email = authentication.getName();
    return ResponseEntity.ok(watchlistService.removeStockFromWatchlist(id, stockId, email));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteWatchlist(@PathVariable Long id,
      Authentication authentication) {
    String email = authentication.getName();
    watchlistService.deleteWatchlist(id, email);
    return ResponseEntity.noContent().build();
  }
}

package com.tradetracker.pms.service.watchlist;

import com.tradetracker.pms.dto.request.watchlist.CreateWatchlistRequest;
import com.tradetracker.pms.dto.request.watchlist.UpdateWatchlistRequest;
import com.tradetracker.pms.dto.response.watchlist.WatchlistResponse;
import com.tradetracker.pms.entity.Stock;
import com.tradetracker.pms.entity.User;
import com.tradetracker.pms.entity.Watchlist;
import com.tradetracker.pms.repository.StockRepository;
import com.tradetracker.pms.repository.UserRepository;
import com.tradetracker.pms.repository.WatchlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WatchlistService {

  private final WatchlistRepository watchlistRepository;
  private final UserRepository userRepository;
  private final StockRepository stockRepository;

  @Transactional(readOnly = true)
  public List<WatchlistResponse> getWatchlistsByUser(String email) {
    User user = getUserByEmail(email);
    return watchlistRepository.findByUserId(user.getId())
        .stream()
        .map(this::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public WatchlistResponse getWatchlistById(Long watchlistId, String email) {
    User user = getUserByEmail(email);
    Watchlist watchlist = getWatchlistForUser(watchlistId, user.getId());
    return toResponse(watchlist);
  }

  @Transactional(readOnly = true)
  public WatchlistResponse getDefaultWatchlist(String email) {
    User user = getUserByEmail(email);
    Watchlist watchlist = watchlistRepository.findByUserIdAndIsDefault(user.getId(), true)
        .orElseThrow(() -> new RuntimeException("Default watchlist not found"));
    return toResponse(watchlist);
  }

  @Transactional
  public WatchlistResponse createWatchlist(CreateWatchlistRequest request, String email) {
    User user = getUserByEmail(email);
    updateExistingDefaultIfNeeded(user.getId(), request.isDefault(), null);

    Watchlist watchlist = new Watchlist();
    watchlist.setUser(user);
    watchlist.setName(request.getName());
    watchlist.setDescription(request.getDescription());
    watchlist.setDefault(request.isDefault());

    return toResponse(watchlistRepository.save(watchlist));
  }

  @Transactional
  public WatchlistResponse updateWatchlist(Long watchlistId, UpdateWatchlistRequest request,
      String email) {
    User user = getUserByEmail(email);
    Watchlist watchlist = getWatchlistForUser(watchlistId, user.getId());

    updateExistingDefaultIfNeeded(user.getId(), request.isDefault(), watchlist.getId());

    watchlist.setName(request.getName());
    watchlist.setDescription(request.getDescription());
    watchlist.setDefault(request.isDefault());

    return toResponse(watchlistRepository.save(watchlist));
  }

  @Transactional
  public WatchlistResponse addStockToWatchlist(Long watchlistId, Long stockId, String email) {
    User user = getUserByEmail(email);
    Watchlist watchlist = getWatchlistForUser(watchlistId, user.getId());
    Stock stock = stockRepository.findById(stockId)
        .orElseThrow(() -> new RuntimeException("Stock not found"));

    watchlist.getStocks().add(stock);

    return toResponse(watchlistRepository.save(watchlist));
  }

  @Transactional
  public WatchlistResponse removeStockFromWatchlist(Long watchlistId, Long stockId, String email) {
    User user = getUserByEmail(email);
    Watchlist watchlist = getWatchlistForUser(watchlistId, user.getId());
    Stock stock = stockRepository.findById(stockId)
        .orElseThrow(() -> new RuntimeException("Stock not found"));

    boolean removed = watchlist.getStocks().remove(stock);
    if (!removed) {
      throw new RuntimeException("Stock is not in this watchlist");
    }

    return toResponse(watchlistRepository.save(watchlist));
  }

  @Transactional
  public void deleteWatchlist(Long watchlistId, String email) {
    User user = getUserByEmail(email);
    Watchlist watchlist = getWatchlistForUser(watchlistId, user.getId());
    watchlistRepository.delete(watchlist);
  }

  private User getUserByEmail(String email) {
    return userRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("User not found"));
  }

  private Watchlist getWatchlistForUser(Long watchlistId, Long userId) {
    return watchlistRepository.findByIdAndUserId(watchlistId, userId)
        .orElseThrow(() -> new RuntimeException("Watchlist not found"));
  }

  private void updateExistingDefaultIfNeeded(Long userId, boolean requestedDefault,
      Long currentWatchlistId) {
    if (!requestedDefault) {
      return;
    }

    watchlistRepository.findByUserIdAndIsDefault(userId, true)
        .filter(existingDefault -> currentWatchlistId == null || !existingDefault.getId()
            .equals(currentWatchlistId))
        .ifPresent(existingDefault -> {
          existingDefault.setDefault(false);
          watchlistRepository.save(existingDefault);
        });
  }

  private WatchlistResponse toResponse(Watchlist watchlist) {
    return new WatchlistResponse(
        watchlist.getId(),
        watchlist.getUser().getId(),
        watchlist.getName(),
        watchlist.getDescription(),
        watchlist.isDefault(),
        watchlist.getStocks().stream()
            .map(Stock::getId)
            .sorted()
            .toList(),
        watchlist.getCreatedAt(),
        watchlist.getUpdatedAt()
    );
  }
}

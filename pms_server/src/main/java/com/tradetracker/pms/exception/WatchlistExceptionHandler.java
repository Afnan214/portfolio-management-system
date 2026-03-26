package com.tradetracker.pms.exception;

import com.tradetracker.pms.controller.WatchlistController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestControllerAdvice(assignableTypes = WatchlistController.class)
public class WatchlistExceptionHandler {

  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<Map<String, String>> handleResponseStatusException(
      ResponseStatusException exception) {
    String message = exception.getReason();
    if (message == null || message.isBlank()) {
      message = "Request failed";
    }

    return ResponseEntity.status(exception.getStatusCode())
        .body(Map.of("message", message));
  }
}

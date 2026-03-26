package com.tradetracker.pms.controller;

import com.tradetracker.pms.entity.Transaction;
import com.tradetracker.pms.service.transaction.TransactionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping("/portfolio/{portfolioId}")
    public ResponseEntity<List<Transaction>> getTransactionsByPortfolio(@PathVariable Long portfolioId) {
        return ResponseEntity.ok(transactionService.getTransactionsByPortfolio(portfolioId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Transaction>> getTransactionsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(transactionService.getTransactionsByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransactionById(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.getTransactionById(id));
    }

    @PostMapping("/portfolio/{portfolioId}")
    public ResponseEntity<Transaction> createTransaction(@PathVariable Long portfolioId, @RequestBody Transaction transaction) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.createTransaction(portfolioId, transaction));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaction> updateTransaction(@PathVariable Long id, @RequestBody Transaction transaction) {
        return ResponseEntity.ok(transactionService.updateTransaction(id, transaction));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }
}

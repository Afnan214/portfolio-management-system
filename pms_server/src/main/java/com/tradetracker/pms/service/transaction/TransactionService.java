package com.tradetracker.pms.service.transaction;

import com.tradetracker.pms.entity.Portfolio;
import com.tradetracker.pms.entity.Transaction;
import com.tradetracker.pms.entity.TransactionType;
import com.tradetracker.pms.repository.PortfolioRepository;
import com.tradetracker.pms.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final PortfolioRepository portfolioRepository;

    public TransactionService(TransactionRepository transactionRepository, PortfolioRepository portfolioRepository) {
        this.transactionRepository = transactionRepository;
        this.portfolioRepository = portfolioRepository;
    }

    public List<Transaction> getTransactionsByPortfolio(Long portfolioId) {
        return transactionRepository.findByPortfolioId(portfolioId);
    }

    public List<Transaction> getTransactionsByUserId(Long userId) {
        Portfolio portfolio = portfolioRepository.findByUserIdAndIsDefault(userId, true)
                .orElseThrow(() -> new RuntimeException("Default portfolio not found for user id: " + userId));
        return transactionRepository.findByPortfolioId(portfolio.getId());
    }

    public Transaction getTransactionById(Long id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found for id: " + id));
    }

    public Transaction createTransaction(Long portfolioId, Transaction transaction) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new RuntimeException("Portfolio not found for id: " + portfolioId));
        transaction.setPortfolio(portfolio);
        return transactionRepository.save(transaction);
    }

    public Transaction updateTransaction(Long id, Transaction updated) {
        Transaction existing = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found for id: " + id));
        existing.setAmount(updated.getAmount());
        existing.setType(updated.getType());
        return transactionRepository.save(existing);
    }

    public void deleteTransaction(Long id) {
        if (!transactionRepository.existsById(id)) {
            throw new RuntimeException("Transaction not found for id: " + id);
        }
        transactionRepository.deleteById(id);
    }

    public void logTransaction(Portfolio portfolio, BigDecimal amount, TransactionType type) {
        Transaction transaction = new Transaction();
        transaction.setPortfolio(portfolio);
        transaction.setAmount(amount);
        transaction.setType(type);
        transactionRepository.save(transaction);
    }
}

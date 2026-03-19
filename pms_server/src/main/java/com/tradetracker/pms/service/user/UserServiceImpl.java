package com.tradetracker.pms.service.user;

import com.tradetracker.pms.dto.request.auth.CreateUserRequest;
import com.tradetracker.pms.dto.response.user.UserResponse;
import com.tradetracker.pms.entity.Portfolio;
import com.tradetracker.pms.entity.User;
import com.tradetracker.pms.repository.PortfolioRepository;
import com.tradetracker.pms.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService{
    private final UserRepository userRepository;
    private final PortfolioRepository portfolioRepository;
    public UserServiceImpl(UserRepository repository, PortfolioRepository portfolioRepository){
        this.userRepository = repository;
        this.portfolioRepository = portfolioRepository;
    }


    @Override
    public UserResponse createUser(CreateUserRequest request) {
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(request.getPassword());
        User savedUser = userRepository.save(user);
        return new UserResponse(savedUser.getId(),
                savedUser.getFirstName(),
                savedUser.getLastName(),
                savedUser.getEmail(),
                savedUser.getCreatedAt(),
                savedUser.getUpdatedAt());
    }


}

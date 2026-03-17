package com.tradetracker.pms.service.user;

import com.tradetracker.pms.dto.request.user.CreateUserRequest;
import com.tradetracker.pms.dto.response.user.UserResponse;

public interface UserService {
    public UserResponse createUser(CreateUserRequest request);
}

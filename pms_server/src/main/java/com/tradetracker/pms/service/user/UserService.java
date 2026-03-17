package com.tradetracker.pms.service.user;

import com.tradetracker.pms.dto.request.auth.CreateUserRequest;
import com.tradetracker.pms.dto.response.user.UserResponse;

public interface UserService {
    public UserResponse createUser(CreateUserRequest request);
}

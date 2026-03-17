package com.tradetracker.pms.controller;

import com.tradetracker.pms.dto.request.auth.CreateUserRequest;
import com.tradetracker.pms.dto.response.user.UserResponse;
import com.tradetracker.pms.service.user.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
    UserService userService;
    public UserController(UserService userService){
        this.userService = userService;
    }
    @GetMapping("/me")
    public ResponseEntity<String> getCurrentUser() {
        return ResponseEntity.ok("You are authenticated");
    }
    @PostMapping("/register")
    public ResponseEntity<UserResponse> createUser(@RequestBody CreateUserRequest createUserRequest){
        UserResponse response = userService.createUser(createUserRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }


}

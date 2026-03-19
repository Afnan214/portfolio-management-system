package com.tradetracker.pms.controller;


import com.tradetracker.pms.service.user.UserService;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
    UserService userService;
    public UserController(UserService userService){
        this.userService = userService;
    }



}

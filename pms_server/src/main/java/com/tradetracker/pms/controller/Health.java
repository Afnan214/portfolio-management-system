package com.tradetracker.pms.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api")
public class Health {
    @GetMapping("/heath")
    public String healthCheck(@RequestParam String param) {
        return new String("Is healthy");
    }

}

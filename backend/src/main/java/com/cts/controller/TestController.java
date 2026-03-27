package com.cts.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/v1")
public class TestController {
    @GetMapping("/customer/test")
    public String customerTest(){
        return "Customer access granted";
    }
    @GetMapping("/admin/test")
    public String adminTest(){
        return "Admin access granted";
    }
}

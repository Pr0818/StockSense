package com.stock_sense.Backend.controller;

import com.stock_sense.Backend.dto.user.UserDetailDto;
import com.stock_sense.Backend.service.AuthService;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final AuthService authService;

    public UserController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserDetailDto> getUsers() {
        return authService.getAllUsers();
    }
}
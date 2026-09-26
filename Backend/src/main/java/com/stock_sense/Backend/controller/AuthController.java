package com.stock_sense.Backend.controller;

import com.stock_sense.Backend.dto.user.AuthResponseDto;
import com.stock_sense.Backend.dto.user.UserDetailDto;
import com.stock_sense.Backend.dto.user.UserRegisterDto;
import com.stock_sense.Backend.dto.user.UserSignInDto;
import com.stock_sense.Backend.security.AppUserDetails;
import com.stock_sense.Backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponseDto register(@Valid @RequestBody UserRegisterDto request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponseDto login(@Valid @RequestBody UserSignInDto request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public UserDetailDto getProfile(@AuthenticationPrincipal AppUserDetails principal) {
        return authService.getProfile(principal.getUsername());
    }
}
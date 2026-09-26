package com.stock_sense.Backend.controller;

import com.stock_sense.Backend.dto.user.PasswordResetConfirmDto;
import com.stock_sense.Backend.dto.user.PasswordResetRequestDto;
import com.stock_sense.Backend.dto.user.PasswordResetResponseDto;
import com.stock_sense.Backend.service.PasswordResetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/password-reset")
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    public PasswordResetController(PasswordResetService passwordResetService) {
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/request")
    public PasswordResetResponseDto requestOtp(@Valid @RequestBody PasswordResetRequestDto request) {
        passwordResetService.requestOtp(request.getEmail());
        return new PasswordResetResponseDto(
                "If an active account exists for that email, a reset code will be sent.");
    }

    @PostMapping("/confirm")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void confirmReset(@Valid @RequestBody PasswordResetConfirmDto request) {
        if (!passwordResetService.confirmReset(request)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired reset code");
        }
    }
}
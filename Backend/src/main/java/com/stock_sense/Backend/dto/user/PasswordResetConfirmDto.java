package com.stock_sense.Backend.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PasswordResetConfirmDto {

    @Email
    @NotBlank
    private String email;

    @NotBlank
    @Pattern(regexp = "^\\d{6}$", message = "OTP must be six digits")
    private String otp;

    @NotBlank
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String newPassword;
}
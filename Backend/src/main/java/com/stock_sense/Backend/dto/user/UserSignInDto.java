package com.stock_sense.Backend.dto.user;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class UserSignInDto {

    private String email;

    @JsonAlias("username")
    private String userName;

    @JsonAlias("mobile")
    private String mobileNo;

    @NotBlank(message = "Password is required")
    private String password;
}

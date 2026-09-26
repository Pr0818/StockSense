package com.stock_sense.Backend.dto.user;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponseDto {

    private String token;
    private String tokenType;
    private UserDetailDto user;
}
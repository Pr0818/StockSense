package com.stock_sense.Backend.dto.user;

import com.stock_sense.Backend.model.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class UserLoginDto {

    private String email;

    private String userName;

    private String mobileNo;

    private String password;

    private UserRole userRole;

}

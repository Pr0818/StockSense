package com.stock_sense.Backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "app_users")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @NotBlank(message = "User name can not be blank")
    @Column(nullable = false,unique = true)
    private String userName;

    @Email(message = "This data should be in valid email format")
    @Column(nullable = false,unique = true)
    private String email;

    @NotBlank(message = "Password can not be blank")
    @Column(nullable = false)
    private String password;

    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$",message = "Invalid mobile number format")
    @Column(nullable = false)
    private String mobileNo;

    @Column(nullable = false)
    private Boolean isActive=true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole userRole;

}

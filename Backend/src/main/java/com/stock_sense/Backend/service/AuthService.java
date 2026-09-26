package com.stock_sense.Backend.service;

import com.stock_sense.Backend.dto.user.AuthResponseDto;
import com.stock_sense.Backend.dto.user.UserDetailDto;
import com.stock_sense.Backend.dto.user.UserRegisterDto;
import com.stock_sense.Backend.dto.user.UserSignInDto;
import com.stock_sense.Backend.model.User;
import com.stock_sense.Backend.model.UserRole;
import com.stock_sense.Backend.repository.UserRepository;
import com.stock_sense.Backend.security.JwtService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponseDto register(UserRegisterDto request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }
        if (userRepository.existsByUserName(request.getUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username is already registered");
        }
        if (userRepository.existsByMobileNo(request.getPhoneNumber())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phone number is already registered");
        }

        User user = new User();
        user.setUserName(request.getUsername().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setMobileNo(request.getPhoneNumber().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setIsActive(true);
        user.setUserRole(UserRole.EMPLOYEE);
        return toAuthResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public AuthResponseDto login(UserSignInDto request) {
        User user = findLoginUser(request);
        if (user == null || !Boolean.TRUE.equals(user.getIsActive())
                || !passwordEncoder.matches(request.getPassword(), user.getPassword())
                || (request.getMobileNo() != null && !request.getMobileNo().equals(user.getMobileNo()))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid login credentials");
        }
        return toAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public UserDetailDto getProfile(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .map(this::toUserDetail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    @Transactional(readOnly = true)
    public List<UserDetailDto> getAllUsers() {
        return userRepository.findAllByOrderByUserNameAsc().stream()
                .map(this::toUserDetail)
                .toList();
    }

    private User findLoginUser(UserSignInDto request) {
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            return userRepository.findByEmailIgnoreCase(request.getEmail().trim()).orElse(null);
        }
        if (request.getUserName() != null && !request.getUserName().isBlank()) {
            return userRepository.findByUserName(request.getUserName().trim()).orElse(null);
        }
        return null;
    }

    private AuthResponseDto toAuthResponse(User user) {
        return new AuthResponseDto(jwtService.generateToken(user), "Bearer", toUserDetail(user));
    }

    private UserDetailDto toUserDetail(User user) {
        return new UserDetailDto(user.getEmail(), user.getUserName(), user.getUserRole().name());
    }
}
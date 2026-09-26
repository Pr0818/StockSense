package com.stock_sense.Backend.service;

import com.stock_sense.Backend.dto.user.PasswordResetConfirmDto;
import com.stock_sense.Backend.model.PasswordResetOtp;
import com.stock_sense.Backend.model.User;
import com.stock_sense.Backend.repository.PasswordResetOtpRepository;
import com.stock_sense.Backend.repository.UserRepository;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PasswordResetService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int MAX_ATTEMPTS = 5;
    private static final Duration REQUEST_COOLDOWN = Duration.ofSeconds(60);

    private final PasswordResetOtpRepository otpRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final long otpLifetimeMinutes;
    private final String fromAddress;

    public PasswordResetService(
            PasswordResetOtpRepository otpRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            ObjectProvider<JavaMailSender> mailSenderProvider,
            @Value("${app.password-reset.otp-minutes:10}") long otpLifetimeMinutes,
            @Value("${app.mail.from:noreply@stocksense.local}") String fromAddress) {
        this.otpRepository = otpRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSenderProvider = mailSenderProvider;
        this.otpLifetimeMinutes = otpLifetimeMinutes;
        this.fromAddress = fromAddress;
    }

    @Transactional
    public void requestOtp(String emailAddress) {
        String email = emailAddress.trim().toLowerCase(Locale.ROOT);
        User user = userRepository.findByEmailIgnoreCase(email).orElse(null);
        if (user == null || !Boolean.TRUE.equals(user.getIsActive())) {
            return;
        }

        Instant now = Instant.now();
        var pendingChallenges = otpRepository.findAllByEmailIgnoreCaseAndConsumedFalse(email);
        boolean coolingDown = pendingChallenges.stream()
                .anyMatch(challenge -> challenge.getCreatedAt().plus(REQUEST_COOLDOWN).isAfter(now));
        if (coolingDown) {
            return;
        }
        pendingChallenges.forEach(challenge -> challenge.setConsumed(true));
        otpRepository.saveAll(pendingChallenges);

        String otp = String.format("%06d", RANDOM.nextInt(1_000_000));
        PasswordResetOtp challenge = new PasswordResetOtp();
        challenge.setEmail(email);
        challenge.setOtpHash(passwordEncoder.encode(otp));
        challenge.setCreatedAt(now);
        challenge.setExpiresAt(now.plus(Duration.ofMinutes(otpLifetimeMinutes)));
        otpRepository.save(challenge);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(email);
        message.setSubject("StockSense password reset code");
        message.setText("Your StockSense password reset code is " + otp
                + ". It expires in " + otpLifetimeMinutes + " minutes.");
        try {
            JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
            if (mailSender == null) {
                throw new ResponseStatusException(
                        HttpStatus.SERVICE_UNAVAILABLE, "Email delivery is not configured");
            }
            mailSender.send(message);
        } catch (MailException exception) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE, "Password reset email could not be sent");
        }
    }

    @Transactional
    public boolean confirmReset(PasswordResetConfirmDto request) {
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        PasswordResetOtp challenge = otpRepository
                .findFirstByEmailIgnoreCaseAndConsumedFalseOrderByCreatedAtDesc(email)
                .orElseThrow(this::invalidOtp);
        if (!challenge.getExpiresAt().isAfter(Instant.now())
                || challenge.getAttempts() >= MAX_ATTEMPTS) {
            challenge.setConsumed(true);
            otpRepository.save(challenge);
            return false;
        }

        challenge.setAttempts(challenge.getAttempts() + 1);
        if (!passwordEncoder.matches(request.getOtp(), challenge.getOtpHash())) {
            otpRepository.save(challenge);
            return false;
        }

        User user = userRepository.findByEmailIgnoreCase(email).orElseThrow(this::invalidOtp);
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        challenge.setConsumed(true);
        otpRepository.save(challenge);
        return true;
    }

    private ResponseStatusException invalidOtp() {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired reset code");
    }
}
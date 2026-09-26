package com.stock_sense.Backend.repository;

import com.stock_sense.Backend.model.PasswordResetOtp;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtp, Long> {

    List<PasswordResetOtp> findAllByEmailIgnoreCaseAndConsumedFalse(String email);

    Optional<PasswordResetOtp> findFirstByEmailIgnoreCaseAndConsumedFalseOrderByCreatedAtDesc(String email);
}
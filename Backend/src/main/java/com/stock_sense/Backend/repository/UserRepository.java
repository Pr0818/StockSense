package com.stock_sense.Backend.repository;

import com.stock_sense.Backend.model.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByUserName(String userName);

    Optional<User> findByMobileNo(String mobileNo);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByUserName(String userName);

    boolean existsByMobileNo(String mobileNo);

    List<User> findAllByOrderByUserNameAsc();
}
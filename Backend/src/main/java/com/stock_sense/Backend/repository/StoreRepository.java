package com.stock_sense.Backend.repository;

import com.stock_sense.Backend.model.Store;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoreRepository extends JpaRepository<Store, Long> {

    boolean existsByStoreNameIgnoreCase(String storeName);
}
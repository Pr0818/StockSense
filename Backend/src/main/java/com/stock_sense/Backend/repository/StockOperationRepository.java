package com.stock_sense.Backend.repository;

import com.stock_sense.Backend.model.StockOperation;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StockOperationRepository extends JpaRepository<StockOperation, Long>,
        JpaSpecificationExecutor<StockOperation> {

        boolean existsBySourceStoreStoreIdOrDestinationStoreStoreId(Long sourceStoreId, Long destinationStoreId);

        @Lock(LockModeType.PESSIMISTIC_WRITE)
        @Query("select operation from StockOperation operation where operation.StockOperationId = :operationId")
        Optional<StockOperation> findLockedById(@Param("operationId") Long operationId);
}
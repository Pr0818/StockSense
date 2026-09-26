package com.stock_sense.Backend.repository;

import com.stock_sense.Backend.model.ItemStock;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ItemStockRepository extends JpaRepository<ItemStock, Long> {

    List<ItemStock> findAllByOrderByItemItemNameAscStoreStoreNameAsc();

    List<ItemStock> findByStoreStoreId(Long storeId);

    List<ItemStock> findByItemItemId(Long itemId);

    boolean existsByStoreStoreId(Long storeId);

    Optional<ItemStock> findByItemItemIdAndStoreStoreId(Long itemId, Long storeId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select stock from ItemStock stock where stock.item.itemId = :itemId and stock.store.storeId = :storeId")
    Optional<ItemStock> findLockedByItemAndStore(
            @Param("itemId") Long itemId, @Param("storeId") Long storeId);
}
package com.stock_sense.Backend.repository;

import com.stock_sense.Backend.model.Item;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemRepository extends JpaRepository<Item, Long> {

    Optional<Item> findByItemSkuIgnoreCase(String itemSku);

    boolean existsByItemSkuIgnoreCase(String itemSku);

    boolean existsByItemSkuIgnoreCaseAndItemIdNot(String itemSku, Long itemId);

    List<Item> findByItemNameContainingIgnoreCaseOrItemSkuContainingIgnoreCase(
            String itemName, String itemSku);
}
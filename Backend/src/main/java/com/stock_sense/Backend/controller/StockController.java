package com.stock_sense.Backend.controller;

import com.stock_sense.Backend.dto.itemStock.StockLevelDto;
import com.stock_sense.Backend.service.InventoryService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stock")
public class StockController {

    private final InventoryService inventoryService;

    public StockController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public List<StockLevelDto> getStock(
            @RequestParam(required = false) Long storeId,
            @RequestParam(required = false) Long itemId,
            @RequestParam(required = false) Boolean lowStockOnly) {
        return inventoryService.getStockLevels(storeId, itemId, lowStockOnly);
    }
}
package com.stock_sense.Backend.service;

import com.stock_sense.Backend.dto.dashboard.DashboardDto;
import com.stock_sense.Backend.dto.stockOperation.StockOperationResponseDto;
import com.stock_sense.Backend.model.ItemStock;
import com.stock_sense.Backend.model.StockOperation;
import com.stock_sense.Backend.repository.ItemStockRepository;
import com.stock_sense.Backend.repository.StockOperationRepository;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private static final Set<String> PENDING = Set.of("DRAFT", "WAITING", "READY");

    private final ItemStockRepository itemStockRepository;
    private final StockOperationRepository operationRepository;
    private final InventoryService inventoryService;

    public DashboardService(
            ItemStockRepository itemStockRepository,
            StockOperationRepository operationRepository,
            InventoryService inventoryService) {
        this.itemStockRepository = itemStockRepository;
        this.operationRepository = operationRepository;
        this.inventoryService = inventoryService;
    }

    @Transactional(readOnly = true)
    public DashboardDto getDashboard(String type, String status, Long storeId, String category) {
        List<ItemStock> stock = itemStockRepository.findAll();
        List<StockOperation> operations = operationRepository.findAll();
        long totalQuantity = stock.stream().mapToLong(ItemStock::getQuantity).sum();
        long inStockProducts = stock.stream()
                .filter(level -> level.getQuantity() > 0)
                .map(level -> level.getItem().getItemId())
                .collect(Collectors.toSet())
                .size();
        Map<Long, Long> quantityByItem = stock.stream().collect(Collectors.groupingBy(
                level -> level.getItem().getItemId(), Collectors.summingLong(ItemStock::getQuantity)));
        Map<Long, Long> reorderByItem = stock.stream().collect(Collectors.toMap(
                level -> level.getItem().getItemId(), ItemStock::getMinQuantity, Math::max));
        long lowStock = quantityByItem.entrySet().stream()
                .filter(entry -> entry.getValue() <= reorderByItem.getOrDefault(entry.getKey(), 0L))
                .count();
        long outOfStock = quantityByItem.values().stream().filter(quantity -> quantity == 0).count();
        long receipts = countPending(operations, "RECEIPT");
        long deliveries = countPending(operations, "DELIVERY");
        long scheduledTransfers = operations.stream()
                .filter(operation -> "INTERNAL".equals(operation.getOperationType()))
                .filter(operation -> "WAITING".equals(operation.getStatus())
                        || "READY".equals(operation.getStatus()))
                .count();
        List<StockOperationResponseDto> filteredOperations =
                inventoryService.getOperations(type, status, storeId, category);

        return new DashboardDto(totalQuantity, inStockProducts, lowStock, outOfStock,
                receipts, deliveries, scheduledTransfers, filteredOperations, Instant.now());
    }

    private long countPending(List<StockOperation> operations, String type) {
        return operations.stream()
                .filter(operation -> type.equals(operation.getOperationType()))
                .filter(operation -> PENDING.contains(operation.getStatus()))
                .count();
    }
}
package com.stock_sense.Backend.dto.dashboard;

import com.stock_sense.Backend.dto.stockOperation.StockOperationResponseDto;
import java.time.Instant;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DashboardDto {

    private long totalProductsInStock;
    private long productCountInStock;
    private long lowStockItems;
    private long outOfStockItems;
    private long pendingReceipts;
    private long pendingDeliveries;
    private long internalTransfersScheduled;
    private List<StockOperationResponseDto> operations;
    private Instant generatedAt;
}
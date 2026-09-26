package com.stock_sense.Backend.dto.stockOperation;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StockOperationResponseDto {

    private Long stockOperationId;
    private String operationType;
    private String status;
    private Long itemId;
    private String itemName;
    private String itemSku;
    private Long quantity;
    private Long countedQuantity;
    private Long sourceStoreId;
    private String sourceStoreName;
    private Long destinationStoreId;
    private String destinationStoreName;
    private String createdBy;
    private String note;
    private String counterparty;
    private Instant createdAt;
    private Instant validatedAt;
}
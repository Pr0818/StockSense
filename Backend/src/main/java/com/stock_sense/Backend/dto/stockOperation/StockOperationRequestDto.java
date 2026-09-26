package com.stock_sense.Backend.dto.stockOperation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class StockOperationRequestDto {

    @NotBlank
    private String operationType;

    private String status;

    private Long sourceStoreId;

    private Long destinationStoreId;

    @Positive
    private Long itemId;

    @Positive
    private Long quantity;

    @PositiveOrZero
    private Long countedQuantity;

    @Size(max = 500)
    private String note;

    @Size(max = 255)
    private String counterparty;
}
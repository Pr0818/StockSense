package com.stock_sense.Backend.dto.stockOperation;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StockOperationStatusDto {

    @NotBlank
    private String status;
}
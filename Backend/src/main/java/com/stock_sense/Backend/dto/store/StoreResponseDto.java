package com.stock_sense.Backend.dto.store;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StoreResponseDto {

    private Long storeId;
    private String storeName;
    private String storeType;
}
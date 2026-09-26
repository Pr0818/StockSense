package com.stock_sense.Backend.dto.item;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProductResponseDto {

    private Long itemId;
    private String itemName;
    private String itemSku;
    private String itemCategory;
    private String itemUnit;
    private Long totalQuantity;
}
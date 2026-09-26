package com.stock_sense.Backend.dto.itemStock;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StockLevelDto {

    private Long itemId;
    private String itemName;
    private String itemSku;
    private String itemCategory;
    private String itemUnit;
    private Long storeId;
    private String storeName;
    private Long quantity;
    private Long minQuantity;
    private boolean lowStock;
}
package com.stock_sense.Backend.dto.itemStock;

import com.stock_sense.Backend.model.Item;
import com.stock_sense.Backend.model.Store;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class itemStockDto {

    private Long quantity;

    private Long minQuantity;

    private Store store;

    private Item item;

}

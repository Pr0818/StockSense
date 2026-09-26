package com.stock_sense.Backend.dto.item;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ItemDto {

    private String itemName;

    private String itemSku;

    private String itemCategory;

    private String itemUnit;

}

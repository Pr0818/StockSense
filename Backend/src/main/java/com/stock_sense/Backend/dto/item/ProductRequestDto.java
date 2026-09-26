package com.stock_sense.Backend.dto.item;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProductRequestDto {

    @NotBlank
    @Size(max = 255)
    private String itemName;

    @NotBlank
    @Size(max = 100)
    private String itemSku;

    @NotBlank
    @Size(max = 100)
    private String itemCategory;

    @NotBlank
    @Size(max = 50)
    private String itemUnit;

    private Long initialStoreId;

    @PositiveOrZero
    private Long initialQuantity;

    @PositiveOrZero
    private Long reorderLevel;
}
package com.stock_sense.Backend.dto.store;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class StoreRequestDto {

    @NotBlank
    @Size(max = 255)
    private String storeName;

    @NotBlank
    @Size(max = 50)
    private String storeType;
}
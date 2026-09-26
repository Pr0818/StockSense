package com.stock_sense.Backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long itemId;

    @NotBlank(message = "Product name can not be blank")
    @Column(nullable = false)
    private String itemName;

    @NotBlank(message = "Product sku can not be blank")
    @Column(nullable = false,unique = true)
    private String itemSku;

    @NotBlank(message = "Category can not be blank")
    @Column(nullable = false)
    private String itemCategory;

    @NotBlank(message = "Product unit of measure can not be blank")
    @Column(nullable = false)
    private String itemUnit;

}

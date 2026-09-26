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
public class Store {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long storeId;

    @NotBlank(message = "Store name can not be blank")
    @Column(nullable = false)
    private String storeName;

    @NotBlank(message = "Store type can not be blank")
    @Column(nullable = false)
    private String storeType;

}

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
public class StockOperation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long StockOperationId;

    @NotBlank(message = "Operation Type can not be blank")
    @Column(nullable = false)
    private String operationType;
    

}

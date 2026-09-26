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

    @Column(nullable = false)
    private String status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_store_id")
    private Store sourceStore;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_store_id")
    private Store destinationStore;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id",nullable = false)
    private Item item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id",nullable = false)
    private User createdBy;

}

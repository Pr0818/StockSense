package com.stock_sense.Backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"item_id", "store_id"}))
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ItemStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ItemStockId;

    @Column(nullable = false)
    private Long quantity;

    @Column(nullable = false)
    private Long minQuantity;

    @Version
    private Long version;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id",nullable = false)
    private Store store;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="item_id",nullable = false)
    private Item item;

}

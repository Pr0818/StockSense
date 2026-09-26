package com.stock_sense.Backend.dto.stockOperation;

import com.stock_sense.Backend.model.Item;
import com.stock_sense.Backend.model.Store;
import com.stock_sense.Backend.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockOperationDto {

    private String operationType;

    private String status;

    private Store sourceStore;

    private Store destinationStore;

    private Item item;

    private User createdBy;

}

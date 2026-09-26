package com.stock_sense.Backend;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.stock_sense.Backend.dto.stockOperation.StockOperationRequestDto;
import com.stock_sense.Backend.model.Item;
import com.stock_sense.Backend.model.ItemStock;
import com.stock_sense.Backend.model.Store;
import com.stock_sense.Backend.model.User;
import com.stock_sense.Backend.model.UserRole;
import com.stock_sense.Backend.repository.ItemRepository;
import com.stock_sense.Backend.repository.ItemStockRepository;
import com.stock_sense.Backend.repository.StockOperationRepository;
import com.stock_sense.Backend.repository.StoreRepository;
import com.stock_sense.Backend.repository.UserRepository;
import com.stock_sense.Backend.service.InventoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@SpringBootTest
class InventoryWorkflowTests {

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private ItemStockRepository itemStockRepository;

    @Autowired
    private StockOperationRepository operationRepository;

    @Autowired
    private UserRepository userRepository;

    private Item item;
    private Store source;
    private Store destination;
    private User actor;

    @BeforeEach
    @SuppressWarnings("unused")
    void setUp() {
        operationRepository.deleteAll();
        itemStockRepository.deleteAll();
        itemRepository.deleteAll();
        storeRepository.deleteAll();
        userRepository.deleteAll();

        actor = new User();
        actor.setUserName("warehouse-staff");
        actor.setEmail("staff@example.com");
        actor.setMobileNo("15551234567");
        actor.setPassword("not-used-in-this-test");
        actor.setIsActive(true);
        actor.setUserRole(UserRole.EMPLOYEE);
        actor = userRepository.save(actor);

        item = new Item();
        item.setItemName("Steel Rod");
        item.setItemSku("STEEL-001");
        item.setItemCategory("Raw Materials");
        item.setItemUnit("kg");
        item.setIsActive(true);
        item = itemRepository.save(item);

        source = store("Main Warehouse");
        destination = store("Production Floor");
    }

    @Test
    void receiptAndInternalTransferUpdateLocationBalancesAndLedger() {
        var receipt = inventoryService.createOperation(
                operation("RECEIPT", null, destination.getStoreId(), 12L), actor);
        complete(receipt.getStockOperationId());

        var transfer = inventoryService.createOperation(
                operation("INTERNAL", destination.getStoreId(), source.getStoreId(), 5L), actor);
        complete(transfer.getStockOperationId());

        assertEquals(7L, balance(destination).getQuantity());
        assertEquals(5L, balance(source).getQuantity());
        assertEquals(2, operationRepository.count());
        assertEquals("DONE", inventoryService.getOperation(transfer.getStockOperationId()).getStatus());
    }

    @Test
    void deliveryCannotPostMoreThanAvailableAndLeavesBalanceUnchanged() {
        ItemStock openingBalance = new ItemStock();
        openingBalance.setItem(item);
        openingBalance.setStore(source);
        openingBalance.setQuantity(2L);
        openingBalance.setMinQuantity(0L);
        itemStockRepository.save(openingBalance);

        var delivery = inventoryService.createOperation(
                operation("DELIVERY", source.getStoreId(), null, 3L), actor);
        inventoryService.changeOperationStatus(delivery.getStockOperationId(), "WAITING");
        inventoryService.changeOperationStatus(delivery.getStockOperationId(), "READY");

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> inventoryService.changeOperationStatus(delivery.getStockOperationId(), "DONE"));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        assertEquals(2L, balance(source).getQuantity());
        assertEquals("READY", inventoryService.getOperation(delivery.getStockOperationId()).getStatus());
    }

    private StockOperationRequestDto operation(String type, Long sourceId, Long destinationId, Long quantity) {
        StockOperationRequestDto request = new StockOperationRequestDto();
        request.setOperationType(type);
        request.setSourceStoreId(sourceId);
        request.setDestinationStoreId(destinationId);
        request.setItemId(item.getItemId());
        request.setQuantity(quantity);
        return request;
    }

    private void complete(Long operationId) {
        inventoryService.changeOperationStatus(operationId, "WAITING");
        inventoryService.changeOperationStatus(operationId, "READY");
        inventoryService.changeOperationStatus(operationId, "DONE");
    }

    private ItemStock balance(Store store) {
        return itemStockRepository.findByItemItemIdAndStoreStoreId(item.getItemId(), store.getStoreId())
                .orElseThrow();
    }

    private Store store(String name) {
        Store warehouse = new Store();
        warehouse.setStoreName(name);
        warehouse.setStoreType("WAREHOUSE");
        return storeRepository.save(warehouse);
    }
}

package com.stock_sense.Backend.controller;

import com.stock_sense.Backend.dto.store.StoreRequestDto;
import com.stock_sense.Backend.dto.store.StoreResponseDto;
import com.stock_sense.Backend.service.InventoryService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/warehouses")
public class StoreController {

    private final InventoryService inventoryService;

    public StoreController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public List<StoreResponseDto> getStores() {
        return inventoryService.getStores();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public StoreResponseDto createStore(@Valid @RequestBody StoreRequestDto request) {
        return inventoryService.createStore(request);
    }

    @PutMapping("/{storeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public StoreResponseDto updateStore(
            @PathVariable Long storeId, @Valid @RequestBody StoreRequestDto request) {
        return inventoryService.updateStore(storeId, request);
    }

    @DeleteMapping("/{storeId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteStore(@PathVariable Long storeId) {
        inventoryService.deleteStore(storeId);
    }
}
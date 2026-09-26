package com.stock_sense.Backend.controller;

import com.stock_sense.Backend.dto.stockOperation.StockOperationRequestDto;
import com.stock_sense.Backend.dto.stockOperation.StockOperationResponseDto;
import com.stock_sense.Backend.dto.stockOperation.StockOperationStatusDto;
import com.stock_sense.Backend.security.AppUserDetails;
import com.stock_sense.Backend.service.InventoryService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/operations", "/api/ledger"})
public class StockOperationController {

    private final InventoryService inventoryService;

    public StockOperationController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public List<StockOperationResponseDto> getOperations(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long storeId,
            @RequestParam(required = false) String category) {
        return inventoryService.getOperations(type, status, storeId, category);
    }

    @GetMapping("/{operationId}")
    public StockOperationResponseDto getOperation(@PathVariable Long operationId) {
        return inventoryService.getOperation(operationId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public StockOperationResponseDto createOperation(
            @Valid @RequestBody StockOperationRequestDto request,
            @AuthenticationPrincipal AppUserDetails principal) {
        return inventoryService.createOperation(request, principal.getUser());
    }

    @PatchMapping("/{operationId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public StockOperationResponseDto changeStatus(
            @PathVariable Long operationId, @Valid @RequestBody StockOperationStatusDto request) {
        return inventoryService.changeOperationStatus(operationId, request.getStatus());
    }
}
package com.stock_sense.Backend.controller;

import com.stock_sense.Backend.dto.item.ProductRequestDto;
import com.stock_sense.Backend.dto.item.ProductResponseDto;
import com.stock_sense.Backend.security.AppUserDetails;
import com.stock_sense.Backend.service.InventoryService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final InventoryService inventoryService;

    public ProductController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public List<ProductResponseDto> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category) {
        return inventoryService.getProducts(search, category);
    }

    @GetMapping("/{itemId}")
    public ProductResponseDto getProduct(@PathVariable Long itemId) {
        return inventoryService.getProduct(itemId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public ProductResponseDto createProduct(
            @Valid @RequestBody ProductRequestDto request,
            @AuthenticationPrincipal AppUserDetails principal) {
        return inventoryService.createProduct(request, principal.getUser());
    }

    @PutMapping("/{itemId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ProductResponseDto updateProduct(
            @PathVariable Long itemId, @Valid @RequestBody ProductRequestDto request) {
        return inventoryService.updateProduct(itemId, request);
    }

    @DeleteMapping("/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void deactivateProduct(@PathVariable Long itemId) {
        inventoryService.deactivateProduct(itemId);
    }
}
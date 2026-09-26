package com.stock_sense.Backend.service;

import com.stock_sense.Backend.dto.item.ProductRequestDto;
import com.stock_sense.Backend.dto.item.ProductResponseDto;
import com.stock_sense.Backend.dto.itemStock.StockLevelDto;
import com.stock_sense.Backend.dto.stockOperation.StockOperationRequestDto;
import com.stock_sense.Backend.dto.stockOperation.StockOperationResponseDto;
import com.stock_sense.Backend.dto.store.StoreRequestDto;
import com.stock_sense.Backend.dto.store.StoreResponseDto;
import com.stock_sense.Backend.model.Item;
import com.stock_sense.Backend.model.ItemStock;
import com.stock_sense.Backend.model.StockOperation;
import com.stock_sense.Backend.model.Store;
import com.stock_sense.Backend.model.User;
import com.stock_sense.Backend.repository.ItemRepository;
import com.stock_sense.Backend.repository.ItemStockRepository;
import com.stock_sense.Backend.repository.StockOperationRepository;
import com.stock_sense.Backend.repository.StoreRepository;
import jakarta.persistence.criteria.Predicate;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class InventoryService {

    private static final List<String> OPERATION_TYPES =
            List.of("RECEIPT", "DELIVERY", "INTERNAL", "ADJUSTMENT");
    private static final List<String> OPERATION_STATUSES =
            List.of("DRAFT", "WAITING", "READY", "DONE", "CANCELED");

    private final ItemRepository itemRepository;
    private final StoreRepository storeRepository;
    private final ItemStockRepository itemStockRepository;
    private final StockOperationRepository operationRepository;

    public InventoryService(
            ItemRepository itemRepository,
            StoreRepository storeRepository,
            ItemStockRepository itemStockRepository,
            StockOperationRepository operationRepository) {
        this.itemRepository = itemRepository;
        this.storeRepository = storeRepository;
        this.itemStockRepository = itemStockRepository;
        this.operationRepository = operationRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDto> getProducts(String search, String category) {
        return itemRepository.findAll().stream()
                .filter(item -> Boolean.TRUE.equals(item.getIsActive()))
                .filter(item -> search == null || search.isBlank()
                        || contains(item.getItemName(), search) || contains(item.getItemSku(), search))
                .filter(item -> category == null || category.isBlank()
                        || item.getItemCategory().equalsIgnoreCase(category))
                .map(this::toProductResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponseDto getProduct(Long itemId) {
        return toProductResponse(findActiveItem(itemId));
    }

    @Transactional
    public ProductResponseDto createProduct(ProductRequestDto request, User actor) {
        String sku = request.getItemSku().trim();
        if (itemRepository.existsByItemSkuIgnoreCase(sku)) {
            throw conflict("SKU is already in use");
        }
        Item item = new Item();
        applyProductFields(item, request);
        item.setIsActive(true);
        item = itemRepository.save(item);

        if (request.getInitialStoreId() != null || request.getInitialQuantity() != null
                || request.getReorderLevel() != null) {
            Store store = findStore(request.getInitialStoreId());
                        Long initialQuantity = java.util.Objects.requireNonNullElse(request.getInitialQuantity(), 0L);
            ItemStock balance = new ItemStock();
            balance.setItem(item);
            balance.setStore(store);
            balance.setQuantity(initialQuantity);
                        Long reorderLevel = java.util.Objects.requireNonNullElse(request.getReorderLevel(), 0L);
                    balance.setMinQuantity(reorderLevel);
            itemStockRepository.save(balance);
            if (initialQuantity > 0) {
                StockOperation initialStock = new StockOperation();
                initialStock.setOperationType("ADJUSTMENT");
                initialStock.setStatus("DONE");
                initialStock.setItem(item);
                initialStock.setSourceStore(store);
                initialStock.setQuantity(initialQuantity);
                initialStock.setCountedQuantity(initialQuantity);
                initialStock.setNote("Initial stock");
                initialStock.setCreatedBy(actor);
                initialStock.setValidatedAt(Instant.now());
                operationRepository.save(initialStock);
            }
        }
        return toProductResponse(item);
    }

    @Transactional
    public ProductResponseDto updateProduct(Long itemId, ProductRequestDto request) {
        Item item = findActiveItem(itemId);
        String sku = request.getItemSku().trim();
        if (itemRepository.existsByItemSkuIgnoreCaseAndItemIdNot(sku, itemId)) {
            throw conflict("SKU is already in use");
        }
        applyProductFields(item, request);
        if (request.getReorderLevel() != null) {
            if (request.getInitialStoreId() == null) {
                throw badRequest("Warehouse is required when updating a reorder level");
            }
            ItemStock stock = getLockedStock(itemId, findStore(request.getInitialStoreId()), true);
            stock.setMinQuantity(request.getReorderLevel());
        }
        return toProductResponse(itemRepository.save(item));
    }

    @Transactional
    public void deactivateProduct(Long itemId) {
        Item item = findActiveItem(itemId);
        item.setIsActive(false);
        itemRepository.save(item);
    }

    @Transactional(readOnly = true)
    public List<StoreResponseDto> getStores() {
        return storeRepository.findAll(Sort.by("storeName")).stream()
                .map(this::toStoreResponse)
                .toList();
    }

    @Transactional
    public StoreResponseDto createStore(StoreRequestDto request) {
        if (storeRepository.existsByStoreNameIgnoreCase(request.getStoreName().trim())) {
            throw conflict("Warehouse name is already in use");
        }
        Store store = new Store();
        store.setStoreName(request.getStoreName().trim());
        store.setStoreType(request.getStoreType().trim());
        return toStoreResponse(storeRepository.save(store));
    }

    @Transactional
    public StoreResponseDto updateStore(Long storeId, StoreRequestDto request) {
        Store store = findStore(storeId);
        store.setStoreName(request.getStoreName().trim());
        store.setStoreType(request.getStoreType().trim());
        return toStoreResponse(storeRepository.save(store));
    }

    @Transactional
    public void deleteStore(Long storeId) {
        Store store = findStore(storeId);
        if (itemStockRepository.existsByStoreStoreId(storeId)
                || operationRepository.existsBySourceStoreStoreIdOrDestinationStoreStoreId(storeId, storeId)) {
            throw conflict("Warehouse has stock or operation history and cannot be deleted");
        }
        storeRepository.delete(store);
    }

    @Transactional(readOnly = true)
    public List<StockLevelDto> getStockLevels(Long storeId, Long itemId, Boolean lowStockOnly) {
        return itemStockRepository.findAllByOrderByItemItemNameAscStoreStoreNameAsc().stream()
                .filter(stock -> storeId == null || stock.getStore().getStoreId().equals(storeId))
                .filter(stock -> itemId == null || stock.getItem().getItemId().equals(itemId))
                .filter(stock -> !Boolean.TRUE.equals(lowStockOnly)
                        || stock.getQuantity() <= stock.getMinQuantity())
                .map(this::toStockLevel)
                .toList();
    }

    @Transactional
    public StockOperationResponseDto createOperation(StockOperationRequestDto request, User actor) {
        String type = normalize(request.getOperationType());
        if (!OPERATION_TYPES.contains(type)) {
            throw badRequest("Unsupported operation type");
        }
        if (request.getStatus() != null && !"DRAFT".equals(normalize(request.getStatus()))) {
            throw badRequest("New operations must start in DRAFT status");
        }

        if (request.getItemId() == null) {
            throw badRequest("Product is required");
        }
        Item item = findActiveItem(request.getItemId());
        Store source = request.getSourceStoreId() == null ? null : findStore(request.getSourceStoreId());
        Store destination = request.getDestinationStoreId() == null
                ? null : findStore(request.getDestinationStoreId());
        validateOperationRequest(type, request, source, destination);

        StockOperation operation = new StockOperation();
        operation.setOperationType(type);
        operation.setStatus("DRAFT");
        operation.setItem(item);
        operation.setSourceStore(source);
        operation.setDestinationStore(destination);
        operation.setQuantity(request.getQuantity());
        operation.setCountedQuantity(request.getCountedQuantity());
        operation.setNote(request.getNote());
        operation.setCounterparty(request.getCounterparty());
        operation.setCreatedBy(actor);
        return toOperationResponse(operationRepository.save(operation));
    }

    @Transactional
    public StockOperationResponseDto changeOperationStatus(Long operationId, String requestedStatus) {
        StockOperation operation = operationRepository.findLockedById(operationId)
                .orElseThrow(() -> notFound("Operation not found"));
        String nextStatus = normalize(requestedStatus);
        if (!OPERATION_STATUSES.contains(nextStatus)) {
            throw badRequest("Unsupported operation status");
        }
        if (nextStatus.equals(operation.getStatus())) {
            return toOperationResponse(operation);
        }
        if (!isAllowedTransition(operation.getStatus(), nextStatus)) {
            throw conflict("Invalid operation status transition");
        }
        if ("DONE".equals(nextStatus)) {
            postStockMovement(operation);
            operation.setValidatedAt(Instant.now());
        }
        operation.setStatus(nextStatus);
        return toOperationResponse(operationRepository.save(operation));
    }

    @Transactional(readOnly = true)
    public List<StockOperationResponseDto> getOperations(
            String type, String status, Long storeId, String category) {
        Specification<StockOperation> specification = (root, query, criteria) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (type != null && !type.isBlank()) {
                predicates.add(criteria.equal(root.get("operationType"), normalize(type)));
            }
            if (status != null && !status.isBlank()) {
                predicates.add(criteria.equal(root.get("status"), normalize(status)));
            }
            if (storeId != null) {
                var sourceStore = root.join("sourceStore", jakarta.persistence.criteria.JoinType.LEFT);
                var destinationStore = root.join("destinationStore", jakarta.persistence.criteria.JoinType.LEFT);
                predicates.add(criteria.or(
                    criteria.equal(sourceStore.get("storeId"), storeId),
                    criteria.equal(destinationStore.get("storeId"), storeId)));
            }
            if (category != null && !category.isBlank()) {
                predicates.add(criteria.equal(
                        criteria.lower(root.get("item").get("itemCategory")), category.toLowerCase(Locale.ROOT)));
            }
            return criteria.and(predicates.toArray(Predicate[]::new));
        };
        return operationRepository.findAll(specification, Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(this::toOperationResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public StockOperationResponseDto getOperation(Long operationId) {
        return operationRepository.findById(operationId)
                .map(this::toOperationResponse)
                .orElseThrow(() -> notFound("Operation not found"));
    }

    private void validateOperationRequest(
            String type, StockOperationRequestDto request, Store source, Store destination) {
        switch (type) {
            case "RECEIPT" -> {
                if (destination == null || request.getQuantity() == null) {
                    throw badRequest("Receipt requires a destination warehouse and positive quantity");
                }
            }
            case "DELIVERY" -> {
                if (source == null || request.getQuantity() == null) {
                    throw badRequest("Delivery requires a source warehouse and positive quantity");
                }
            }
            case "INTERNAL" -> {
                if (source == null || destination == null || request.getQuantity() == null
                        || source.getStoreId().equals(destination.getStoreId())) {
                    throw badRequest("Internal transfer requires distinct source and destination warehouses and quantity");
                }
            }
            case "ADJUSTMENT" -> {
                if (source == null || request.getCountedQuantity() == null) {
                    throw badRequest("Adjustment requires a warehouse and counted quantity");
                }
            }
            default -> throw badRequest("Unsupported operation type");
        }
    }

    private boolean isAllowedTransition(String current, String next) {
        return ("DRAFT".equals(current) && ("WAITING".equals(next) || "CANCELED".equals(next)))
                || ("WAITING".equals(current) && ("READY".equals(next) || "CANCELED".equals(next)))
                || ("READY".equals(current) && ("DONE".equals(next) || "CANCELED".equals(next)));
    }

    private void postStockMovement(StockOperation operation) {
        String type = operation.getOperationType();
        Long itemId = operation.getItem().getItemId();
        switch (type) {
            case "RECEIPT" -> addStock(itemId, operation.getDestinationStore(), operation.getQuantity());
            case "DELIVERY" -> subtractStock(itemId, operation.getSourceStore(), operation.getQuantity());
            case "INTERNAL" -> {
                Long sourceId = operation.getSourceStore().getStoreId();
                Long destinationId = operation.getDestinationStore().getStoreId();
                ItemStock sourceStock;
                ItemStock destinationStock;
                if (sourceId < destinationId) {
                    sourceStock = getLockedStock(itemId, operation.getSourceStore(), false);
                    destinationStock = getLockedStock(itemId, operation.getDestinationStore(), true);
                } else {
                    destinationStock = getLockedStock(itemId, operation.getDestinationStore(), true);
                    sourceStock = getLockedStock(itemId, operation.getSourceStore(), false);
                }
                ensureAvailable(sourceStock, operation.getQuantity());
                sourceStock.setQuantity(sourceStock.getQuantity() - operation.getQuantity());
                destinationStock.setQuantity(destinationStock.getQuantity() + operation.getQuantity());
            }
            case "ADJUSTMENT" -> {
                ItemStock stock = getLockedStock(itemId, operation.getSourceStore(), true);
                long counted = operation.getCountedQuantity();
                operation.setQuantity(counted - stock.getQuantity());
                stock.setQuantity(counted);
            }
            default -> throw badRequest("Unsupported operation type");
        }
    }

    private void addStock(Long itemId, Store store, long amount) {
        ItemStock stock = getLockedStock(itemId, store, true);
        stock.setQuantity(stock.getQuantity() + amount);
    }

    private void subtractStock(Long itemId, Store store, long amount) {
        ItemStock stock = getLockedStock(itemId, store, false);
        ensureAvailable(stock, amount);
        stock.setQuantity(stock.getQuantity() - amount);
    }

    private ItemStock getLockedStock(Long itemId, Store store, boolean createIfMissing) {
        return itemStockRepository.findLockedByItemAndStore(itemId, store.getStoreId())
                .orElseGet(() -> {
                    if (!createIfMissing) {
                        throw conflict("No stock balance exists for this product and warehouse");
                    }
                    ItemStock stock = new ItemStock();
                    stock.setItem(findActiveItem(itemId));
                    stock.setStore(store);
                    stock.setQuantity(0L);
                    stock.setMinQuantity(0L);
                    return itemStockRepository.save(stock);
                });
    }

    private void ensureAvailable(ItemStock stock, long amount) {
        if (stock.getQuantity() < amount) {
            throw conflict("Insufficient stock for this operation");
        }
    }

    private Item findActiveItem(Long itemId) {
        Item item = itemRepository.findById(itemId).orElseThrow(() -> notFound("Product not found"));
        if (!Boolean.TRUE.equals(item.getIsActive())) {
            throw notFound("Product not found");
        }
        return item;
    }

    private Store findStore(Long storeId) {
        if (storeId == null) {
            throw badRequest("Warehouse is required");
        }
        return storeRepository.findById(storeId).orElseThrow(() -> notFound("Warehouse not found"));
    }

    private ProductResponseDto toProductResponse(Item item) {
        long quantity = itemStockRepository.findByItemItemId(item.getItemId()).stream()
                .mapToLong(ItemStock::getQuantity)
                .sum();
        return new ProductResponseDto(item.getItemId(), item.getItemName(), item.getItemSku(),
                item.getItemCategory(), item.getItemUnit(), quantity);
    }

    private StoreResponseDto toStoreResponse(Store store) {
        return new StoreResponseDto(store.getStoreId(), store.getStoreName(), store.getStoreType());
    }

    private StockLevelDto toStockLevel(ItemStock stock) {
        Item item = stock.getItem();
        return new StockLevelDto(item.getItemId(), item.getItemName(), item.getItemSku(),
                item.getItemCategory(), item.getItemUnit(), stock.getStore().getStoreId(),
                stock.getStore().getStoreName(), stock.getQuantity(), stock.getMinQuantity(),
                stock.getQuantity() <= stock.getMinQuantity());
    }

    private StockOperationResponseDto toOperationResponse(StockOperation operation) {
        Store source = operation.getSourceStore();
        Store destination = operation.getDestinationStore();
        return new StockOperationResponseDto(operation.getStockOperationId(), operation.getOperationType(),
                operation.getStatus(), operation.getItem().getItemId(), operation.getItem().getItemName(),
                operation.getItem().getItemSku(), operation.getQuantity(), operation.getCountedQuantity(),
                source == null ? null : source.getStoreId(), source == null ? null : source.getStoreName(),
                destination == null ? null : destination.getStoreId(),
                destination == null ? null : destination.getStoreName(),
                operation.getCreatedBy().getUserName(), operation.getNote(), operation.getCounterparty(),
                operation.getCreatedAt(),
                operation.getValidatedAt());
    }

    private void applyProductFields(Item item, ProductRequestDto request) {
        item.setItemName(request.getItemName().trim());
        item.setItemSku(request.getItemSku().trim());
        item.setItemCategory(request.getItemCategory().trim());
        item.setItemUnit(request.getItemUnit().trim());
    }

    private boolean contains(String value, String query) {
        return value.toLowerCase(Locale.ROOT).contains(query.trim().toLowerCase(Locale.ROOT));
    }

    private String normalize(String value) {
        return value.trim().toUpperCase(Locale.ROOT);
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private ResponseStatusException notFound(String message) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
    }

    private ResponseStatusException conflict(String message) {
        return new ResponseStatusException(HttpStatus.CONFLICT, message);
    }
}
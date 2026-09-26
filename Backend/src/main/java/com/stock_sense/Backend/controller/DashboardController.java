package com.stock_sense.Backend.controller;

import com.stock_sense.Backend.dto.dashboard.DashboardDto;
import com.stock_sense.Backend.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public DashboardDto getDashboard(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long storeId,
            @RequestParam(required = false) String category) {
        return dashboardService.getDashboard(type, status, storeId, category);
    }
}
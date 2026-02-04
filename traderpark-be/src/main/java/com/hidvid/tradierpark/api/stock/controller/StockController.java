package com.hidvid.tradierpark.api.stock.controller;

import com.hidvid.tradierpark.api.stock.dto.DailyChartDto;
import com.hidvid.tradierpark.infra.broker.kiwoom.dto.response.DailyChartResponse;
import com.hidvid.tradierpark.infra.broker.kiwoom.service.KiwoomApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
public class StockController {

    private final KiwoomApiService kiwoomApiService;

    @GetMapping("/{code}/daily-chart")
    public ResponseEntity<DailyChartDto> getDailyChart(
            @PathVariable String code,
            @RequestParam(required = false)
            @DateTimeFormat(pattern = "yyyyMMdd") LocalDate date
    ) {
        if (date == null) {
            date = LocalDate.now();
        }

        DailyChartResponse response = kiwoomApiService.getDailyChart(code, date);
        return ResponseEntity.ok(DailyChartDto.from(response));
    }
}

package com.hidvid.tradierpark.api.portfolio.controller;

import com.hidvid.tradierpark.api.portfolio.dto.DailyBalanceDto;
import com.hidvid.tradierpark.infra.broker.kiwoom.dto.response.DailyBalanceResponse;
import com.hidvid.tradierpark.infra.broker.kiwoom.service.KiwoomApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
public class PortfolioController {

    private final KiwoomApiService kiwoomApiService;

    @GetMapping("/daily-balance")
    public ResponseEntity<DailyBalanceDto> getDailyBalance(
            @RequestParam(required = false)
            @DateTimeFormat(pattern = "yyyyMMdd") LocalDate date
    ) {
        if (date == null) {
            date = LocalDate.now();
        }

        DailyBalanceResponse response = kiwoomApiService.getDailyBalance(date);
        return ResponseEntity.ok(DailyBalanceDto.from(response));
    }
}

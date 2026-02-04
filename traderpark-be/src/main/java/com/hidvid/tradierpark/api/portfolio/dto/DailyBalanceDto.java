package com.hidvid.tradierpark.api.portfolio.dto;

import com.hidvid.tradierpark.infra.broker.kiwoom.dto.response.DailyBalanceResponse;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class DailyBalanceDto {

    private String date;
    private String totalBuyAmount;
    private String totalEvalAmount;
    private String totalEvalProfit;
    private String totalProfitRate;
    private String depositBalance;
    private String dayStockAsset;
    private String cashWeight;
    private List<StockBalanceDto> stocks;

    @Getter
    @Builder
    public static class StockBalanceDto {
        private String stockCode;
        private String stockName;
        private String currentPrice;
        private String quantity;
        private String buyPrice;
        private String evalAmount;
        private String evalProfit;
        private String profitRate;
        private String buyWeight;
        private String evalWeight;

        public static StockBalanceDto from(DailyBalanceResponse.StockBalance balance) {
            return StockBalanceDto.builder()
                    .stockCode(balance.getStockCode())
                    .stockName(balance.getStockName())
                    .currentPrice(balance.getCurrentPrice())
                    .quantity(balance.getRemainQuantity())
                    .buyPrice(balance.getBuyUnitPrice())
                    .evalAmount(balance.getEvalAmount())
                    .evalProfit(balance.getEvalProfit())
                    .profitRate(balance.getProfitRate())
                    .buyWeight(balance.getBuyWeight())
                    .evalWeight(balance.getEvalWeight())
                    .build();
        }
    }

    public static DailyBalanceDto from(DailyBalanceResponse response) {
        List<StockBalanceDto> stocks = response.getStockBalances() == null
                ? List.of()
                : response.getStockBalances().stream()
                    .filter(s -> s.getStockCode() != null && !s.getStockCode().isBlank())
                    .map(StockBalanceDto::from)
                    .toList();

        return DailyBalanceDto.builder()
                .date(response.getDate())
                .totalBuyAmount(response.getTotalBuyAmount())
                .totalEvalAmount(response.getTotalEvalAmount())
                .totalEvalProfit(response.getTotalEvalProfit())
                .totalProfitRate(response.getTotalProfitRate())
                .depositBalance(response.getDepositBalance())
                .dayStockAsset(response.getDayStockAsset())
                .cashWeight(response.getBuyWeight())
                .stocks(stocks)
                .build();
    }
}

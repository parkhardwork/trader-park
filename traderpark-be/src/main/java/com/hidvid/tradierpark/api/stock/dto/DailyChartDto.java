package com.hidvid.tradierpark.api.stock.dto;

import com.hidvid.tradierpark.infra.broker.kiwoom.dto.response.DailyChartResponse;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class DailyChartDto {

    private String stockCode;
    private long highPrice;
    private long currentPrice;
    private double dropRate;
    private List<ChartItemDto> items;

    @Getter
    @Builder
    public static class ChartItemDto {
        private String date;
        private long open;
        private long high;
        private long low;
        private long close;
        private long volume;
        private long tradeAmount;
        private String change;
        private String changeSign;

        public static ChartItemDto from(DailyChartResponse.ChartItem item) {
            return ChartItemDto.builder()
                    .date(item.getDate())
                    .open(parseLong(item.getOpenPrice()))
                    .high(parseLong(item.getHighPrice()))
                    .low(parseLong(item.getLowPrice()))
                    .close(parseLong(item.getClosePrice()))
                    .volume(parseLong(item.getTradeQuantity()))
                    .tradeAmount(parseLong(item.getTradeAmount()))
                    .change(item.getChange())
                    .changeSign(item.getChangeSign())
                    .build();
        }
    }

    public static DailyChartDto from(DailyChartResponse response) {
        List<ChartItemDto> items = response.getChartItems() == null
                ? List.of()
                : response.getChartItems().stream()
                    .filter(item -> item.getDate() != null && !item.getDate().isBlank())
                    .map(ChartItemDto::from)
                    .toList();

        long highPrice = items.stream()
                .mapToLong(ChartItemDto::getHigh)
                .max()
                .orElse(0);

        long currentPrice = items.isEmpty() ? 0 : items.get(0).getClose();

        double dropRate = highPrice > 0
                ? ((double) (currentPrice - highPrice) / highPrice) * 100
                : 0;

        return DailyChartDto.builder()
                .stockCode(response.getStockCode())
                .highPrice(highPrice)
                .currentPrice(currentPrice)
                .dropRate(Math.round(dropRate * 100.0) / 100.0)
                .items(items)
                .build();
    }

    private static long parseLong(String value) {
        if (value == null || value.isBlank()) return 0;
        try {
            return Long.parseLong(value.replace(",", "").replace("+", "").trim());
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}

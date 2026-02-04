package com.hidvid.tradierpark.infra.broker.kiwoom.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DailyChartRequest {

    @JsonProperty("stk_cd")
    private String stockCode;

    @JsonProperty("base_dt")
    private String baseDate;

    @JsonProperty("upd_stkpc_tp")
    private String adjustedPriceType;

    public static DailyChartRequest of(String stockCode, String baseDate) {
        return DailyChartRequest.builder()
                .stockCode(stockCode)
                .baseDate(baseDate)
                .adjustedPriceType("1")
                .build();
    }
}

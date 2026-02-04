package com.hidvid.tradierpark.infra.broker.kiwoom.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DailyBalanceRequest {

    @JsonProperty("qry_dt")
    private String queryDate;

    public static DailyBalanceRequest of(String date) {
        return DailyBalanceRequest.builder()
                .queryDate(date)
                .build();
    }
}

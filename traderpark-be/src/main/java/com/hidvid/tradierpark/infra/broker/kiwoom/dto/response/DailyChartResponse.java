package com.hidvid.tradierpark.infra.broker.kiwoom.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class DailyChartResponse {

    @JsonProperty("return_code")
    private Integer returnCode;

    @JsonProperty("return_msg")
    private String returnMsg;

    @JsonProperty("stk_cd")
    private String stockCode;

    @JsonProperty("stk_dt_pole_chart_qry")
    private List<ChartItem> chartItems;

    @Getter
    @NoArgsConstructor
    public static class ChartItem {

        @JsonProperty("dt")
        private String date;

        @JsonProperty("open_pric")
        private String openPrice;

        @JsonProperty("high_pric")
        private String highPrice;

        @JsonProperty("low_pric")
        private String lowPrice;

        @JsonProperty("cur_prc")
        private String closePrice;

        @JsonProperty("trde_qty")
        private String tradeQuantity;

        @JsonProperty("trde_prica")
        private String tradeAmount;

        @JsonProperty("pred_pre")
        private String change;

        @JsonProperty("pred_pre_sig")
        private String changeSign;
    }
}

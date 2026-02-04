package com.hidvid.tradierpark.infra.broker.kiwoom.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class DailyBalanceResponse {

    @JsonProperty("return_code")
    private Integer returnCode;

    @JsonProperty("return_msg")
    private String returnMsg;

    @JsonProperty("dt")
    private String date;

    @JsonProperty("tot_buy_amt")
    private String totalBuyAmount;

    @JsonProperty("tot_evlt_amt")
    private String totalEvalAmount;

    @JsonProperty("tot_evltv_prft")
    private String totalEvalProfit;

    @JsonProperty("tot_prft_rt")
    private String totalProfitRate;

    @JsonProperty("dbst_bal")
    private String depositBalance;

    @JsonProperty("day_stk_asst")
    private String dayStockAsset;

    @JsonProperty("buy_wght")
    private String buyWeight;

    @JsonProperty("day_bal_rt")
    private List<StockBalance> stockBalances;

    @Getter
    @NoArgsConstructor
    public static class StockBalance {

        @JsonProperty("stk_cd")
        private String stockCode;

        @JsonProperty("stk_nm")
        private String stockName;

        @JsonProperty("cur_prc")
        private String currentPrice;

        @JsonProperty("rmnd_qty")
        private String remainQuantity;

        @JsonProperty("buy_uv")
        private String buyUnitPrice;

        @JsonProperty("evlt_amt")
        private String evalAmount;

        @JsonProperty("evltv_prft")
        private String evalProfit;

        @JsonProperty("prft_rt")
        private String profitRate;

        @JsonProperty("buy_wght")
        private String buyWeight;

        @JsonProperty("evlt_wght")
        private String evalWeight;
    }
}

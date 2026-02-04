package com.hidvid.tradierpark.infra.broker.kiwoom.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class KiwoomTokenRequest {

    @JsonProperty("grant_type")
    private String grantType;

    @JsonProperty("appkey")
    private String appKey;

    @JsonProperty("secretkey")
    private String secretKey;

    public static KiwoomTokenRequest of(String appKey, String secretKey) {
        return KiwoomTokenRequest.builder()
                .grantType("client_credentials")
                .appKey(appKey)
                .secretKey(secretKey)
                .build();
    }
}

package com.hidvid.tradierpark.infra.broker.kiwoom.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "kiwoom")
@Getter
@Setter
public class KiwoomConfig {
    private String apiUrl;
    private String appKey;
    private String secretKey;
}

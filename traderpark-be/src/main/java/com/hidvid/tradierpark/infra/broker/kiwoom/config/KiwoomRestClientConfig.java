package com.hidvid.tradierpark.infra.broker.kiwoom.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
public class KiwoomRestClientConfig {

    @Bean
    public RestClient kiwoomRestClient(KiwoomConfig kiwoomConfig) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(10000);

        return RestClient.builder()
                .baseUrl(kiwoomConfig.getApiUrl())
                .requestFactory(factory)
                .defaultHeader("Content-Type", "application/json;charset=UTF-8")
                .build();
    }
}

package com.hidvid.tradierpark.infra.broker.kiwoom.service;

import com.hidvid.tradierpark.infra.broker.kiwoom.config.KiwoomConfig;
import com.hidvid.tradierpark.infra.broker.kiwoom.dto.request.DailyBalanceRequest;
import com.hidvid.tradierpark.infra.broker.kiwoom.dto.request.DailyChartRequest;
import com.hidvid.tradierpark.infra.broker.kiwoom.dto.request.KiwoomTokenRequest;
import com.hidvid.tradierpark.infra.broker.kiwoom.dto.response.DailyBalanceResponse;
import com.hidvid.tradierpark.infra.broker.kiwoom.dto.response.DailyChartResponse;
import com.hidvid.tradierpark.infra.broker.kiwoom.dto.response.KiwoomTokenResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class KiwoomApiService {

    private static final String API_ID_DAILY_BALANCE = "ka01690";
    private static final String API_ID_DAILY_CHART = "ka10081";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");

    private final RestClient kiwoomRestClient;
    private final KiwoomConfig kiwoomConfig;

    private String cachedToken;
    private long tokenExpiryTime;

    public DailyBalanceResponse getDailyBalance(LocalDate date) {
        String accessToken = getAccessToken();
        String queryDate = date.format(DATE_FORMATTER);

        log.info("일별잔고수익률 조회 요청 - 날짜: {}", queryDate);

        DailyBalanceResponse response = kiwoomRestClient.post()
                .uri("/api/dostk/acnt")
                .header("Authorization", "Bearer " + accessToken)
                .header("api-id", API_ID_DAILY_BALANCE)
                .body(DailyBalanceRequest.of(queryDate))
                .retrieve()
                .body(DailyBalanceResponse.class);

        if (response == null || response.getReturnCode() != 0) {
            String errorMsg = response != null ? response.getReturnMsg() : "응답 없음";
            log.error("일별잔고수익률 조회 실패 - msg: {}", errorMsg);
            throw new RuntimeException("키움 API 오류: " + errorMsg);
        }

        log.info("일별잔고수익률 조회 성공 - 총평가금액: {}, 수익률: {}%",
                response.getTotalEvalAmount(), response.getTotalProfitRate());

        return response;
    }

    public DailyChartResponse getDailyChart(String stockCode, LocalDate baseDate) {
        String accessToken = getAccessToken();
        String baseDateStr = baseDate.format(DATE_FORMATTER);

        log.info("주식일봉차트 조회 요청 - 종목: {}, 기준일: {}", stockCode, baseDateStr);

        DailyChartResponse response = kiwoomRestClient.post()
                .uri("/api/dostk/chart")
                .header("Authorization", "Bearer " + accessToken)
                .header("api-id", API_ID_DAILY_CHART)
                .body(DailyChartRequest.of(stockCode, baseDateStr))
                .retrieve()
                .body(DailyChartResponse.class);

        if (response == null || response.getReturnCode() != 0) {
            String errorMsg = response != null ? response.getReturnMsg() : "응답 없음";
            log.error("주식일봉차트 조회 실패 - msg: {}", errorMsg);
            throw new RuntimeException("키움 API 오류: " + errorMsg);
        }

        int itemCount = response.getChartItems() != null ? response.getChartItems().size() : 0;
        log.info("주식일봉차트 조회 성공 - 종목: {}, 조회건수: {}", stockCode, itemCount);

        return response;
    }

    private synchronized String getAccessToken() {
        if (cachedToken != null && System.currentTimeMillis() < tokenExpiryTime) {
            return cachedToken;
        }

        log.info("키움 API 토큰 발급 요청");

        KiwoomTokenResponse tokenResponse = kiwoomRestClient.post()
                .uri("/oauth2/token")
                .body(KiwoomTokenRequest.of(kiwoomConfig.getAppKey(), kiwoomConfig.getSecretKey()))
                .retrieve()
                .body(KiwoomTokenResponse.class);

        if (tokenResponse == null || tokenResponse.getToken() == null) {
            throw new RuntimeException("키움 API 토큰 발급 실패");
        }

        cachedToken = tokenResponse.getToken();
        Long expiresIn = tokenResponse.getExpiresIn();
        tokenExpiryTime = System.currentTimeMillis() + (expiresIn != null ? expiresIn * 1000 : 3600000) - 60000;

        log.info("키움 API 토큰 발급 성공");

        return cachedToken;
    }
}

package com.hidvid.tradierpark.global.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/**
 * CORS 설정 프로퍼티
 *
 * @param allowedOrigins 허용된 Origin 패턴 목록
 * @param allowCredentials 쿠키/인증 헤더 허용 여부
 */
@ConfigurationProperties(prefix = "app.cors")
public record CorsProps(
        List<String> allowedOrigins,
        boolean allowCredentials
) { }

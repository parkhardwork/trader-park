package com.hidvid.tradierpark.global.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

/**
 * CORS 설정
 *
 * CorsFilter를 Security Filter보다 먼저 실행되도록 Order 0으로 등록.
 * Preflight(OPTIONS) 요청이 Security에서 차단되지 않도록 함.
 */
@Configuration
@EnableConfigurationProperties(CorsProps.class)
public class CorsConfig {

    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilter(CorsProps corsProps) {
        CorsConfiguration config = new CorsConfiguration();

        // Origin 설정 (credentials 사용 시 패턴 사용)
        config.setAllowedOriginPatterns(corsProps.allowedOrigins());
        config.setAllowCredentials(corsProps.allowCredentials());

        // 허용 메서드
        config.setAllowedMethods(List.of(
                RequestMethod.GET.name(),
                RequestMethod.POST.name(),
                RequestMethod.PUT.name(),
                RequestMethod.DELETE.name(),
                RequestMethod.PATCH.name(),
                RequestMethod.OPTIONS.name()
        ));

        // 허용 헤더
        config.setAllowedHeaders(List.of("*"));

        // 클라이언트가 접근 가능한 응답 헤더
        config.setExposedHeaders(List.of(
                "Authorization",
                "Content-Disposition",
                "X-Total-Count"
        ));

        // Preflight 캐시 (1시간)
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(source));
        bean.setOrder(0);  // 최우선 순위 - Security보다 먼저 실행

        return bean;
    }
}

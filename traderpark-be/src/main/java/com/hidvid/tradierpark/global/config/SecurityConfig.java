package com.hidvid.tradierpark.global.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

/**
 * Spring Security 및 CORS 설정
 */
@Configuration
@EnableWebSecurity
@EnableConfigurationProperties(CorsProps.class)
public class SecurityConfig {

    /**
     * Security Filter Chain 설정
     * - CSRF 비활성화 (REST API)
     * - Stateless 세션 관리
     * - API 엔드포인트 허용
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .formLogin(AbstractHttpConfigurer::disable)  // 폼 로그인 비활성화
            .httpBasic(AbstractHttpConfigurer::disable)  // HTTP Basic 인증 비활성화
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin)) // H2 Console
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/**").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                .anyRequest().permitAll()
            );

        return http.build();
    }

    /**
     * CORS Filter 설정
     * Security Filter보다 먼저 실행되도록 Order 0으로 등록
     */
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

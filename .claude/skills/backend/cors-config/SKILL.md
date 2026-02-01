---
name: cors-config
description: CORS configuration and troubleshooting for Spring Boot 3.x + Spring Security 6.x. Use when user mentions CORS, cross-origin, preflight, Access-Control headers, or frontend connection issues.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Spring CORS Configuration Guide

Spring Boot 3.x + Spring Security 6.x 환경에서 CORS 설정 및 문제 해결 가이드.

---

## 1. 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────────┐
│                     Browser (Frontend)                          │
│              Origin: http://localhost:3000                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼ (1) Preflight: OPTIONS /api/users
┌─────────────────────────────────────────────────────────────────┐
│                       CorsFilter                                │
│  Order: 0 (최우선)                                              │
│  - Access-Control-Allow-Origin 헤더 추가                        │
│  - Preflight(OPTIONS) 요청 처리                                 │
│  - 허용된 메서드/헤더 검증                                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼ (2) 실제 요청 전달
┌─────────────────────────────────────────────────────────────────┐
│                  SecurityFilterChain                            │
│  - CSRF 검사 (disabled for stateless)                           │
│  - JWT 인증                                                     │
│  - 권한 검사                                                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Controller                                │
└─────────────────────────────────────────────────────────────────┘
```

**핵심 포인트**: CorsFilter가 SecurityFilterChain보다 먼저 실행되어야 함

---

## 2. 구현 방법

### 방법 1: FilterRegistrationBean (권장)

Security Filter보다 먼저 실행되도록 Order 0으로 등록.

**CorsProps.java**
```java
package com.example.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import java.util.List;

@ConfigurationProperties(prefix = "app.cors")
public record CorsProps(
        List<String> allowedOrigins,
        boolean allowCredentials
) { }
```

**SecurityConfig.java**
```java
package com.example.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
@RequiredArgsConstructor
@EnableConfigurationProperties(CorsProps.class)
public class SecurityConfig {

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

        // Preflight 캐시 (선택)
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(source));
        bean.setOrder(0);  // 최우선 순위 - Security보다 먼저 실행

        return bean;
    }
}
```

**application.yml**
```yaml
app:
  cors:
    allowed-origins:
      - "http://localhost:3000"
      - "http://localhost:4200"
    allow-credentials: true
```

### 방법 2: SecurityFilterChain 내 cors() 설정

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .csrf(AbstractHttpConfigurer::disable)
        // ... 기타 설정
        ;
    return http.build();
}

@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOriginPatterns(List.of("http://localhost:*"));
    config.setAllowCredentials(true);
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
}
```

---

## 3. CORS 응답 헤더 설명

| 헤더 | 설명 | 예시 값 |
|------|------|---------|
| `Access-Control-Allow-Origin` | 허용된 Origin | `http://localhost:3000` |
| `Access-Control-Allow-Credentials` | 쿠키/인증 헤더 허용 | `true` |
| `Access-Control-Allow-Methods` | 허용된 HTTP 메서드 | `GET, POST, PUT, DELETE` |
| `Access-Control-Allow-Headers` | 허용된 요청 헤더 | `Authorization, Content-Type` |
| `Access-Control-Expose-Headers` | 클라이언트가 접근 가능한 응답 헤더 | `X-Custom-Header` |
| `Access-Control-Max-Age` | Preflight 캐시 시간 (초) | `3600` |

---

## 4. 환경별 설정 예시

### 로컬 개발 환경

```yaml
app:
  cors:
    allowed-origins:
      - "http://localhost:3000"    # React
      - "http://localhost:4200"    # Angular
      - "http://localhost:5173"    # Vite
    allow-credentials: true
```

### 개발/스테이징 환경

```yaml
app:
  cors:
    allowed-origins:
      - "https://dev.example.com"
      - "https://staging.example.com"
    allow-credentials: true
```

### 프로덕션 환경

```yaml
app:
  cors:
    allowed-origins:
      - "https://www.example.com"
      - "https://admin.example.com"
    allow-credentials: true
```

---

## 5. 주요 CORS 오류 및 해결

### 5.1 Preflight 요청 차단 (가장 흔함)

**오류 메시지**:
```
Access to XMLHttpRequest at 'http://api.example.com/users'
from origin 'http://localhost:3000' has been blocked by CORS policy:
Response to preflight request doesn't pass access control check
```

**원인**: OPTIONS 요청이 Security Filter에서 401/403으로 차단

**해결**:
1. CorsFilter Order를 0으로 설정 (Security보다 먼저)
2. `allowedMethods`에 `OPTIONS` 포함
3. Security에서 OPTIONS 허용:
```java
http.authorizeHttpRequests(auth ->
    auth.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
        .anyRequest().authenticated()
);
```

### 5.2 Credentials와 Wildcard 충돌

**오류 메시지**:
```
The value of the 'Access-Control-Allow-Origin' header must not be
the wildcard '*' when the request's credentials mode is 'include'
```

**원인**: `credentials: true`와 Origin `*` 동시 사용 불가

**해결**:
```java
// ❌ 잘못된 방법
config.setAllowedOrigins(List.of("*"));
config.setAllowCredentials(true);

// ✅ 올바른 방법
config.setAllowedOriginPatterns(List.of("*"));  // 패턴 사용
config.setAllowCredentials(true);
```

### 5.3 Authorization 헤더 차단

**오류 메시지**:
```
Request header field authorization is not allowed by
Access-Control-Allow-Headers in preflight response
```

**해결**:
```java
config.setAllowedHeaders(List.of("*"));
// 또는 명시적으로
config.setAllowedHeaders(List.of(
    "Authorization",
    "Content-Type",
    "X-Requested-With",
    "Accept"
));
```

### 5.4 CORS 헤더가 응답에 없음

**체크리스트**:
1. `@EnableConfigurationProperties` 어노테이션 확인
2. yml 설정 경로(prefix) 확인
3. FilterRegistrationBean 등록 여부
4. Filter Order가 0인지 확인
5. 요청 Origin이 allowedOrigins에 포함되는지 확인

### 5.5 특정 경로만 CORS 오류

**원인**: 해당 경로가 등록되지 않음

**해결**:
```java
source.registerCorsConfiguration("/**", config);  // 모든 경로
source.registerCorsConfiguration("/api/**", config);  // API 경로만
```

---

## 6. 디버깅 방법

### 6.1 curl로 Preflight 테스트

```bash
curl -X OPTIONS http://localhost:8080/api/users \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Authorization, Content-Type" \
  -v
```

**정상 응답**:
```
< HTTP/1.1 200
< Access-Control-Allow-Origin: http://localhost:3000
< Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
< Access-Control-Allow-Headers: *
< Access-Control-Allow-Credentials: true
< Access-Control-Max-Age: 3600
```

### 6.2 실제 요청 테스트

```bash
curl -X GET http://localhost:8080/api/users \
  -H "Origin: http://localhost:3000" \
  -H "Authorization: Bearer {token}" \
  -v
```

### 6.3 브라우저 개발자 도구

1. **Network 탭** → 실패한 요청 클릭
2. **Headers 탭** → Response Headers 확인
3. `Access-Control-*` 헤더 존재 여부 확인
4. Preflight (OPTIONS) 요청이 별도로 있는지 확인

---

## 7. 설정 체크리스트

### 서버 측
- [ ] CorsProps (또는 설정 클래스) 정의
- [ ] `@EnableConfigurationProperties` 추가
- [ ] CorsFilter Bean 등록
- [ ] Filter Order 0 설정
- [ ] `setAllowedOriginPatterns()` 사용 (credentials와 함께)
- [ ] `allowedMethods`에 OPTIONS 포함
- [ ] `allowedHeaders`에 필요한 헤더 포함
- [ ] 환경별 yml에 CORS 설정 추가

### 클라이언트 측
- [ ] 쿠키 사용 시 `withCredentials: true` 설정
- [ ] 절대 URL 사용 (개발 시 프록시 설정 고려)

---

## 8. 고급 설정

### 8.1 Exposed Headers

클라이언트에서 커스텀 응답 헤더 접근 필요 시:

```java
config.setExposedHeaders(List.of(
    "X-Total-Count",
    "X-Page-Number",
    "Content-Disposition"
));
```

### 8.2 경로별 다른 CORS 설정

```java
UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

// 공개 API - 모든 Origin 허용
CorsConfiguration publicConfig = new CorsConfiguration();
publicConfig.setAllowedOriginPatterns(List.of("*"));
publicConfig.setAllowedMethods(List.of("GET"));
source.registerCorsConfiguration("/public/**", publicConfig);

// 인증 필요 API - 특정 Origin만 허용
CorsConfiguration apiConfig = new CorsConfiguration();
apiConfig.setAllowedOriginPatterns(List.of("https://app.example.com"));
apiConfig.setAllowCredentials(true);
apiConfig.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
source.registerCorsConfiguration("/api/**", apiConfig);
```

### 8.3 동적 Origin 검증

```java
config.setAllowedOriginPatterns(List.of(
    "https://*.example.com",     // 서브도메인 허용
    "http://localhost:[*]"       // 모든 localhost 포트
));
```

---

## 9. 참고 자료

- [Spring Framework CORS Documentation](https://docs.spring.io/spring-framework/docs/current/reference/html/web.html#mvc-cors)
- [Spring Security CORS](https://docs.spring.io/spring-security/reference/servlet/integrations/cors.html)
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Fetch Standard - CORS Protocol](https://fetch.spec.whatwg.org/#http-cors-protocol)

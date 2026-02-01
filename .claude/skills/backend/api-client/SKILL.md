---
name: api-client
description: Spring Cloud OpenFeign을 활용한 선언적 REST 클라이언트 생성. 외부 API 연동, FeignClient 인터페이스 작성, 에러 처리, 재시도 설정 시 사용
allowed-tools:
  - Read
  - Edit
  - Write
  - Glob
  - Grep
  - Bash
---

# Spring Cloud OpenFeign 설정 가이드

Spring Cloud OpenFeign을 활용한 선언적 REST 클라이언트 설정 방법입니다.

---

## 1. 의존성 설정

### build.gradle

```gradle
plugins {
    id 'org.springframework.boot' version '2.7.0'
    id 'io.spring.dependency-management' version '1.0.11.RELEASE'
    id 'java'
}

ext {
    set('springCloudVersion', "2021.0.3")
}

dependencies {
    implementation 'org.springframework.cloud:spring-cloud-starter-openfeign'
}

dependencyManagement {
    imports {
        mavenBom "org.springframework.cloud:spring-cloud-dependencies:${springCloudVersion}"
    }
}
```

> **버전 호환성**: Spring Boot 버전에 맞는 Spring Cloud 버전을 사용해야 합니다.
> - Spring Boot 2.7.x → Spring Cloud 2021.0.x
> - Spring Boot 3.x → Spring Cloud 2022.0.x 이상

---

## 2. 글로벌 설정

### FeignConfiguration.java

```java
package com.app.global.config;

import feign.Logger;
import feign.Retryer;
import feign.codec.ErrorDecoder;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.cloud.openfeign.FeignClientsConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

@Configuration
@EnableFeignClients(basePackages = "com.app") // 프로젝트 패키지에 맞게 수정
@Import(FeignClientsConfiguration.class)
public class FeignConfiguration {

    /**
     * 로깅 레벨 설정
     * - NONE: 로깅 안함
     * - BASIC: 요청 메서드, URL, 응답 상태 코드, 실행 시간
     * - HEADERS: BASIC + 요청/응답 헤더
     * - FULL: HEADERS + 요청/응답 본문
     */
    @Bean
    Logger.Level feignLoggerLevel() {
        return Logger.Level.FULL;
    }

    /**
     * 커스텀 에러 디코더 등록
     */
    @Bean
    public ErrorDecoder errorDecoder() {
        return new FeignClientExceptionErrorDecoder();
    }

    /**
     * 재시도 설정
     * @param period 첫 재시도 대기 시간 (ms)
     * @param maxPeriod 최대 대기 시간 (ms)
     * @param maxAttempts 최대 재시도 횟수
     */
    @Bean
    public Retryer retryer() {
        return new Retryer.Default(1000, 2000, 3);
    }
}
```

### application.yml

```yaml
feign:
  client:
    config:
      default:
        connectTimeout: 5000  # 연결 타임아웃 (ms)
        readTimeout: 5000     # 읽기 타임아웃 (ms)

logging:
  level:
    com.app: debug  # Feign 로그 출력을 위해 debug 레벨 필요
```

---

## 3. 에러 처리 및 재시도

### FeignClientExceptionErrorDecoder.java

```java
package com.app.global.error;

import feign.FeignException;
import feign.Response;
import feign.RetryableException;
import feign.codec.ErrorDecoder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;

@Slf4j
public class FeignClientExceptionErrorDecoder implements ErrorDecoder {

    private ErrorDecoder errorDecoder = new Default();

    @Override
    public Exception decode(String methodKey, Response response) {
        log.error("{} 요청 실패, status : {}, reason : {}",
                  methodKey, response.status(), response.reason());

        FeignException exception = FeignException.errorStatus(methodKey, response);
        HttpStatus httpStatus = HttpStatus.valueOf(response.status());

        // 5xx 서버 에러는 재시도
        if (httpStatus.is5xxServerError()) {
            return new RetryableException(
                    response.status(),
                    exception.getMessage(),
                    response.request().httpMethod(),
                    exception,
                    null,
                    response.request()
            );
        }

        // 그 외 에러는 기본 디코더에 위임
        return errorDecoder.decode(methodKey, response);
    }
}
```

---

## 4. FeignClient 인터페이스 작성

### 기본 GET 요청

```java
package com.app.api.feigntest.client;

import com.app.api.health.dto.HealthCheckResponseDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(url = "http://localhost:8080", name = "helloClient")
public interface HelloClient {

    @GetMapping(value = "/api/health", consumes = "application/json")
    HealthCheckResponseDto healthCheck();
}
```

### POST 요청 + Query Parameter

```java
package com.app.web.kakaotoken.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.cloud.openfeign.SpringQueryMap;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(url = "https://kauth.kakao.com", name = "kakaoTokenClient")
public interface KakaoTokenClient {

    @PostMapping(value = "/oauth/token", consumes = "application/json")
    KakaoTokenDto.Response requestKakaoToken(
            @RequestHeader("Content-Type") String contentType,
            @SpringQueryMap KakaoTokenDto.Request request  // DTO → 쿼리 파라미터 변환
    );
}
```

### GET 요청 + Authorization Header

```java
package com.app.external.oauth.kakao.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(url = "https://kapi.kakao.com", name = "kakaoUserInfoClient")
public interface KakaoUserInfoClient {

    @GetMapping(value = "/v2/user/me", consumes = "application/json")
    KakaoUserInfoResponseDto getKakaoUserInfo(
            @RequestHeader("Content-type") String contentType,
            @RequestHeader("Authorization") String accessToken  // Bearer 토큰
    );
}
```

---

## 5. 사용 예제

### Controller에서 사용

```java
package com.app.api.feigntest.controller;

import com.app.api.feigntest.client.HelloClient;
import com.app.api.health.dto.HealthCheckResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class HealthFeignTestController {

    private final HelloClient helloClient;  // 의존성 주입

    @GetMapping("/health/feign-test")
    public ResponseEntity<HealthCheckResponseDto> healthCheckTest() {
        HealthCheckResponseDto response = helloClient.healthCheck();
        return ResponseEntity.ok(response);
    }
}
```

---

## 6. 주요 어노테이션 정리

| 어노테이션 | 용도 |
|-----------|------|
| `@FeignClient` | FeignClient 인터페이스 선언 |
| `@EnableFeignClients` | FeignClient 스캔 활성화 |
| `@GetMapping`, `@PostMapping` 등 | HTTP 메서드 정의 |
| `@RequestHeader` | 요청 헤더 추가 |
| `@RequestParam` | 쿼리 파라미터 추가 |
| `@PathVariable` | URL 경로 변수 |
| `@RequestBody` | 요청 본문 |
| `@SpringQueryMap` | DTO를 쿼리 파라미터로 변환 |

---

## 7. 고급 설정

### 클라이언트별 개별 설정

```yaml
feign:
  client:
    config:
      helloClient:  # 특정 클라이언트만 설정
        connectTimeout: 3000
        readTimeout: 3000
        loggerLevel: BASIC
```

### 클라이언트별 Configuration 클래스

```java
@FeignClient(
    url = "http://api.example.com",
    name = "customClient",
    configuration = CustomFeignConfig.class  // 개별 설정 클래스
)
public interface CustomClient {
    // ...
}
```

### Fallback 처리 (Circuit Breaker)

```java
@FeignClient(
    url = "http://api.example.com",
    name = "resilientClient",
    fallback = ResilientClientFallback.class
)
public interface ResilientClient {
    @GetMapping("/data")
    DataResponse getData();
}

@Component
public class ResilientClientFallback implements ResilientClient {
    @Override
    public DataResponse getData() {
        return DataResponse.empty();  // 기본값 반환
    }
}
```

---

## 8. 체크리스트

프로젝트에 FeignClient 적용 시 확인할 항목:

- [ ] `spring-cloud-starter-openfeign` 의존성 추가
- [ ] Spring Cloud BOM 버전 설정 (Spring Boot 버전과 호환 확인)
- [ ] `@EnableFeignClients(basePackages = "...")` 패키지 설정
- [ ] `application.yml`에 타임아웃 설정
- [ ] 로깅 레벨 설정 (개발: FULL, 운영: BASIC 권장)
- [ ] ErrorDecoder 커스터마이징 (필요 시)
- [ ] Retryer 설정 (재시도 정책)

---

## 참고 자료

- [Spring Cloud OpenFeign 공식 문서](https://docs.spring.io/spring-cloud-openfeign/docs/current/reference/html/)
- [OpenFeign GitHub](https://github.com/OpenFeign/feign)

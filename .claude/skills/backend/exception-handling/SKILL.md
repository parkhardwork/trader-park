---
name: exception-handling
description: Spring Boot exception handling pattern with ErrorCode enum and GlobalExceptionHandler. Use when user mentions exception, error handling, GlobalExceptionHandler, ErrorCode, or ProblemDetail.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Spring Boot Exception Handling Pattern

다른 프로젝트에서 재사용 가능한 Exception 처리 패턴입니다.

## 개요

이 패턴은 다음 요소로 구성됩니다:
1. **ErrorCode enum** - 에러 코드, 메시지, HTTP 상태 정의
2. **ServiceException** - 기본 예외 클래스
3. **구체적인 예외 클래스들** - HTTP 상태별 예외
4. **GlobalExceptionHandler** - 중앙 집중식 예외 처리

## 구조

```
exception/
├── ErrorCode.java              # 에러 코드 enum
├── ServiceException.java       # 기본 예외 클래스
├── BadRequestException.java    # 400 Bad Request
├── AuthException.java          # 401 Unauthorized
├── ForbiddenException.java     # 403 Forbidden
└── InternalServerErrorException.java  # 500 Internal Server Error

handler/
└── GlobalExceptionHandler.java # @RestControllerAdvice
```

## 1. ErrorCode Enum

모든 에러 코드를 중앙에서 관리합니다.

```java
package com.example.exception;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpStatus;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public enum ErrorCode {

    // 일반 오류 (4000~)
    NOT_FOUND("4001", "Content is not exists", HttpStatus.BAD_REQUEST),
    INVALID_PARAMETER("4002", "Invalid parameter", HttpStatus.BAD_REQUEST),
    PAGE_SIZE_INVALID("4003", "page size is invalid", HttpStatus.BAD_REQUEST),
    SPECIFIC_REQUIRED("4004", "%s is required", HttpStatus.BAD_REQUEST),
    SPECIFIC_NOT_ALLOWED("4005", "%s is not allowed", HttpStatus.BAD_REQUEST),

    // 인증 오류 (4100~)
    AUTH_UNAUTHORIZED("4100", "Unauthorized", HttpStatus.UNAUTHORIZED),
    AUTH_FORBIDDEN("4101", "Access Denied", HttpStatus.FORBIDDEN),
    AUTH_NOT_EXISTS_USER("4102", "User is not exists", HttpStatus.UNAUTHORIZED),

    // 도메인별 오류 (4200~, 4300~ ...)
    // 프로젝트에 맞게 추가

    ;

    @Getter
    String code;
    String message;
    @Getter
    HttpStatus httpStatus;
    @NonFinal
    String formattedMessage;

    public String getMessage() {
        return StringUtils.isNotEmpty(formattedMessage) ? formattedMessage : message;
    }

    /**
     * 동적 메시지 포맷팅
     * 사용: ErrorCode.SPECIFIC_REQUIRED.format("username")
     * 결과: "username is required"
     */
    public ErrorCode format(Object... args) {
        formattedMessage = message.formatted(args);
        return this;
    }
}
```

### ErrorCode 설계 원칙

| 코드 범위 | 용도 |
|----------|------|
| 4000~4099 | 일반 요청 오류 |
| 4100~4199 | 인증/인가 오류 |
| 4200~4299 | 파일 관련 오류 |
| 4300~4399 | 도메인별 오류 (확장) |

## 2. ServiceException (기본 예외 클래스)

```java
package com.example.exception;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ServiceException extends RuntimeException {
    ErrorCode errorCode;

    public ServiceException(ErrorCode errorCode) {
        this.errorCode = errorCode;
    }

    public ServiceException() {
    }
}
```

## 3. 구체적인 예외 클래스들

### BadRequestException (400)

```java
package com.example.exception;

public class BadRequestException extends ServiceException {
    public BadRequestException(ErrorCode errorCode) {
        super(errorCode);
    }
}
```

### AuthException (401)

```java
package com.example.exception;

public class AuthException extends ServiceException {
    public AuthException(ErrorCode errorCode) {
        super(errorCode);
    }
}
```

### ForbiddenException (403)

```java
package com.example.exception;

public class ForbiddenException extends ServiceException {
    public ForbiddenException(ErrorCode errorCode) {
        super(errorCode);
    }
}
```

### InternalServerErrorException (500)

```java
package com.example.exception;

public class InternalServerErrorException extends ServiceException {
}
```

## 4. GlobalExceptionHandler

RFC 7807 ProblemDetail 형식으로 응답합니다.

```java
package com.example.handler;

import com.example.exception.*;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.TypeMismatchException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ==================== 커스텀 예외 ====================

    @ExceptionHandler(AuthException.class)
    public ProblemDetail handleAuthException(AuthException e) {
        log.info("{}: {}", e.getStackTrace()[0], e.getErrorCode().getMessage());
        return getProblemDetail(HttpStatus.UNAUTHORIZED, e.getErrorCode());
    }

    @ExceptionHandler(BadRequestException.class)
    public ProblemDetail handleBadRequestException(BadRequestException e) {
        log.info("{}: {}", e.getStackTrace()[0], e.getErrorCode().getMessage());
        return getProblemDetail(HttpStatus.BAD_REQUEST, e.getErrorCode());
    }

    @ExceptionHandler(ForbiddenException.class)
    public ProblemDetail handleForbiddenException(ForbiddenException e) {
        log.info("{}: {}", e.getStackTrace()[0], e.getErrorCode().getMessage());
        return getProblemDetail(HttpStatus.FORBIDDEN, e.getErrorCode());
    }

    @ExceptionHandler(InternalServerErrorException.class)
    public ProblemDetail handleInterruptedException(InternalServerErrorException e) {
        return getProblemDetail(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // ==================== Spring Security 예외 ====================

    @ExceptionHandler(AuthorizationDeniedException.class)
    public ProblemDetail handleAuthorizationDeniedException(AuthorizationDeniedException e) {
        log.info(e.getMessage(), e);
        return getProblemDetail(HttpStatus.FORBIDDEN, ErrorCode.AUTH_FORBIDDEN);
    }

    // ==================== Validation 예외 ====================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        log.info(e.getMessage(), e);
        String message = e.getFieldErrors().stream()
                .map(error -> error.getField() + " " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return getProblemDetail(HttpStatus.BAD_REQUEST, message);
    }

    @ExceptionHandler(BindException.class)
    public ProblemDetail handleBindException(BindException e) {
        log.info(e.getMessage(), e);
        String message = e.getFieldErrors().stream()
                .map(error -> error.getField() + " " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return getProblemDetail(HttpStatus.BAD_REQUEST, message);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ProblemDetail handleConstraintViolationException(ConstraintViolationException e) {
        log.info(e.getMessage(), e);
        String message = e.getConstraintViolations().stream()
                .map(error -> error.getPropertyPath().toString() + " " + error.getMessage())
                .collect(Collectors.joining(", "));
        return getProblemDetail(HttpStatus.BAD_REQUEST, message);
    }

    @ExceptionHandler(TypeMismatchException.class)
    public ProblemDetail handleTypeMismatchException(TypeMismatchException e) {
        log.info(e.getMessage(), e);
        String message = e.getPropertyName() + " is required type " + e.getRequiredType();
        return getProblemDetail(HttpStatus.BAD_REQUEST, message);
    }

    // ==================== 기타 예외 ====================

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ProblemDetail handleHttpMessageNotReadableException(HttpMessageNotReadableException e) {
        log.info(e.getMessage(), e);
        return getProblemDetail(HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ProblemDetail handleNoResourceFoundException(NoResourceFoundException e) {
        log.info(e.getMessage(), e);
        return e.getBody();
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleException(Exception e) {
        log.error(e.getMessage(), e);
        return getProblemDetail(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // ==================== Helper Methods ====================

    private ProblemDetail getProblemDetail(HttpStatus httpStatus, ErrorCode errorCode) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(httpStatus, errorCode.getMessage());
        problemDetail.setProperty("timestamp", LocalDateTime.now());
        problemDetail.setProperty("errorCode", errorCode.getCode());
        return problemDetail;
    }

    private ProblemDetail getProblemDetail(HttpStatus httpStatus) {
        ProblemDetail problemDetail = ProblemDetail.forStatus(httpStatus);
        problemDetail.setProperty("timestamp", LocalDateTime.now());
        problemDetail.setProperty("errorCode", String.valueOf(httpStatus.value()));
        return problemDetail;
    }

    private ProblemDetail getProblemDetail(HttpStatus httpStatus, String message) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(httpStatus, message);
        problemDetail.setProperty("timestamp", LocalDateTime.now());
        problemDetail.setProperty("errorCode", String.valueOf(httpStatus.value()));
        return problemDetail;
    }
}
```

## 사용 예시

### 1. 기본 사용

```java
@Service
public class UserService {

    public User getUser(Long id) {
        return Optional.ofNullable(userRepository.findById(id))
            .orElseThrow(() -> new BadRequestException(ErrorCode.NOT_FOUND));
    }
}
```

### 2. 동적 메시지 포맷팅

```java
public void validateRequest(Request request) {
    if (request.getUsername() == null) {
        throw new BadRequestException(ErrorCode.SPECIFIC_REQUIRED.format("username"));
        // 결과: "username is required"
    }
}
```

### 3. 인증 예외

```java
public void authenticate(String token) {
    if (!isValid(token)) {
        throw new AuthException(ErrorCode.AUTH_UNAUTHORIZED);
    }
}
```

### 4. orElseThrow 패턴

```java
public PgInfo getPgById(Long pgId) {
    return Optional.ofNullable(pgRepository.getById(pgId))
        .orElseThrow(() -> new BadRequestException(ErrorCode.PG_IS_NOT_EXIST));
}
```

## API 응답 예시

### 성공하지 않은 요청 (400 Bad Request)

```json
{
    "type": "about:blank",
    "title": "Bad Request",
    "status": 400,
    "detail": "Content is not exists",
    "instance": "/api/users/999",
    "timestamp": "2024-01-15T10:30:00",
    "errorCode": "4001"
}
```

### 인증 실패 (401 Unauthorized)

```json
{
    "type": "about:blank",
    "title": "Unauthorized",
    "status": 401,
    "detail": "Unauthorized",
    "instance": "/api/admin/users",
    "timestamp": "2024-01-15T10:30:00",
    "errorCode": "4100"
}
```

### Validation 실패 (400 Bad Request)

```json
{
    "type": "about:blank",
    "title": "Bad Request",
    "status": 400,
    "detail": "username must not be blank, email must be valid",
    "instance": "/api/users",
    "timestamp": "2024-01-15T10:30:00",
    "errorCode": "400"
}
```

## 필수 의존성

```gradle
// build.gradle.kts
dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-security") // optional

    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")

    implementation("org.apache.commons:commons-lang3")
}
```

## 체크리스트

새 프로젝트에 적용할 때:

- [ ] `exception` 패키지 생성
- [ ] `ErrorCode` enum 생성 (프로젝트에 맞게 커스터마이징)
- [ ] `ServiceException` 및 구체적 예외 클래스 생성
- [ ] `GlobalExceptionHandler` 생성
- [ ] 프로젝트별 도메인 에러 코드 추가

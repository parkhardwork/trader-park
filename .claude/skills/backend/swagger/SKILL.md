---
name: swagger-openapi
description: Springdoc OpenAPI (Swagger) configuration for Spring Boot 3.x. Use when user mentions Swagger, OpenAPI, API documentation, @Schema, @Operation, @Tag, DescConst, or API docs setup.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Spring Boot 3 + Springdoc OpenAPI Swagger 설정 가이드

---

## 1. 의존성

```kotlin
// build.gradle.kts
implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8.14")
```

---

## 2. Swagger 설정 클래스

JWT Bearer 인증과 API 메타데이터를 설정합니다.

```java
package com.example.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.utils.SpringDocUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {
    private static final String SECURITY_SCHEME = "bearerAuth";

    @Value("${app.api.host:http://localhost:8080}")
    private String host;

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .components(
                        new Components()
                                .addSecuritySchemes(
                                        SECURITY_SCHEME,
                                        new SecurityScheme()
                                                .name(SECURITY_SCHEME)
                                                .type(SecurityScheme.Type.HTTP)
                                                .scheme("bearer")
                                                .bearerFormat("JWT")
                                )
                )
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME))
                .info(apiInfo())
                .servers(List.of(new Server().url(host)));
    }

    private Info apiInfo() {
        return new Info()
                .title("API Specification")
                .description("API 문서입니다.")
                .version("1.0")
                .contact(new Contact().name("Team").email("team@example.com"))
                .license(new License().name("Proprietary"));
    }
}
```

---

## 3. Schema Description 상수 인터페이스

DTO의 `@Schema(description = ...)` 값을 상수로 관리합니다. 하드코딩을 방지하고 일관성을 유지합니다.

```java
package com.example.swagger.constants;

public interface DescConst {
    // 공통
    String PAGE_NUMBER = "page number";
    String PAGE_SIZE = "page size";
    String TOTAL_COUNT = "total count";
    String PAGE_INFO = "page information";
    String ORDER_FIELD = "sorting field";
    String ORDER_TYPE = "order type(asc, desc)";

    // 엔티티별 상수 추가
    // User
    String USER_ID = "user id";
    String USER_NAME = "user name";
    String USER_EMAIL = "user email";

    // 도메인별로 그룹화하여 관리
}
```

---

## 4. 기본값 상수 인터페이스

```java
package com.example.swagger.constants;

public interface DefaultValueConst {
    String ORDER_FIELD_UPDATED_AT = "UPDATED_AT";
    String ORDER_TYPE_DESC = "DESC";
    String ORDER_TYPE_ASC = "ASC";
}
```

---

## 5. 공통 페이지 Request DTO

```java
package com.example.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CommonPageRequest {
    @Schema(description = "page no", requiredMode = Schema.RequiredMode.NOT_REQUIRED, defaultValue = "1")
    int page;

    @Schema(description = "page size(5, 10)", requiredMode = Schema.RequiredMode.NOT_REQUIRED,
            defaultValue = "10", allowableValues = {"5", "10"})
    int size;

    public Page toPage() {
        return Page.of(size, page);
    }
}
```

---

## 6. 공통 페이지 Response DTO

```java
package com.example.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.experimental.FieldDefaults;
import java.util.List;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Getter
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class CommonPageResponse<T> {
    int page;
    int size;
    int totalCount;
    List<T> list;

    public static <T> CommonPageResponse<T> of(Page page, int totalCount, List<T> list) {
        return new CommonPageResponse<>(page.getPage(), page.getSize(), totalCount, list);
    }
}
```

---

## 7. Request DTO 패턴

`CommonPageRequest`를 상속하고 `@Schema` + `DescConst`를 사용합니다.

```java
package com.example.dto.request.user;

import com.example.dto.request.CommonPageRequest;
import com.example.dto.request.OrderType;
import com.example.swagger.constants.DefaultValueConst;
import com.example.swagger.constants.DescConst;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;
import java.util.List;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SearchUserRequest extends CommonPageRequest {
    @Schema(description = DescConst.USER_NAME, requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    String userName;

    @Schema(description = DescConst.USER_STATUS, requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    List<UserStatusType> statusList;

    @Schema(description = DescConst.ORDER_FIELD, requiredMode = Schema.RequiredMode.NOT_REQUIRED,
            defaultValue = DefaultValueConst.ORDER_FIELD_UPDATED_AT)
    UserOrderField orderField = UserOrderField.UPDATED_AT;

    @Schema(description = DescConst.ORDER_TYPE, requiredMode = Schema.RequiredMode.NOT_REQUIRED,
            defaultValue = DefaultValueConst.ORDER_TYPE_ASC)
    OrderType orderType = OrderType.ASC;
}
```

---

## 8. Response DTO 패턴 (record 타입)

`record`를 사용하고 `static of()` 팩토리 메서드를 제공합니다.

```java
package com.example.dto.response.user;

import com.example.swagger.constants.DescConst;
import io.swagger.v3.oas.annotations.media.Schema;

public record UserResponse(
        @Schema(description = DescConst.USER_ID, requiredMode = Schema.RequiredMode.REQUIRED)
        String userId,

        @Schema(description = DescConst.USER_NAME, requiredMode = Schema.RequiredMode.REQUIRED)
        String userName,

        @Schema(description = DescConst.USER_EMAIL, requiredMode = Schema.RequiredMode.NOT_REQUIRED)
        String email
) {
    public static UserResponse of(String userId, String userName, String email) {
        return new UserResponse(userId, userName, email);
    }
}
```

---

## 9. List Response DTO 패턴 (페이지네이션 래핑)

```java
package com.example.dto.response.user;

import com.example.dto.response.CommonPageResponse;
import com.example.swagger.constants.DescConst;
import io.swagger.v3.oas.annotations.media.Schema;

public record UserListResponse(
        @Schema(description = DescConst.PAGE_INFO)
        CommonPageResponse<UserResponse> page
) {
    public static UserListResponse of(CommonPageResponse<UserResponse> page) {
        return new UserListResponse(page);
    }
}
```

## 10. Controller 패턴

```java
package com.example.controller;

import com.example.dto.request.user.SearchUserRequest;
import com.example.dto.response.user.UserListResponse;
import com.example.dto.response.user.UserResponse;
import com.example.security.dto.UserLoginInfo;
import com.example.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import static lombok.AccessLevel.PRIVATE;

@RestController
@RequestMapping("${api.base}${api.version}/users")
@Tag(name = "User", description = "User Management API")
@FieldDefaults(level = PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class UserController {

    UserService userService;

    @GetMapping
    @Operation(summary = "Get user list", description = "Retrieve all user list.")
    @ApiResponse(responseCode = "200", description = "User list retrieved successfully")
    public ResponseEntity<UserListResponse> getUserList(
            @ParameterObject SearchUserRequest request,
            @AuthenticationPrincipal UserLoginInfo userLoginInfo) {
        UserListResponse response = userService.getUserList(request, userLoginInfo);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{userId}")
    @Operation(summary = "Get user", description = "Retrieve user details.")
    @ApiResponse(responseCode = "200", description = "User retrieved successfully")
    public ResponseEntity<UserResponse> getUser(
            @PathVariable("userId") String userId,
            @AuthenticationPrincipal UserLoginInfo userLoginInfo) {
        UserResponse response = userService.getUser(userId, userLoginInfo);
        return ResponseEntity.ok(response);
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Create user", description = "Create a new user.")
    @ApiResponse(responseCode = "200", description = "User created successfully")
    public ResponseEntity<UserResponse> createUser(
            @Valid @RequestBody CreateUserRequest request,
            @AuthenticationPrincipal UserLoginInfo userLoginInfo) {
        UserResponse response = userService.createUser(request, userLoginInfo);
        return ResponseEntity.ok(response);
    }

    @PutMapping(value = "/{userId}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Update user", description = "Update user information.")
    @ApiResponse(responseCode = "200", description = "User updated successfully")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable("userId") String userId,
            @Valid @RequestBody UpdateUserRequest request,
            @AuthenticationPrincipal UserLoginInfo userLoginInfo) {
        UserResponse response = userService.updateUser(userId, request, userLoginInfo);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{userId}")
    @Operation(summary = "Delete user", description = "Delete a user.")
    @ApiResponse(responseCode = "200", description = "User deleted successfully")
    public ResponseEntity<Void> deleteUser(
            @PathVariable("userId") String userId,
            @AuthenticationPrincipal UserLoginInfo userLoginInfo) {
        userService.deleteUser(userId, userLoginInfo);
        return ResponseEntity.ok().build();
    }
}
```

---

## 11. Application YAML 설정

```yaml
# application.yml
springdoc:
  swagger-ui:
    enabled: true
    path: /swagger-ui.html
  api-docs:
    path: /v3/api-docs
```

---

## 12. 주요 어노테이션 정리

| 어노테이션 | 위치 | 용도 |
|-----------|------|------|
| `@Tag` | Controller 클래스 | API 그룹명과 설명 |
| `@Operation` | Controller 메서드 | API 요약과 상세 설명 |
| `@ApiResponse` | Controller 메서드 | 응답 코드와 설명 |
| `@ParameterObject` | Query Parameter DTO | DTO를 query param으로 펼침 |
| `@Schema` | DTO 필드 | 필드 설명, 필수 여부, 기본값, 허용값 |


## 13. 패키지 구조

```
src/main/java/com/example/
├── config/
│   └── SwaggerConfig.java
└── swagger/
    └── constants/
        ├── DescConst.java
        └── DefaultValueConst.java
```

---

## 14. 핵심 규칙

1. **DescConst 필수 사용**: `@Schema(description = ...)` 값은 항상 `DescConst` 상수 사용
2. **하드코딩 금지**: Schema description에 문자열 리터럴 직접 사용 금지
3. **record 타입**: Response DTO는 `record` 타입 + `static of()` 팩토리 메서드
4. **CommonPageRequest 상속**: 페이지네이션이 필요한 Request DTO는 상속
5. **CommonPageResponse 래핑**: List Response는 CommonPageResponse를 필드로 래핑
6. **@ParameterObject**: Query Parameter DTO는 반드시 `@ParameterObject` 사용
7. **@Valid**: Request Body에 Jakarta Validation 적용 시 `@Valid` 명시

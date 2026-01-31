---
name: spring-auth
description: JWT-based stateless authentication for Spring Boot 3.x + Spring Security 6.x. Use when user mentions auth, authentication, JWT, token, login, security config, or access control.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Spring Security JWT Authentication Guide

Stateless JWT 인증 구현을 위한 아키텍처 가이드.

---

## 1. 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Request                           │
│                   Authorization: Bearer {token}                 │
└──────────────────────────┬──────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  JwtAuthenticationFilter                        │
│  - Bearer 토큰 추출                                              │
│  - 토큰 유효성 검증                                               │
│  - SecurityContext에 Authentication 설정                         │
└──────────────────────────┬──────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SecurityFilterChain                          │
│  - 인가(Authorization) 검사                                      │
│  - 실패 시 EntryPoint/AccessDeniedHandler 호출                   │
└──────────────────────────┬──────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Controller                                │
│  - @PreAuthorize로 세부 권한 검사                                 │
│  - SecurityContextHolder에서 사용자 정보 조회                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 필수 구성요소

### 2.1 SecurityConfig
**역할**: Spring Security 설정의 중심

**설정 방향**:
- `SessionCreationPolicy.STATELESS` - 세션 미사용
- CSRF 비활성화 (Stateless API에서는 불필요)
- Form Login / HTTP Basic 비활성화
- JWT Filter를 `UsernamePasswordAuthenticationFilter` 이전에 배치
- 인증/인가 실패 핸들러 등록

**고려사항**:
- 공개 경로는 `WebSecurityCustomizer`로 Security Filter 자체를 우회
- CORS는 Security보다 먼저 처리되도록 필터 순서 조정

### 2.2 JwtTokenProvider
**역할**: JWT 토큰 생성, 검증, 파싱

**핵심 기능**:
- Access Token 생성 (짧은 만료, claims 포함)
- Refresh Token 생성 (긴 만료, subject만 포함)
- 토큰 검증 (`ExpiredJwtException` 분리 처리)
- Bearer prefix 제거
- Claims 파싱

**설계 결정**:
- Secret Key: `@Value`로 주입, `@PostConstruct`에서 SecretKey 초기화
- 만료 시간: 설정 파일에서 관리 (access: 1시간, refresh: 7일 권장)
- 알고리즘: HS256 (HMAC-SHA256) 또는 RS256 (RSA) 선택

### 2.3 AuthenticationFilter
**역할**: 모든 요청에서 JWT 검증

**구현 방향**:
- `OncePerRequestFilter` 상속 (요청당 1회 실행 보장)
- Authorization 헤더에서 토큰 추출
- 유효한 토큰이면 `SecurityContextHolder`에 Authentication 설정
- 유효하지 않으면 그냥 통과 (SecurityFilterChain이 처리)

**주의사항**:
- Filter에서 예외를 던지지 않음 (인증 실패는 EntryPoint가 처리)
- 토큰이 없어도 필터 체인은 계속 진행

### 2.4 UserDetails 구현체
**역할**: 인증된 사용자 정보 래핑

**설계 결정**:
- 프로젝트에 필요한 필드 추가 (userId, role, permissions 등)
- `getAuthorities()`에서 역할/권한 반환
- 역할은 `ROLE_` prefix 사용 (Spring Security 규약)

### 2.5 Exception Handlers
**역할**: 인증/인가 실패 시 일관된 응답

| Handler | 상황 | HTTP Status |
|---------|------|-------------|
| `AuthenticationEntryPoint` | 인증 실패 (토큰 없음/만료) | 401 |
| `AccessDeniedHandler` | 인가 실패 (권한 부족) | 403 |

**응답 형식**: RFC 7807 ProblemDetail 권장

---

## 3. 구현 체크리스트

### Dependencies
- [ ] `spring-boot-starter-security`
- [ ] `jjwt-api`, `jjwt-impl`, `jjwt-jackson` (0.12.x)

### Configuration
- [ ] `jwt.secret` - 환경변수로 주입 (최소 32자)
- [ ] `jwt.access-expiration-ms`
- [ ] `jwt.refresh-expiration-ms`

### Security Classes
- [ ] SecurityConfig (SecurityFilterChain, WebSecurityCustomizer)
- [ ] JwtTokenProvider (@Component)
- [ ] JwtAuthenticationFilter (extends OncePerRequestFilter)
- [ ] UserLoginInfo (implements UserDetails)
- [ ] JwtAuthenticationEntryPoint (implements AuthenticationEntryPoint)
- [ ] JwtAccessDeniedHandler (implements AccessDeniedHandler)

### Auth Endpoints (공개 경로로 설정)
- [ ] POST `/auth/login` - 로그인, Access/Refresh Token 발급
- [ ] POST `/auth/refresh` - Refresh Token으로 Access Token 재발급
- [ ] POST `/auth/logout` - Refresh Token 무효화 (서버측 저장 시)

---

## 4. 토큰 전략

### Access Token vs Refresh Token

| 구분 | Access Token | Refresh Token |
|------|--------------|---------------|
| 목적 | API 인증 | Access Token 재발급 |
| 만료 | 짧음 (15분~1시간) | 김 (7~30일) |
| 저장 | 메모리 (클라이언트) | HttpOnly Cookie 또는 DB |
| Claims | 사용자 정보 포함 | subject만 포함 |

### Refresh Token 관리 방식

**Option 1: Stateless**
- Refresh Token도 서버에 저장하지 않음
- 단점: 강제 로그아웃 불가

**Option 2: DB 저장 (권장)**
- 사용자별 Refresh Token DB 저장
- 로그아웃 시 삭제, 재발급 시 갱신
- Token Rotation 적용 가능

**Option 3: Redis 저장**
- TTL 활용한 자동 만료
- 빠른 조회/삭제

---

## 5. 권한 설계

### Role vs Authority

```
Role (역할)          Authority (세부 권한)
├── ADMIN           ├── USER_READ
├── MANAGER    →    ├── USER_WRITE
├── USER            ├── ORDER_CREATE
└── GUEST           └── REPORT_VIEW
```

### 적용 방법

**URL 기반** - SecurityConfig에서 설정
```
/admin/** → ROLE_ADMIN
/api/** → authenticated
```

**메서드 기반** - @PreAuthorize 사용
```
@PreAuthorize("hasRole('ADMIN')")
@PreAuthorize("hasAuthority('USER_WRITE')")
@PreAuthorize("hasRole('USER') and #userId == principal.userId")
```

---

## 6. 보안 고려사항

### Secret Key 관리
- 환경변수 또는 Secret Manager 사용
- 최소 256비트 (32자 이상)
- 주기적 로테이션 계획

### 토큰 저장 (클라이언트)
- **권장**: Access Token은 메모리, Refresh Token은 HttpOnly Cookie
- **금지**: localStorage (XSS 취약)

### 추가 보안 헤더
- Content-Security-Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff

### Refresh Token Rotation
- Refresh 사용 시 새로운 Refresh Token 발급
- 이전 토큰 무효화
- Token 재사용 감지 시 전체 세션 무효화

---

## 7. 테스트 전략

### 단위 테스트
- JwtTokenProvider: 토큰 생성/검증/파싱
- 만료된 토큰 처리
- 잘못된 시그니처 처리

### 통합 테스트
- `@WithMockUser` 또는 `@WithSecurityContext` 활용
- 인증 필요 엔드포인트 접근 테스트
- 권한별 접근 제어 테스트

### 테스트용 설정
- 테스트 프로파일에서 간단한 secret 사용
- MockMvc + SecurityMockMvcConfigurers

---

## 8. 확장 포인트

### Multi-tenancy
- Claims에 tenantId 포함
- Filter에서 TenantContext 설정

### OAuth2/OIDC 통합
- Social Login 추가 시 OAuth2 Resource Server 활용
- JWT issuer 검증 추가

### API Key 인증 병행
- 서버간 통신용 API Key 인증
- 별도 Filter 추가 또는 조건부 처리

---

## 9. 트러블슈팅 가이드

| 증상 | 원인 | 해결 |
|------|------|------|
| 모든 요청 401 | Filter 미등록 또는 순서 오류 | SecurityFilterChain 확인 |
| 모든 요청 403 | Role prefix 불일치 | `ROLE_` prefix 확인 |
| 토큰 검증 실패 | Secret Key 불일치 | 환경별 설정 확인 |
| CORS 오류 | preflight 요청 차단 | OPTIONS 허용, 필터 순서 조정 |
| 로그아웃 후 접근 가능 | Stateless 특성 | Refresh Token DB 관리 |

---

## 10. 참고 자료

- Spring Security Reference (6.x)
- JJWT Documentation
- OWASP JWT Security Cheat Sheet
- RFC 7519 (JWT), RFC 7807 (Problem Details)

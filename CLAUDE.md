# 트레이더 박씨 (Trader Park)

직장인을 위한 주식 자동매매 서비스

## 개발계획서

상세 개발계획서: `docs/개발계획서.md`

작업 전 반드시 개발계획서를 참조하여 다음을 확인하세요:
- 프로젝트 구조
- 기술 스택 및 버전
- API 설계
- 데이터베이스 설계
- 현재 마일스톤 진행 상황

## 기술 스택

### Backend
- Java 21, Spring Boot 3.4.x
- Spring Data JPA, Spring Security + OAuth2
- MySQL 8.x, Redis 7.x, Apache Kafka 3.x

### Frontend
- Next.js 14.x, TypeScript 5.x
- Zustand 5.x (클라이언트 상태), TanStack Query 5.x (서버 상태)
- Tailwind CSS 3.x, shadcn/ui

### Mobile
- Android: Kotlin + Jetpack Compose (WebView + 네이티브 위젯)
- iOS: Swift + SwiftUI (WebView + 네이티브 위젯)

### Infrastructure
- Docker, AWS (EC2, RDS, ElastiCache)
- GitHub Actions, Nginx

## 프로젝트 구조

```
trader-park/
├── backend/          # Spring Boot REST API
├── frontend/         # Next.js 웹 앱
├── mobile-android/   # Kotlin Android 앱
├── mobile-ios/       # Swift iOS 앱
├── infra/            # Docker, Nginx 설정
├── docs/             # 문서
└── .github/          # CI/CD
```

## 핵심 도메인

- `user`: 사용자 (OAuth 인증)
- `stock`: 주식 정보
- `watchlist`: 관심종목
- `order`: 주문
- `portfolio`: 포트폴리오
- `strategy`: 매매 전략

## 외부 연동

- **키움증권 REST API**: 시세 조회, 매수/매도, 계좌 현황, 조건검색
- **OAuth2**: 카카오, 구글 로그인

## 개발 마일스톤

1. M1: 프로젝트 기반 구축 ← 현재
2. M2: 인증 시스템
3. M3: 증권 API 연동 (키움 REST API)
4. M4: 핵심 기능 - 관심종목
5. M5: 자동매매 엔진
6. M6: 세력 분석 기능
7. M7: 프론트엔드 완성
8. M8: 모바일 앱
9. M9: 배포 및 운영

## 코딩 컨벤션

- Backend: `.claude/skills/backend/` 참조
- Frontend: `.claude/skills/frontend/` 참조

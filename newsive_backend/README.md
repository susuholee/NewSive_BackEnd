# Newsive Backend

뉴스 기반 서비스 **Newsive**의 백엔드 서버 레포지토리입니다.  
실시간 뉴스 제공, 알림, 채팅 커뮤니티 기능을 중심으로 한 API 서버를 담당합니다.

---

## 프로젝트 개요

**Newsive**는 실시간으로 발생하는 뉴스와 이슈를 빠르게 전달하고,  
사용자 간 커뮤니케이션과 알림 기능을 제공하는 실시간 정보 기반 플랫폼입니다.

본 레포지토리는 다음 역할을 담당합니다.

- 사용자 인증 및 계정 관리
- 뉴스 / 날씨 외부 API 연동
- 실시간 알림 및 채팅 서버
- 데이터베이스 관리 및 비즈니스 로직 처리
---

## 기술 스택

### Backend
- **NestJS**
- **TypeScript**

### Database / ORM
- **PostgreSQL**
- **Prisma ORM**

### Auth
- **JWT (Access / Refresh Token)**
- **bcrypt**

### Realtime
- **WebSocket / Socket.io**

### External API
- GnewsAPI
- OpenWeather API
---
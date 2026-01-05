# 설화 정비소 (Mythic Workshop)

귀엽고 가벼운 톤의 하이브리드 캐주얼 게임 (Idle + 성장)

## Sprint 1 개요

### 목표
- React Native + Expo + react-native-skia를 활용한 기본 게임 루프 구현
- 자동 전투, 업그레이드, 오프라인 보상 시스템 완성

### 완료 조건 (DoD)
- ✅ 앱 실행 → Home → 전투 시작 → 자동 전투(Skia) → 승리 → 골드 획득 루프 동작
- ✅ 앱 재실행해도 스테이지/골드/강화 유지
- ✅ 오프라인 보상: 앱 종료 후 재실행 시 경과 시간 기반 보상 (상한 8시간)

## 프로젝트 구조

```
mythic-workshop/
├── src/
│   ├── app/
│   │   ├── App.tsx                 # 메인 앱 컴포넌트
│   │   └── screens/
│   │       ├── HomeScreen.tsx      # 정비소 허브
│   │       ├── BattleScreen.tsx    # 전투 화면
│   │       └── UpgradeScreen.tsx   # 강화 화면
│   ├── features/
│   │   ├── battle/
│   │   │   ├── BattleScene.tsx     # Skia Canvas 렌더링
│   │   │   └── battleLoop.ts       # 자동 전투 로직
│   │   ├── progression/            # (Sprint 2+)
│   │   ├── save/
│   │   │   └── persistence.ts      # 저장/로드 시스템
│   │   └── ui/
│   │       ├── theme.ts            # UI 테마
│   │       ├── Button.tsx          # 버튼 컴포넌트
│   │       └── Card.tsx            # 카드 컴포넌트
│   ├── data/
│   │   ├── balanceTables.json      # 게임 밸런스 데이터
│   │   ├── storyEpisodes.json      # 스토리 데이터
│   │   └── characters.json         # 캐릭터 데이터 (잠금)
│   ├── utils/
│   │   ├── balance.ts              # 밸런스 계산
│   │   └── time.ts                 # 시간 포맷팅
│   ├── types.ts                    # TypeScript 타입 정의
│   ├── store.ts                    # Zustand 상태관리
│   └── assets/                     # 플레이스홀더 에셋
├── package.json
├── app.json
├── tsconfig.json
├── index.js
└── README.md
```

## 핵심 기능

### 1. Home 화면
- 현재 스테이지, 골드, 전투력 표시
- 전투 시작 버튼
- 오프라인 보상 카드 (경과 시간 표시)

### 2. Battle 화면 (Skia Canvas)
- 플레이어 (원형) vs 몬스터 (사각형)
- 자동 전투 루프 (0.3초 간격)
- 데미지 숫자 플로팅 (위로 이동 + 페이드)
- 타격 파티클 효과 (8개 점 분산)
- 승리 시 보상 지급

### 3. Upgrade 화면
- 2개 업그레이드 (ATK, HP)
- 레벨별 비용/효과 표시
- 구매 시 즉시 스탯 반영 + 저장

### 4. 저장/로드 시스템
- AsyncStorage 기반 영속성
- 저장 트리거: 업그레이드 구매, 스테이지 클리어, 앱 백그라운드
- 마지막 접속 시간(lastSeenAt) 저장

### 5. 오프라인 보상
- 경과 시간 기반 골드 계산
- 상한: 8시간
- 골드/분: 0.5

## 실행 방법

### 1. 로컬 개발 (Expo Go)

```bash
# 프로젝트 디렉토리 이동
cd mythic-workshop

# 의존성 설치
npm install
# 또는
pnpm install

# Expo 개발 서버 시작
npm start

# 모바일 기기에서 Expo Go 앱으로 QR 코드 스캔
```

### 2. Expo Dev Client (권장: Skia 사용)

```bash
# EAS CLI 설치 (처음 한 번만)
npm install -g eas-cli

# EAS 계정 로그인
eas login

# Dev Client 빌드 (Android)
eas build --platform android --profile preview

# 빌드 완료 후 설치 및 실행
```

### 3. 로컬 프리뷰 (Web)

```bash
npm run web
```

## 주요 라이브러리

- **React Native**: 0.74.0
- **Expo**: 51.0.0
- **@shopify/react-native-skia**: 1.0.0 (고성능 2D 렌더링)
- **zustand**: 4.4.0 (상태관리)
- **react-navigation**: 6.1.0 (네비게이션)
- **AsyncStorage**: 저장/로드

## 게임 밸런스

### 스테이지 (1~10)
- 몬스터 HP: 30 → 1150 (완만 증가)
- 보상 골드: 10 → 650 (완만 증가)

### 업그레이드
- **공격력 (ATK)**
  - 기본 비용: 10
  - 비용 배수: 1.15
  - 기본 효과: +1
  - 효과 배수: 1.1

- **생명력 (HP)**
  - 기본 비용: 15
  - 비용 배수: 1.15
  - 기본 효과: +5
  - 효과 배수: 1.1

### 오프라인 보상
- 최대 시간: 8시간
- 골드/분: 0.5

## 에셋 및 확장 포인트

### 현재 상태
- 플레이스홀더만 사용 (도형, 아이콘)
- 저작권 위험 요소 없음

### 교체 포인트 (주석 표시)
- `BattleScene.tsx`: 플레이어/몬스터 렌더링 (원 → 이미지)
- `HomeScreen.tsx`: 아이콘 (이모지 → 이미지)
- `UpgradeScreen.tsx`: 아이콘 (이모지 → 이미지)
- `features/ui/theme.ts`: 색상 팔레트

## 다음 스프린트 (Sprint 2) TODO

1. **동료 시스템**
   - 동료 카드 UI
   - 동료 능력 시스템
   - 동료 업그레이드

2. **스토리 진행**
   - 에피소드 UI
   - 대사 렌더링
   - 스토리 진행 로직

3. **고급 전투 효과**
   - 크리티컬 시스템
   - 상태 이상 (중독, 약화 등)
   - 스킬 시스템

4. **UI/UX 개선**
   - 애니메이션 추가
   - 효과음 (react-native-sound)
   - 배경 음악

5. **데이터 확장**
   - 스테이지 11~50
   - 더 많은 업그레이드
   - 아이템 시스템

6. **성능 최적화**
   - 메모리 누수 제거
   - 렌더링 최적화
   - 번들 크기 감소

## 개발 노트

- **Skia 사용 이유**: 고성능 2D 렌더링, 복잡한 파티클 효과 지원
- **Zustand 선택**: 간단한 상태관리, 보일러플레이트 최소화
- **AsyncStorage**: MMKV 대체, 더 넓은 호환성
- **TypeScript**: 타입 안정성, 개발 경험 향상

## 라이선스

(프로젝트 라이선스 추가)

## 문의

(연락처 정보 추가)

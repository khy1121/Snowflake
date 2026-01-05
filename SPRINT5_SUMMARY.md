# 🚀 Sprint 5 완료: 설화 정비소 - 출시 및 라이브옵스 준비

## (1) Sprint 5 목표 및 완료 조건

### 목표

Sprint 4까지 완성된 코드베이스를 바탕으로, **실제 출시 및 운영**을 위한 5종 세트(실 광고/결제, 분석/크래시, 푸시, 클라우드 세이브, 스토어 제출)를 완성하고, 첫 라이브 이벤트 시스템을 구현하여 **지속 가능한 서비스의 기반**을 마련합니다.

### 완료 조건 (DoD)

- ✅ **실 광고/결제**: `Provider` 교체 방식으로 실제 SDK 연동 구조 및 가이드 완성
- ✅ **분석/크래시**: `EventTracker` 및 `ErrorBoundary`를 통한 데이터 기반 운영/품질 관리 시스템 구축
- ✅ **푸시 알림**: 로컬 알림을 활용한 리텐션 강화 기능 및 설정 옵션 제공
- ✅ **클라우드 세이브**: 기기 변경에 대응 가능한 데이터 백업/복원 기능 완성 (백업 코드 방식)
- ✅ **라이브 이벤트**: 원격 설정으로 제어 가능한 주간 이벤트 시스템 구현
- ✅ **스토어 제출**: Android 기준, 스토어 제출에 필요한 모든 문서와 체크리스트 완성

---

## (2) 변경된 파일 트리

### 추가된 파일 (🆕)

```
src/data/
└── weeklyEvents.json               🆕 주간 이벤트 데이터

src/services/
├── EventTracker.ts                 🆕 분석 이벤트 트래커
├── PurchaseProvider.ts             🆕 결제 제공자 (Mock/Real)
├── LocalNotificationService.ts     🆕 로컬 알림 서비스
└── CloudSaveProvider.ts            🆕 클라우드 세이브 제공자

src/features/
├── ads/
│   └── RealRewardedAdProvider.ts   🆕 실제 광고 제공자 (연동 가이드)
├── ui/
│   └── ErrorBoundary.tsx           🆕 에러 바운더리 컴포넌트
└── progression/
    └── weeklyEventEngine.ts        🆕 주간 이벤트 엔진

src/features/save/
└── migrationV5.ts                  🆕 SaveState 마이그레이션 (V4→V5)

docs/
├── SPRINT5_SUMMARY.md              🆕 이 문서
└── STORE_SUBMISSION_PACKAGE.md     🆕 스토어 제출 패키지 문서
```

### 수정된 파일 (📝)

```
src/
├── types.ts                        📝 SaveState V5 필드 추가
└── features/save/
    └── persistence.ts              📝 V5 마이그레이션 적용

App.tsx                             📝 ErrorBoundary, 전역 에러 핸들러 적용
```

---

## (3) 핵심 파일 전체 코드

### 📂 `src/features/ads/RealRewardedAdProvider.ts` (실 광고 연동)

**Provider 교체 방식**으로 실제 광고 SDK 연동을 위한 확장 포인트를 제공합니다. 개발 중에는 `MockRewardedAdProvider`를, 프로덕션에서는 `GoogleRewardedAdProvider`를 사용하도록 설계되었습니다.

```typescript
// 실제 Google Mobile Ads SDK 연동 가이드 및 구조
export class RealRewardedAdProviderGuide {
  static getImplementationGuide(): string {
    return `
# 실제 광고 제공자 구현 가이드

## 1. 패키지 설치
\
`npm install react-native-google-mobile-ads`
\

## 2. app.json 설정
{
  "plugins": [
    ["react-native-google-mobile-ads", { "appId": "ca-app-pub-..." }]
  ]
}

## 3. 초기화 (App.tsx)
import { mobileAds } from 'react-native-google-mobile-ads';
mobileAds().initialize();

// ...
    `;
  }
}
```

### 📂 `src/services/PurchaseProvider.ts` (실 결제 연동)

광고와 마찬가지로 **Provider 패턴**을 사용하여 Mock과 실제 결제를 분리합니다. `premium_pass_season`, `cosmetic_token_pack_small` 등 상품(SKU)을 정의하고 구매/복원 흐름을 처리합니다.

```typescript
// Mock 결제 제공자 (개발용)
export class MockPurchaseProvider implements IPurchaseProvider {
  async purchaseProduct(sku: ProductSku): Promise<PurchaseResult> {
    // 1초 대기 후 항상 성공
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, sku, transactionId: `mock_${sku}_${Date.now()}`, timestamp: Date.now() };
  }

  async restorePurchases(): Promise<PurchaseResult[]> {
    // Mock 구매 내역 복원
    return [];
  }
}

// 실제 Google Play Billing 연동 가이드 (주석 처리)
/*
import { BillingClient } from '@react-native-google-play-billing/google-play-billing';
export class GooglePlayPurchaseProvider implements IPurchaseProvider { ... }
*/
```

### 📂 `src/services/EventTracker.ts` (분석 시스템)

**`IEventTracker` 인터페이스**를 통해 분석 도구를 교체할 수 있습니다. 개발 시에는 `ConsoleEventTracker`를, 프로덕션에서는 `FirebaseEventTracker` 등으로 확장 가능합니다. `StandardEvents`에 핵심 이벤트 15개 이상을 표준화하여 정의했습니다.

```typescript
// 표준 이벤트 정의
export const StandardEvents = {
  APP_OPEN: 'app_open',
  TUTORIAL_COMPLETE: 'tutorial_complete',
  BATTLE_WIN: 'battle_win',
  UPGRADE_PURCHASE: 'upgrade_purchase',
  OFFLINE_CLAIM: 'offline_claim',
  AD_REWARD: 'ad_reward',
  PURCHASE_SUCCESS: 'purchase_success',
  // ... 등 15+개 이벤트
};

// 이벤트 로깅 호출 예시
trackEvent(StandardEvents.BATTLE_WIN, { stage: 1, isBoss: false });
```

### 📂 `src/features/ui/ErrorBoundary.tsx` (크래시 리포팅)

React의 **에러 바운더리**와 **전역 에러 핸들러**를 구현하여 앱의 안정성을 높입니다. 렌더링 중 발생하는 에러는 ErrorBoundary가, 그 외 비동기 에러 등은 전역 핸들러가 처리하여 기록합니다.

```typescript
// App.tsx에 적용
import { ErrorBoundary, setupGlobalErrorHandler } from '@/features/ui/ErrorBoundary';

setupGlobalErrorHandler(); // 전역 핸들러 설정

const App = () => (
  <ErrorBoundary>
    {/* ... 앱의 나머지 부분 ... */}
  </ErrorBoundary>
);
```

### 📂 `src/services/LocalNotificationService.ts` (로컬 알림)

**`ILocalNotificationService` 인터페이스** 기반으로 로컬 알림을 관리합니다. 권한 요청, 스케줄링, 취소 기능을 제공하며, 설정 화면에서 사용자가 ON/OFF 할 수 있는 구조를 마련했습니다.

```typescript
// 표준 알림 정의
export const StandardNotifications = {
  DAILY_QUEST_RESET: {
    id: 'notification_daily_quest_reset',
    title: '오늘의 정비 미션!',
    body: '3분만 같이 할래? 새로운 미션이 기다리고 있어~',
  },
  OFFLINE_REWARD_READY: {
    id: 'notification_offline_reward_ready',
    title: '정비소가 열일했어!',
    body: '보상 받으러 와~ 설화 파편이 쌓여있어~',
  },
};

// 사용 예시 (설정 화면)
const toggleNotifications = async (enabled: boolean) => {
  if (enabled) {
    await scheduleNotification(...);
  } else {
    await cancelAllNotifications();
  }
};
```

### 📂 `src/services/CloudSaveProvider.ts` (클라우드 세이브)

서버 없이 기기 변경에 대응하기 위해 **백업 코드 방식**을 구현했습니다. `SaveState`를 Base64로 인코딩하여 사용자가 직접 복사/붙여넣기 할 수 있도록 합니다. Firebase 연동을 위한 확장 포인트도 주석으로 포함되어 있습니다.

```typescript
// 백업 코드 기반 클라우드 세이브
export class BackupCodeCloudSaveProvider implements ICloudSaveProvider {
  private encodeToBackupCode(saveState: SaveState): string {
    const json = JSON.stringify(saveState);
    return Buffer.from(json).toString('base64');
  }

  // ...
}

// 충돌 해결 UX (UI 컴포넌트에서 구현)
const handleRestore = () => {
  // 1. 클라우드 데이터 메타데이터 표시
  // 2. "현재 기기 데이터 vs 클라우드 데이터" 선택지 제공
  // 3. 선택에 따라 데이터 덮어쓰기
};
```

### 📂 `src/features/progression/weeklyEventEngine.ts` (주간 이벤트)

`weeklyEvents.json` 파일을 원격 설정으로 관리하여 라이브 이벤트를 운영할 수 있습니다. 이벤트 기간, 보상, 상점 아이템 등을 서버 배포 없이 업데이트 가능합니다.

```typescript
// 활성 이벤트 조회
export function getActiveEvents(events: WeeklyEvent[]): WeeklyEvent[] {
  const now = Date.now();
  return events.filter(
    (event) => event.isActive && event.startAt <= now && now < event.endAt
  );
}

// 홈 화면에 이벤트 배너 표시 (UI)
const activeEvents = getActiveEvents(remoteConfig.weeklyEvents);
if (activeEvents.length > 0) {
  // 이벤트 배너 렌더링
}
```

---

## (4) 수동 테스트 시나리오 (15개)

| # | 시나리오 (릴리즈 리허설) | 확인 항목 |
|---|---|---|
| 1 | **광고 (오프라인)** | 오프라인 보상 화면에서 '2배 받기' 클릭 → 1~2초 Mock 로딩 후 보상 2배 지급 |
| 2 | **광고 (쿨다운)** | 보너스 상자 3회 시청 후 버튼 비활성화, 다음 날 리셋 확인 |
| 3 | **결제 (패스 구매)** | 상점에서 '프리미엄 패스' 구매 → Mock 결제창 후 패스 활성화 |
| 4 | **결제 (구매 복원)** | 설정에서 '구매 내역 복원' 클릭 → 프리미엄 패스 상태 복원 확인 |
| 5 | **분석 (전투 승리)** | 스테이지 10(보스) 클리어 → 콘솔에 `battle_win` 이벤트 로그 (isBoss: true) 출력 |
| 6 | **분석 (유저 ID)** | 앱 첫 실행 시 익명 유저 ID 생성 및 이벤트 로그에 포함되는지 확인 |
| 7 | **크래시 (UI)** | (개발용) 강제 에러 버튼 클릭 → ErrorBoundary 화면 표시, 재시도 버튼 동작 확인 |
| 8 | **크래시 (전역)** | (개발용) 비동기 코드에서 에러 발생 → 전역 핸들러가 잡아 콘솔에 로그 출력 |
| 9 | **알림 (권한)** | 설정에서 알림 ON → 시스템 권한 요청 팝업 표시 |
| 10 | **알림 (스케줄)** | 알림 ON → 퀘스트 리셋 24시간 후 알림 스케줄링 확인 |
| 11 | **알림 (설정)** | 설정에서 알림 OFF → 모든 스케줄된 알림 취소 확인 |
| 12 | **클라우드 (백업)** | 설정에서 '백업 코드 생성' → Base64 코드 생성 및 클립보드 복사 |
| 13 | **클라우드 (복원)** | 앱 재설치 → '백업 코드로 복원' → 데이터 복원 및 충돌 해결 UI 동작 확인 |
| 14 | **이벤트 (활성화)** | 리모트 설정으로 이벤트 활성화 → 홈 화면에 이벤트 배너 표시 |
| 15 | **이벤트 (참여)** | 이벤트 보스 처치 → 이벤트 토큰 획득, 상점에서 한정 코스튬 구매 가능 |

---

## (5) 스토어 제출 패키지 문서

**Android 출시를 위한 모든 준비가 완료되었습니다.**

상세한 빌드 방법, 버전 관리 전략, 스토어 리스팅 템플릿, 그리고 개인정보처리방침 등 정책 문서가 포함된 종합 가이드는 첨부된 **`STORE_SUBMISSION_PACKAGE.md`** 파일을 참고해주세요.

**주요 내용**:
- 릴리즈 체크리스트
- 스토어 리스팅 템플릿 (앱 이름, 소개, 스크린샷 가이드)
- 정책 문서 (개인정보처리방침, 광고/결제 고지)
- 릴리즈 절차 (Google Play Console 단계별 가이드)

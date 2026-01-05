# 🎮 Sprint 4 완료: 설화 정비소 - 패스 + 광고 + 코스튬 + 배포

## (1) Sprint 4 목표 및 완료 조건

### 목표

Sprint 1~3의 기본 게임 루프, 성장/경제, 스토리/동료 시스템을 바탕으로 **가챠 없이도 수익/운영이 가능한 패스 + 광고 보상 + 코스튬 시스템**을 완성하고, **원격 밸런스 확장 포인트를 실제로 동작**하게 만들며, **크래시/로그/성능/보안 최소 기준**을 갖춘 뒤, **Android 기준으로 EAS 빌드 → 배포까지 가능한 문서**를 제공합니다.

**Sprint 4는 "릴리즈 가능한 상태"가 목표입니다.**

### 완료 조건 (DoD)

- ✅ **패스 시스템 (무료/프리미엄)**: 레벨업, 보상 수령, Mock 구매로 프리미엄 활성화
- ✅ **광고 보상 3종**: 오프라인 2배, 보너스 상자, XP 부스트 (Mock 광고)
- ✅ **코스튬 시스템**: 12개 이상 아이템, 구매/장착, Skia 전투 화면에 반영
- ✅ **원격 밸런스**: JSON 로드/캐시/폴백, 디버그 메뉴로 확인 가능
- ✅ **로깅/디버그**: Logger 유틸, DebugPanel (개발 전용), 운영 가드
- ✅ **저장/마이그레이션**: Sprint 3 데이터 호환성 유지
- ✅ **배포 가이드**: Android EAS 빌드/배포 단계별 명령어, 릴리즈 체크리스트, 정책 문서 템플릿

---

## (2) 변경된 파일 트리

### 추가된 파일 (🆕)

```
src/data/
├── pass.json                       🆕 패스 시스템 데이터 (30레벨, 무료/프리미엄)
└── cosmetics.json                  🆕 코스튬 데이터 (12개 아이템)

src/features/
├── progression/
│   └── passSystem.ts               🆕 패스 로직 (XP, 레벨업, 보상)
├── ads/
│   └── RewardedAdProvider.ts       🆕 광고 보상 제공자 (Mock + 확장 포인트)
├── cosmetics/
│   └── cosmeticSystem.ts           🆕 코스튬 로직 (구매, 장착)
└── debug/
    └── DebugPanel.tsx              🆕 디버그 패널 (개발 전용)

src/services/
└── RemoteConfigService.ts          🆕 원격 설정 서비스 (로드, 캐시, 폴백)

src/utils/
└── logger.ts                       🆕 로깅 유틸 (레벨별 로그)

src/features/save/
└── migrationV4.ts                  🆕 SaveState 마이그레이션 (V3→V4)

docs/
├── DEPLOYMENT_GUIDE.md             🆕 EAS 빌드/배포 가이드 (명령어 포함)
└── SPRINT4_SUMMARY.md              🆕 이 문서
```

### 수정된 파일 (📝)

```
src/
├── types.ts                        📝 SaveState V4 필드 추가
└── features/save/
    └── persistence.ts              📝 V4 마이그레이션 적용
```

---

## (3) 핵심 파일 전체 코드

### 📂 `src/data/pass.json` (패스 시스템)

**구조**:
- **seasonId**: 시즌 고유 ID
- **levels**: 1~30 레벨
- **expPerLevel**: 레벨당 필요 XP (100)
- **rewardsFree**: 무료 보상 (7개 체크포인트)
- **rewardsPremium**: 프리미엄 보상 (7개 체크포인트)
- **보상 타입**: gold, fragments, companionShard, cosmeticToken, cosmeticItem

**주요 보상**:
- 레벨 10: 무료 코스튬 토큰 50개
- 레벨 20: 무료 코스튬 토큰 100개
- 레벨 30: 무료 전설급 스킨
- 프리미엄: 각 레벨마다 추가 골드 + 동료 조각

### 📂 `src/data/cosmetics.json` (코스튬)

**12개 아이템**:
1. 파란 정비사 (기본, 무료)
2. 빨간 정비사 (기본, 무료)
3. 초록 정비사 (기본, 무료)
4. 보라 정비사 (희귀, 200 토큰)
5. 황금 정비사 (희귀, 250 토큰)
6. 크리스탈 정비사 (에픽, 500 토큰)
7. 불꽃 정비사 (에픽, 500 토큰)
8. 전설의 정비사 (전설, 패스 보상)
9. 프리미엄 정비사 (전설, 프리미엄 패스 보상)
10. 반짝임 효과 (희귀, 150 토큰)
11. 빛남 효과 (에픽, 300 토큰)
12. 오라 효과 (전설, 업적 보상)

### 📂 `src/features/progression/passSystem.ts` (패스 엔진)

```typescript
/**
 * 패스 초기화
 */
export function initializePassProgress(): PassProgress {
  return {
    seasonId: 'season_1',
    currentLevel: 1,
    currentExp: 0,
    isPremiumUnlocked: false,
    claimedFreeRewards: [],
    claimedPremiumRewards: [],
    unlockedAt: null,
  };
}

/**
 * XP 추가
 */
export function addPassExp(
  progress: PassProgress,
  expAmount: number
): { updated: PassProgress; leveledUp: boolean; newLevel?: number } {
  // 레벨업 로직
}

/**
 * 패스 보상 수령
 */
export function claimPassReward(
  progress: PassProgress,
  level: number,
  isPremium: boolean
): { updated: PassProgress; rewards: PassReward[]; success: boolean } {
  // 보상 수령 로직
}

/**
 * 프리미엄 패스 잠금 해제 (Mock 구매)
 */
export function unlockPremiumPass(progress: PassProgress): PassProgress {
  return {
    ...progress,
    isPremiumUnlocked: true,
    unlockedAt: Date.now(),
  };
}
```

### 📂 `src/features/ads/RewardedAdProvider.ts` (광고 보상)

```typescript
/**
 * 광고 보상 제공자 인터페이스
 */
export interface IRewardedAdProvider {
  showRewardedAd(placementId: AdPlacementId): Promise<RewardedAdResult>;
  isAdAvailable(placementId: AdPlacementId): Promise<boolean>;
  preloadAd(placementId: AdPlacementId): Promise<void>;
}

/**
 * Mock 광고 제공자 (기본 구현)
 */
export class MockRewardedAdProvider implements IRewardedAdProvider {
  async showRewardedAd(placementId: AdPlacementId): Promise<RewardedAdResult> {
    // 1~2초 로딩 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return { success: true, placementId, timestamp: Date.now() };
  }

  async isAdAvailable(placementId: AdPlacementId): Promise<boolean> {
    return true;
  }

  async preloadAd(placementId: AdPlacementId): Promise<void> {
    return Promise.resolve();
  }
}

/**
 * 실제 Google Mobile Ads SDK 연동 (확장 포인트)
 * 주석: GoogleRewardedAdProvider 클래스로 구현 가능
 */
```

### 📂 `src/features/cosmetics/cosmeticSystem.ts` (코스튬 엔진)

```typescript
/**
 * 코스튬 초기화
 */
export function initializeCosmetics(): Record<string, CosmeticProgress> {
  // 모든 코스튬 초기화 (무료 아이템은 자동 보유)
}

/**
 * 코스튬 구매
 */
export function purchaseCosmetic(
  progress: Record<string, CosmeticProgress>,
  cosmeticId: string,
  currentCosmeticTokens: number
): { updated: Record<string, CosmeticProgress>; success: boolean; tokensUsed: number } {
  // 토큰 소비 후 코스튬 구매
}

/**
 * 코스튬 장착
 */
export function equipCosmetic(
  progress: Record<string, CosmeticProgress>,
  cosmeticId: string,
  cosmeticType: string
): Record<string, CosmeticProgress> {
  // 같은 타입의 다른 코스튬 해제 후 장착
}

/**
 * 현재 장착된 코스튬 조회
 */
export function getEquippedCosmetic(
  progress: Record<string, CosmeticProgress>,
  cosmeticType: string
) {
  // 타입별 장착된 코스튬 반환
}
```

### 📂 `src/services/RemoteConfigService.ts` (원격 설정)

```typescript
/**
 * 원격 JSON 가져오기
 */
async fetchRemoteJson<T = any>(
  url: string,
  options: { useCache?: boolean; forceRefresh?: boolean } = {}
): Promise<T | null> {
  // 1. 캐시 확인 (24시간)
  // 2. 원격 가져오기 (재시도 2회, 타임아웃 10초)
  // 3. 캐시 저장
  // 4. 실패 시 로컬 JSON 폴백
}

/**
 * 캐시 초기화
 */
async clearCache(url?: string): Promise<void> {
  // 특정 URL 또는 모든 캐시 초기화
}

/**
 * 캐시 정보 조회
 */
getCacheInfo(url: string): RemoteConfigCache | null {
  // 캐시 타임스탬프, 버전 반환
}
```

### 📂 `src/utils/logger.ts` (로깅)

```typescript
/**
 * 로깅 레벨: debug, info, warn, error
 */
export const logger = Logger.getInstance();

logger.info('TAG', 'message', { data });
logger.warn('TAG', 'warning message');
logger.error('TAG', 'error message', error);

/**
 * 이벤트 로깅 (분석 서비스 연동 포인트)
 */
logger.logEvent('STAGE_CLEARED', { stageId: 5, time: 120 });

/**
 * 로그 조회 및 내보내기
 */
const logs = logger.getLogs({ tag: 'EVENT', since: Date.now() - 3600000 });
const text = logger.exportLogs();
```

### 📂 `src/features/debug/DebugPanel.tsx` (디버그 패널)

```typescript
/**
 * 디버그 패널 (개발 전용)
 * - 재화 추가 (골드, 파편, 코스튬 토큰)
 * - 스테이지 점프
 * - 튜토리얼 리셋
 * - 데이터 초기화
 * - 원격 설정 새로고침
 * - 로그 조회
 */

// __DEV__ 가드로 프로덕션 빌드에서 제거
if (__DEV__) {
  // DebugPanel 렌더링
}
```

### 📂 `src/features/save/migrationV4.ts` (마이그레이션)

```typescript
/**
 * V3 → V4 마이그레이션
 * - 기존 필드 유지
 * - Sprint 4 필드 추가:
 *   - cosmeticTokens: 0
 *   - cosmeticProgress: 초기화
 *   - passProgress: 초기화
 *   - adRewardCooldowns: 초기화
 *   - remoteConfigVersion: '1.0'
 */
export function migrateFromV3(v3: SaveStateV3): SaveState {
  return {
    ...v3,
    version: 4,
    cosmeticTokens: 0,
    cosmeticProgress: initializeCosmetics(),
    passProgress: initializePassProgress(),
    adRewardCooldowns: { OFFLINE_DOUBLE: 0, BONUS_CHEST: 0, PASS_XP_BOOST: 0 },
    remoteConfigVersion: '1.0',
  };
}
```

---

## (4) 수동 테스트 시나리오 (12개)

| # | 시나리오 | 확인 항목 |
|---|---|---|
| 1 | 패스 XP 획득 | 전투 승리 시 패스 XP 증가 |
| 2 | 패스 레벨업 | 100 XP 도달 시 레벨 2 진행 |
| 3 | 무료 패스 보상 | 레벨 1, 5, 10 보상 수령 가능 |
| 4 | 프리미엄 패스 잠금 해제 | Mock 구매 버튼 → 프리미엄 활성화 |
| 5 | 프리미엄 패스 보상 | 프리미엄 활성화 후 추가 보상 수령 |
| 6 | 광고 보상 (오프라인 2배) | 오프라인 보상 화면에서 광고 시청 → 2배 수령 |
| 7 | 광고 보상 (보너스 상자) | 하루 3회 보너스 상자 광고 시청 가능 |
| 8 | 광고 보상 (XP 부스트) | 하루 1회 XP 부스트 광고 시청 → 30분 동안 +20% |
| 9 | 코스튬 구매 | 코스튬 토큰 200개 → 보라 정비사 구매 |
| 10 | 코스튬 장착 | 구매한 코스튬 장착 → 전투 화면에서 색상 변경 확인 |
| 11 | 원격 설정 로드 | 디버그 메뉴 → 원격 설정 새로고침 → 캐시 저장 확인 |
| 12 | 마이그레이션 (V3→V4) | Sprint 3 저장 데이터 로드 → 자동 마이그레이션 → 기존 데이터 유지 |

---

## (5) EAS 빌드/배포 가이드

### 빠른 시작

```bash
# 1. 사전 준비
npm install -g eas-cli
eas login

# 2. 프로젝트 초기화
cd mythic-workshop
eas build:configure

# 3. 개발 클라이언트 빌드
eas build --platform android --profile development

# 4. 프리뷰 빌드 (테스트)
eas build --platform android --profile preview

# 5. 릴리즈 빌드 (배포)
eas build --platform android --profile production

# 6. 앱 스토어 제출 (선택 사항)
eas submit --platform android --latest
```

### 상세 가이드

전체 가이드는 `DEPLOYMENT_GUIDE.md` 파일을 참고하세요. 다음 항목을 포함합니다:

- **사전 준비**: 도구 설치, 계정 설정
- **EAS 설정**: eas.json, app.json 구성
- **개발 클라이언트 빌드**: 로컬 개발용
- **프리뷰 빌드**: 테스트용
- **릴리즈 빌드**: 배포용
- **Google Play Store 배포**: 단계별 가이드
- **릴리즈 체크리스트**: 배포 전 확인 사항
- **정책 문서 템플릿**: 개인정보처리방침, 광고 표기, 이용약관

---

## (6) 릴리즈 체크리스트

### 기능 검증

- [ ] 모든 기능이 정상 작동하는가?
- [ ] 패스 시스템이 정상 작동하는가?
- [ ] 광고 보상이 Mock으로 정상 작동하는가?
- [ ] 코스튬 구매/장착이 정상 작동하는가?
- [ ] 원격 설정이 로드/캐시/폴백 정상 작동하는가?

### 성능 검증

- [ ] 앱 시작 시간이 5초 이내인가?
- [ ] 전투 화면에서 프레임 드롭이 없는가?
- [ ] 메모리 누수가 없는가?

### 보안 검증

- [ ] 저장 데이터가 암호화되어 있는가?
- [ ] 치트 방지 로직이 작동하는가?
- [ ] 민감한 정보가 로그에 노출되지 않는가?

### 메타데이터 검증

- [ ] 앱 아이콘이 올바른가?
- [ ] 스플래시 화면이 올바른가?
- [ ] 버전 번호가 올바른가?

### 문서 검증

- [ ] 개인정보처리방침이 작성되었는가?
- [ ] 광고 표기가 있는가?
- [ ] 이용약관이 작성되었는가?

---

## (7) 정책 문서 템플릿

### 개인정보처리방침

```markdown
# 개인정보처리방침

**설화 정비소**는 사용자의 개인정보 보호를 중요하게 생각합니다.

## 수집하는 정보

1. **기기 정보**: 기기 모델, OS 버전, 고유 식별자
2. **게임 데이터**: 플레이 진행도, 스테이지, 보유 아이템 (로컬 저장)
3. **분석 정보**: 앱 사용 통계, 오류 로그 (선택 사항)

## 정보 사용

- 게임 경험 개선
- 오류 진단 및 해결
- 게임 밸런스 조정

## 정보 공유

- 제3자와 개인정보를 공유하지 않습니다
- 법적 요청이 있을 경우 제공할 수 있습니다

## 데이터 삭제

- 앱 삭제 시 모든 로컬 데이터가 삭제됩니다
- 개인정보 삭제 요청: [이메일 주소]
```

### 광고 표기

```markdown
# 광고 표기

이 앱은 다음과 같은 광고를 포함합니다:

- **리워드 광고**: 사용자가 선택적으로 시청하여 게임 내 보상을 받을 수 있습니다
- **배너 광고**: 게임 화면에 표시될 수 있습니다 (향후)

광고는 사용자 경험을 해치지 않도록 최소화됩니다.
```

---

## 주의사항

- **가챠/랜덤뽑기 금지**: 모든 코스튬은 결정론적 방식으로만 획득
- **광고 SDK 실제 연동 금지**: Mock 동작만 구현, 확장 포인트 주석만 OK
- **복잡한 결제 금지**: 게임 내 경제만 구현
- **서버 연동 금지**: 로컬 저장소만 사용

---

## 파일 크기 및 구조

| 파일 | 역할 | 크기 |
|------|------|------|
| `pass.json` | 패스 시스템 데이터 | ~5KB |
| `cosmetics.json` | 코스튬 데이터 | ~4KB |
| `passSystem.ts` | 패스 엔진 | ~4KB |
| `RewardedAdProvider.ts` | 광고 보상 제공자 | ~3KB |
| `cosmeticSystem.ts` | 코스튬 엔진 | ~4KB |
| `RemoteConfigService.ts` | 원격 설정 서비스 | ~5KB |
| `logger.ts` | 로깅 유틸 | ~3KB |
| `DebugPanel.tsx` | 디버그 패널 | ~4KB |
| `migrationV4.ts` | 마이그레이션 로직 | ~2KB |
| `DEPLOYMENT_GUIDE.md` | 배포 가이드 | ~15KB |

---

## Sprint 5 TODO (향후)

- **실제 광고 SDK 연동**: Google Mobile Ads 통합
- **실제 결제 SDK 연동**: Google Play Billing 통합
- **분석 서비스**: Firebase Analytics 통합
- **크래시 리포팅**: Firebase Crashlytics 통합
- **푸시 알림**: Firebase Cloud Messaging 통합
- **A/B 테스트**: Firebase Remote Config 활용
- **iOS 배포**: TestFlight, App Store 배포
- **성능 최적화**: 번들 크기 감소, 렌더링 최적화

---

## 개발 노트

### 패스 시스템
- **XP 획득**: 전투 승리, 업적 달성, 퀘스트 완료 시 지급
- **보상**: 무료/프리미엄 분리, 7개 체크포인트
- **프리미엄**: Mock 구매로 활성화, 실제 결제 연동 포인트 주석 포함

### 광고 보상
- **제공자 패턴**: IRewardedAdProvider 인터페이스로 Mock/실제 구현 분리
- **배치**: OFFLINE_DOUBLE, BONUS_CHEST, PASS_XP_BOOST
- **쿨다운**: 일일/시간 단위 제한

### 코스튬 시스템
- **획득 방식**: 무료, 상점 구매, 패스 보상, 업적
- **능력치**: 외형만 변경, 능력치 영향 없음
- **Skia 적용**: 플레이어 도형 색/테두리 변형 (플레이스홀더)

### 원격 설정
- **캐시**: 24시간 유지, AsyncStorage 저장
- **재시도**: 최대 2회, 지수 백오프
- **폴백**: 실패 시 로컬 JSON 사용
- **디버그**: 개발 메뉴에서 강제 새로고침, URL 설정 가능

### 로깅
- **레벨**: debug, info, warn, error
- **이벤트**: 중요 이벤트 별도 로깅 (분석 서비스 연동 포인트)
- **환경**: __DEV__에서만 콘솔 상세 출력

---

## 라이선스

(프로젝트 라이선스 추가)

## 문의

(연락처 정보 추가)

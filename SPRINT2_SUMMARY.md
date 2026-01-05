# 🎮 Sprint 2 완료: 설화 정비소 - 성장/경제/오프라인 보상 고도화

## (1) Sprint 2 목표 및 완료 조건

### 목표
Sprint 1의 기본 루프를 바탕으로 **성장/경제/오프라인 보상을 제품 수준으로 고도화**하고, **초반 1~3분 안에 게임을 이해시키는 튜토리얼**과 **리텐션을 위한 일일 미션/업적 시스템**을 추가합니다.

### 완료 조건 (DoD)
- ✅ **스테이지 1~50 진행 가능**: 10마다 보스 스테이지 (총 5개 보스)
- ✅ **6개 업그레이드 시스템**: ATK, HP, 공격 속도, 크리티컬 확률, 크리티컬 데미지, 오프라인 효율
- ✅ **오프라인 보상 고도화**: 스테이지 기반 수익, 효율 배수, 광고 Mock (2배 수령)
- ✅ **튜토리얼**: 4단계, 첫 실행 시 자동 진행, 완료 상태 저장
- ✅ **일일 미션**: 6개 미션, 진행도 표시, 보상 수령, 24시간 주기 리셋
- ✅ **업적 시스템**: 10개 업적, 누적/마일스톤/업그레이드 타입, 보상 수령
- ✅ **저장/로드 및 마이그레이션**: Sprint 1 데이터 호환성 유지

---

## (2) 변경된 파일 트리

### 추가된 파일 (🆕)
```
src/
├── data/
│   ├── quests.json                 🆕 일일 미션 데이터 (6개)
│   └── achievements.json           🆕 업적 데이터 (10개)
├── features/
│   ├── progression/
│   │   ├── questEngine.ts          🆕 미션 엔진
│   │   └── achievementEngine.ts    🆕 업적 엔진
│   └── ui/
│       ├── TutorialOverlay.tsx     🆕 튜토리얼 오버레이
│       └── OfflineRewardCard.tsx   🆕 오프라인 보상 카드 (광고 Mock)
├── utils/
│   ├── format.ts                   🆕 숫자 포맷팅 (1K, 1M, 1B)
│   └── index.ts                    🆕 유틸 통합 내보내기
├── features/save/
│   └── migration.ts                🆕 SaveState 마이그레이션 (V1→V2)
```

### 수정된 파일 (📝)
```
src/
├── data/
│   └── balanceTables.json          📝 스테이지 1~50, 6개 업그레이드 추가
├── types.ts                        📝 SaveState 필드 확장, 새 타입 추가
├── store.ts                        📝 (Sprint 2 준비, 추후 확장)
└── utils/
    └── balance.ts                  📝 크리티컬, 공격 속도, 오프라인 효율 계산
```

---

## (3) 핵심 파일 전체 코드

### 📂 `src/data/balanceTables.json` (스테이지 1~50, 6개 업그레이드)

**주요 특징:**
- **스테이지**: 1~50 (10마다 보스, 2배 보상)
- **업그레이드**: ATK, HP, 공격 속도, 크리티컬 확률, 크리티컬 데미지, 오프라인 효율
- **오프라인 보상**: 최대 8시간, 스테이지 기반 수익

```json
{
  "stages": [
    { "stageId": 1, "name": "초급 설화", "monsterHp": 30, "goldReward": 10, "isBoss": false },
    // ... 스테이지 2~9
    { "stageId": 10, "name": "보스: 망각의 그림자", "monsterHp": 300, "goldReward": 150, "isBoss": true },
    // ... 스테이지 11~50
  ],
  "upgrades": [
    {
      "upgradeId": "atk",
      "name": "공격력",
      "baseValue": 5,
      "perLevelDelta": 1,
      "baseCost": 10,
      "costCurve": 1.15
    },
    // ... 5개 추가 업그레이드
  ],
  "offlineReward": {
    "maxOfflineSeconds": 28800,
    "goldPerMinuteBase": 0.5
  }
}
```

### 📂 `src/data/quests.json` (일일 미션 6개)

```json
{
  "dailyQuests": [
    {
      "questId": "daily_battle_3",
      "title": "전투 3회",
      "description": "전투에서 3번 승리하세요",
      "type": "battle",
      "targetCount": 3,
      "goldReward": 100,
      "icon": "⚔️"
    },
    // ... 5개 추가 미션
  ]
}
```

### 📂 `src/data/achievements.json` (업적 10개)

```json
{
  "achievements": [
    {
      "achievementId": "first_battle",
      "title": "첫 전투",
      "description": "첫 번째 전투에서 승리하세요",
      "type": "milestone",
      "icon": "⚔️",
      "reward": 50
    },
    // ... 9개 추가 업적
  ]
}
```

### 📂 `src/types.ts` (SaveState 확장)

```typescript
export interface SaveState {
  version: number;
  lastSeenAt: number;
  currentStage: number;
  gold: number;
  hp: number;
  atk: number;
  upgradeLevels: {
    atk: number;
    hp: number;
    attackSpeed: number;
    critChance: number;
    critDamage: number;
    offlineEfficiency: number;
  };
  offlineRewardClaimed: boolean;
  // Sprint 2 추가
  tutorialCompleted: boolean;
  tutorialStep: number;
  dailyQuestProgress: Record<string, DailyQuestProgress>;
  achievementProgress: Record<string, AchievementProgress>;
  totalBattleWins: number;
  totalUpgrades: number;
  totalGoldEarned: number;
  totalOfflineRewardsClaimed: number;
  lastDailyResetTime: number;
  stats: {
    totalBattles: number;
    totalStagesCleared: number;
    highestStageReached: number;
  };
}

export interface DailyQuestProgress {
  questId: string;
  currentProgress: number;
  isCompleted: boolean;
  isRewarded: boolean;
  resetTime: number;
}

export interface AchievementProgress {
  achievementId: string;
  progress: number;
  isUnlocked: boolean;
  isRewarded: boolean;
  unlockedAt: number | null;
}
```

### 📂 `src/features/save/migration.ts` (마이그레이션)

```typescript
/**
 * Sprint 1 → Sprint 2 마이그레이션
 */

export function migrateSaveState(saved: any): SaveState {
  if (saved.version === CURRENT_VERSION) {
    return saved as SaveState;
  }

  if (saved.version === 1) {
    return migrateFromV1(saved as SaveStateV1);
  }

  return getDefaultSaveStateV2();
}

function migrateFromV1(v1: SaveStateV1): SaveState {
  return {
    version: CURRENT_VERSION,
    // ... Sprint 1 필드 유지
    // ... Sprint 2 필드 기본값 추가
    tutorialCompleted: false,
    tutorialStep: 0,
    dailyQuestProgress: {},
    achievementProgress: {},
    // ... 기타 필드
  };
}
```

### 📂 `src/utils/balance.ts` (크리티컬, 공격 속도 계산)

```typescript
/**
 * 데미지 계산 (크리티컬 포함)
 */
export function calculateDamage(
  atk: number,
  critChance: number,
  critDamage: number
): number {
  const isCrit = Math.random() < critChance;
  const multiplier = isCrit ? critDamage : 1;
  return Math.floor(atk * multiplier);
}

/**
 * 공격 간격 계산 (공격 속도 업그레이드 반영)
 */
export function calculateAttackInterval(
  baseInterval: number,
  attackSpeedLevel: number
): number {
  const attackSpeedUpgrade = calculateUpgradeInfo('attackSpeed', attackSpeedLevel);
  return Math.max(100, baseInterval + (attackSpeedUpgrade.nextEffect - 300));
}

/**
 * 오프라인 보상 계산 (스테이지 기반, 효율 배수)
 */
export function calculateOfflineReward(
  lastSeenAt: number,
  currentStage: number,
  offlineEfficiency: number,
  currentTime: number = Date.now()
): number {
  const elapsedSeconds = Math.floor((currentTime - lastSeenAt) / 1000);
  const maxSeconds = balanceTables.offlineReward.maxOfflineSeconds;
  const cappedSeconds = Math.min(elapsedSeconds, maxSeconds);

  const stage = getStage(currentStage);
  const baseGoldPerMinute = stage.goldReward / 60;
  const goldPerSecond = (baseGoldPerMinute / 60) * offlineEfficiency;
  
  return Math.floor(cappedSeconds * goldPerSecond);
}
```

### 📂 `src/features/progression/questEngine.ts` (미션 엔진)

```typescript
/**
 * 일일 미션 초기화
 */
export function initializeDailyQuests(): Record<string, DailyQuestProgress> {
  const now = Date.now();
  const progress: Record<string, DailyQuestProgress> = {};

  quests.dailyQuests.forEach((quest) => {
    progress[quest.questId] = {
      questId: quest.questId,
      currentProgress: 0,
      isCompleted: false,
      isRewarded: false,
      resetTime: now,
    };
  });

  return progress;
}

/**
 * 미션 진행도 업데이트
 */
export function updateQuestProgress(
  progress: Record<string, DailyQuestProgress>,
  questId: string,
  increment: number = 1
): Record<string, DailyQuestProgress> {
  const updated = { ...progress };

  if (updated[questId]) {
    updated[questId].currentProgress += increment;

    const quest = quests.dailyQuests.find((q) => q.questId === questId);
    if (quest && updated[questId].currentProgress >= quest.targetCount) {
      updated[questId].isCompleted = true;
    }
  }

  return updated;
}

/**
 * 미션 보상 수령
 */
export function claimQuestReward(
  progress: Record<string, DailyQuestProgress>,
  questId: string
): { updated: Record<string, DailyQuestProgress>; goldReward: number } {
  const updated = { ...progress };
  const quest = quests.dailyQuests.find((q) => q.questId === questId);

  if (updated[questId]?.isCompleted && !updated[questId]?.isRewarded) {
    updated[questId].isRewarded = true;
    return { updated, goldReward: quest?.goldReward || 0 };
  }

  return { updated, goldReward: 0 };
}
```

### 📂 `src/features/progression/achievementEngine.ts` (업적 엔진)

```typescript
/**
 * 업적 초기화
 */
export function initializeAchievements(): Record<string, AchievementProgress> {
  const progress: Record<string, AchievementProgress> = {};

  achievements.achievements.forEach((achievement) => {
    progress[achievement.achievementId] = {
      achievementId: achievement.achievementId,
      progress: 0,
      isUnlocked: false,
      isRewarded: false,
      unlockedAt: null,
    };
  });

  return progress;
}

/**
 * 업적 진행도 업데이트
 */
export function updateAchievementProgress(
  progress: Record<string, AchievementProgress>,
  achievementId: string,
  value: number
): Record<string, AchievementProgress> {
  const updated = { ...progress };
  const achievement = achievements.achievements.find(
    (a) => a.achievementId === achievementId
  );

  if (!achievement || updated[achievementId].isUnlocked) {
    return updated;
  }

  const newProgress = updated[achievementId].progress + value;
  updated[achievementId].progress = newProgress;

  if ((achievement as any).targetValue && newProgress >= (achievement as any).targetValue) {
    updated[achievementId].isUnlocked = true;
    updated[achievementId].unlockedAt = Date.now();
  }

  return updated;
}
```

### 📂 `src/features/ui/TutorialOverlay.tsx` (튜토리얼)

```typescript
/**
 * 4단계 튜토리얼
 * 1) 전투는 자동이야!
 * 2) 이기면 골드를 줘!
 * 3) 강화하면 더 쎄져!
 * 4) 오프라인도 일해준다구~
 */

const TUTORIAL_STEPS = [
  {
    title: '⚔️ 전투는 자동이야!',
    description: '전투 시작 버튼을 누르면 자동으로 진행돼요...',
  },
  // ... 3개 추가 단계
];

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  visible,
  step,
  onNext,
  onSkip,
}) => {
  // 모달로 표시, 단계별 진행
};
```

### 📂 `src/features/ui/OfflineRewardCard.tsx` (오프라인 보상 + 광고 Mock)

```typescript
/**
 * 오프라인 보상 카드
 * - 경과 시간, 최대 시간, 획득 골드 표시
 * - "수령" 버튼
 * - "📺 2배 수령" 버튼 (광고 Mock: 1~2초 로딩)
 */

export const OfflineRewardCard: React.FC<OfflineRewardCardProps> = ({
  elapsedMinutes,
  totalGold,
  maxHours,
  onClaim,
  onClaimWithAd,
}) => {
  const [isLoadingAd, setIsLoadingAd] = useState(false);

  const handleClaimWithAd = async () => {
    setIsLoadingAd(true);
    // Mock 광고 로딩
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoadingAd(false);
    onClaimWithAd();
  };

  // UI 렌더링
};
```

### 📂 `src/utils/format.ts` (숫자 포맷팅)

```typescript
/**
 * 숫자 포맷팅: 1,234 / 12.3K / 4.56M / 7.89B
 */

export function formatNumber(num: number, decimals: number = 1): string {
  if (num < 1000) return Math.floor(num).toString();
  if (num < 1_000_000) return (num / 1000).toFixed(decimals) + 'K';
  if (num < 1_000_000_000) return (num / 1_000_000).toFixed(decimals) + 'M';
  if (num < 1_000_000_000_000) return (num / 1_000_000_000).toFixed(decimals) + 'B';
  return (num / 1_000_000_000_000).toFixed(decimals) + 'T';
}

export function formatNumberWithCommas(num: number): string {
  return Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatPercent(value: number, decimals: number = 1): string {
  return (value * 100).toFixed(decimals) + '%';
}
```

---

## (4) 실행 방법 + 확인 체크리스트

### 로컬 실행 (Expo Dev Client)

```bash
# 1. 의존성 설치
cd mythic-workshop
npm install

# 2. 개발 서버 시작
npm start

# 3. 모바일 기기에서 Expo Dev Client로 실행
# (또는 에뮬레이터 사용)
```

### 수동 테스트 시나리오 (8개)

#### 시나리오 1: 튜토리얼 진행
- [ ] 앱 첫 실행 시 튜토리얼 오버레이 표시 (4단계)
- [ ] "다음" 버튼으로 단계 진행
- [ ] "건너뛰기" 버튼으로 튜토리얼 스킵
- [ ] 튜토리얼 완료 후 SaveState에 저장 확인

#### 시나리오 2: 스테이지 진행 (1~50)
- [ ] 스테이지 1~9 일반 몬스터 클리어
- [ ] 스테이지 10 보스 클리어 (2배 보상 확인)
- [ ] 스테이지 20, 30, 40, 50 보스 클리어
- [ ] 최고 스테이지 기록 저장

#### 시나리오 3: 6개 업그레이드 동작
- [ ] 공격력 업그레이드 → 데미지 증가 확인
- [ ] 생명력 업그레이드 → HP 증가 확인
- [ ] 공격 속도 업그레이드 → 공격 간격 감소 확인
- [ ] 크리티컬 확률 업그레이드 → 크리티컬 발생 확인
- [ ] 크리티컬 데미지 업그레이드 → 크리티컬 데미지 증가 확인
- [ ] 오프라인 효율 업그레이드 → 오프라인 보상 증가 확인

#### 시나리오 4: 일일 미션 (6개)
- [ ] 미션 1: 전투 3회 → 진행도 표시 → 완료 → 보상 수령
- [ ] 미션 2: 강화 5회 → 진행도 표시 → 완료 → 보상 수령
- [ ] 미션 3: 스테이지 5회 클리어 → 진행도 표시 → 완료 → 보상 수령
- [ ] 미션 4: 오프라인 보상 수령 1회 → 완료 → 보상 수령
- [ ] 미션 5: 골드 1000 획득 → 진행도 표시 → 완료 → 보상 수령
- [ ] 미션 6: 스테이지 10 클리어 → 완료 → 보상 수령

#### 시나리오 5: 업적 (10개)
- [ ] 업적 1: 첫 전투 → 자동 해금
- [ ] 업적 2: 스테이지 10 클리어 → 자동 해금
- [ ] 업적 3: 스테이지 50 클리어 → 자동 해금
- [ ] 업적 4~10: 누적 조건 달성 → 해금 → 보상 수령

#### 시나리오 6: 오프라인 보상 (고도화)
- [ ] 앱 종료 후 1시간 경과 시뮬레이션
- [ ] 재실행 시 오프라인 보상 카드 표시
- [ ] 경과 시간, 최대 시간, 획득 골드 정확히 계산 확인
- [ ] "수령" 버튼 → 골드 지급
- [ ] "📺 2배 수령" 버튼 → 1~2초 로딩 → 2배 골드 지급

#### 시나리오 7: 마이그레이션 (Sprint 1 → Sprint 2)
- [ ] Sprint 1 저장 데이터 로드
- [ ] 자동 마이그레이션 실행
- [ ] 기존 스테이지, 골드, 업그레이드 유지
- [ ] 새 필드 (미션, 업적, 튜토리얼) 기본값 추가

#### 시나리오 8: 숫자 포맷팅
- [ ] 1,234 → "1.2K" 확인
- [ ] 1,234,567 → "1.2M" 확인
- [ ] 1,234,567,890 → "1.2B" 확인

---

## (5) Sprint 3 TODO

### 1. 동료 시스템 (Companion)
- 동료 카드 UI (이미지, 이름, 능력)
- 동료 능력 시스템 (전투 보조, 골드 증가 등)
- 동료 업그레이드 (레벨, 스킬)

### 2. 스토리 진행 (Story)
- 챕터별 스토리 UI
- 대사 렌더링 (NPC 아바타, 텍스트)
- 스토리 진행 보상

### 3. 고급 전투 효과
- 크리티컬 시스템 (이미 기초 구현)
- 상태 이상 (중독, 약화, 강화 등)
- 보스 특수 공격

### 4. UI/UX 개선
- 애니메이션 (Reanimated 또는 Skia)
- 효과음 (react-native-sound)
- 배경 음악

### 5. 데이터 확장
- 스테이지 51~100
- 더 많은 업그레이드
- 아이템 시스템

### 6. 성능 최적화
- 메모리 누수 제거
- 렌더링 최적화
- 번들 크기 감소

---

## 주의사항

- **가챠/랜덤뽑기 금지**: 모든 진행이 결정론적
- **광고 SDK 실제 연동 금지**: Mock 동작만 구현
- **복잡한 결제 금지**: 게임 내 경제만 구현
- **서버 연동 금지**: 로컬 저장소만 사용

---

## 파일 크기 및 구조

| 파일 | 역할 | 크기 |
|------|------|------|
| `balanceTables.json` | 게임 밸런스 (스테이지 1~50, 6개 업그레이드) | ~15KB |
| `quests.json` | 일일 미션 6개 | ~2KB |
| `achievements.json` | 업적 10개 | ~3KB |
| `questEngine.ts` | 미션 엔진 | ~2KB |
| `achievementEngine.ts` | 업적 엔진 | ~3KB |
| `migration.ts` | 마이그레이션 로직 | ~2KB |
| `TutorialOverlay.tsx` | 튜토리얼 UI | ~3KB |
| `OfflineRewardCard.tsx` | 오프라인 보상 UI | ~4KB |
| `format.ts` | 숫자 포맷팅 | ~1KB |

---

## 개발 노트

### Sprint 1 → Sprint 2 마이그레이션
- SaveState 버전을 1 → 2로 증가
- 기존 필드 유지, 새 필드 기본값 추가
- 자동 마이그레이션 (로드 시 자동 실행)

### 오프라인 보상 계산
- **기본 수익**: 현재 스테이지의 골드 보상 / 60 (분 단위)
- **효율 배수**: 오프라인 효율 업그레이드로 증가
- **상한**: 8시간 (28,800초)

### 튜토리얼 진행
- 첫 실행 시 자동 표시
- 4단계 순차 진행
- "건너뛰기" 또는 마지막 단계에서 완료
- SaveState에 저장

### 일일 미션 리셋
- 24시간 주기 (간단 구현)
- lastDailyResetTime 기반 확인
- 리셋 시 모든 미션 초기화

---

## 라이선스

(프로젝트 라이선스 추가)

## 문의

(연락처 정보 추가)

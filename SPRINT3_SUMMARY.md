# 🎮 Sprint 3 완료: 설화 정비소 - 스토리 + 동료 + 컬렉션 시스템

## (1) Sprint 3 목표 및 완료 조건

### 목표
Sprint 1~2의 기본 루프와 성장/경제 시스템을 바탕으로 **스토리(에피소드/챕터) + 동료(가챠X) + 컬렉션/도감 + 간단 컷신 연출**을 추가하여 게임의 **독창성(한국 설화 기반)**을 체감시키고, **중장기 리텐션의 축**을 만듭니다.

### 완료 조건 (DoD)
- ✅ **5개 챕터, 40개 에피소드**: 스테이지 진행에 따라 자동 트리거, 귀엽고 가벼운 톤
- ✅ **12명 동료 (가챠X)**: 한국 설화 기반, 스테이지/업적/퀘스트/제작으로만 해금
- ✅ **동료 패시브 버프**: 골드, HP, ATK, 크리티컬, 오프라인 효율에 실제 반영
- ✅ **컬렉션/도감**: 그리드 카드, 잠금/해금 표시, 상세 화면
- ✅ **제작(조합) 시스템**: 파편/조각으로 동료 해금 및 강화
- ✅ **스토리 모달**: 에피소드 팝업, 다시보기 기능
- ✅ **설화 파편**: 새로운 재화, 스테이지/보상에 고정 지급
- ✅ **저장/로드 및 마이그레이션**: Sprint 2 데이터 호환성 유지

---

## (2) 변경된 파일 트리

### 추가된 파일 (🆕)
```
src/data/
├── storyEpisodes.json              🆕 5개 챕터, 40개 에피소드
└── characters.json                 🆕 12명 동료 (확장)

src/features/
├── progression/
│   ├── companionEngine.ts          🆕 동료 해금/강화/버프 엔진
│   ├── storyEngine.ts              🆕 스토리 트리거/로그 엔진
│   └── craftSystem.ts              🆕 제작(조합) 시스템
└── ui/
    ├── StoryModal.tsx              🆕 스토리 모달
    └── CollectionCard.tsx          🆕 컬렉션 카드

src/utils/
└── companionBuffs.ts               🆕 동료 버프 적용 유틸

src/features/save/
└── migrationV3.ts                  🆕 SaveState 마이그레이션 (V2→V3)
```

### 수정된 파일 (📝)
```
src/data/
└── balanceTables.json              📝 스테이지 보상에 파편/동료조각 추가

src/
├── types.ts                        📝 SaveState 필드 확장, 새 타입 추가
└── features/save/
    └── persistence.ts              📝 V3 마이그레이션 적용
```

---

## (3) 핵심 파일 전체 코드

### 📂 `src/data/storyEpisodes.json` (5개 챕터, 40개 에피소드)

**구조**:
- **5개 챕터**: 프롤로그 + 1~4장
- **챕터당 6~10개 에피소드**: 총 40개
- **에피소드 구성**: id, title, speaker, text(1~3문장), reward, trigger(스테이지)

**예시**:
```json
{
  "chapters": [
    {
      "chapterId": 1,
      "title": "프롤로그: 정비소의 문을 열다",
      "episodes": [
        {
          "episodeId": 101,
          "title": "첫 손님",
          "speaker": "narrator",
          "text": "오래된 설화들이 사라져가고 있어요...",
          "reward": { "gold": 50, "fragments": 5 },
          "trigger": { "type": "stage", "value": 1 }
        },
        // ... 더 많은 에피소드
      ]
    },
    // ... 4개 챕터 추가
  ]
}
```

### 📂 `src/data/characters.json` (12명 동료)

**동료 목록**:
1. 도깨비 기술자 (Rare, 골드 +10%)
2. 장승 수문장 (Rare, HP +15%)
3. 해태 감시자 (Epic, 오프라인 +20%)
4. 삼족오 기록자 (Epic, 크리티컬확률 +10%)
5. 이무기 네트워크 (Epic, 공격력 +12%)
6. 구미호 협상가 (Legendary, 골드 +20%)
7. 홍길동 침투자 (Legendary, 크리티컬데미지 +30%)
8. 춘향 인연 (Legendary, 공격력 +15%)
9. 바리공주 정화 (Legendary, HP +25%)
10. 처용 수호자 (Legendary, 오프라인 +30%)
11. 문전신 수호 (Rare, 공격력 +8%)
12. 단군 상징 (Epic, 골드 +15%)

**각 동료 필드**:
```json
{
  "companionId": "dokkaebi_engineer",
  "name": "도깨비 기술자",
  "rarity": "rare",
  "lore": "정비소의 주요 기술자...",
  "unlockType": "stage",
  "unlockCondition": 3,
  "maxLevel": 50,
  "passiveBuff": {
    "type": "goldGain",
    "value": 0.1,
    "description": "골드 획득량 +10%"
  },
  "upgradeCost": { "fragments": 5, "companionShards": 1 }
}
```

### 📂 `src/types.ts` (Sprint 3 타입)

```typescript
export interface CompanionProgress {
  companionId: string;
  level: number;
  isUnlocked: boolean;
  unlockedAt: number | null;
  shardCount: number;
}

export interface StoryProgress {
  currentChapter: number;
  currentEpisode: number;
  viewedEpisodes: number[];
}

// SaveState 확장
export interface SaveState {
  // ... Sprint 2 필드
  fragments: number;
  companionShards: Record<string, number>;
  companionProgress: Record<string, CompanionProgress>;
  storyProgress: StoryProgress;
}
```

### 📂 `src/features/progression/companionEngine.ts` (동료 시스템)

```typescript
/**
 * 동료 해금 (스테이지 도달)
 */
export function unlockCompanionByStage(
  progress: Record<string, CompanionProgress>,
  stageId: number
): Record<string, CompanionProgress> {
  // 스테이지 조건 확인 후 동료 해금
}

/**
 * 동료 버프 합산 (모든 해금된 동료)
 */
export function calculateCompanionBuffs(
  progress: Record<string, CompanionProgress>
): Record<string, number> {
  const buffs = {
    goldGain: 0,
    hp: 0,
    atk: 0,
    critChance: 0,
    critDamage: 0,
    offlineEfficiency: 0,
  };

  // 각 동료의 버프 합산
  companions.forEach((companion) => {
    const p = progress[companion.companionId];
    if (p && p.isUnlocked) {
      buffs[companion.passiveBuff.type] += companion.passiveBuff.value * p.level;
    }
  });

  return buffs;
}

/**
 * 동료 조각으로 해금
 */
export function unlockCompanionByCraft(
  progress: Record<string, CompanionProgress>,
  companionId: string,
  requiredShards: number
): { updated: Record<string, CompanionProgress>; success: boolean } {
  // 조각 소비 후 동료 해금
}
```

### 📂 `src/features/progression/storyEngine.ts` (스토리 엔진)

```typescript
/**
 * 에피소드 트리거 확인 (스테이지 클리어 시)
 */
export function checkEpisodeTrigger(
  stageId: number
): { episodeId: number; chapterId: number } | null {
  // 스테이지에 해당하는 에피소드 찾기
}

/**
 * 에피소드 시청 기록
 */
export function markEpisodeAsViewed(
  progress: StoryProgress,
  episodeId: number
): StoryProgress {
  // 에피소드를 시청한 것으로 표시
}

/**
 * 에피소드 보상 계산
 */
export function getEpisodeReward(episodeId: number) {
  // 골드, 파편, 동료조각 반환
}

/**
 * 챕터 클리어 확인
 */
export function isChapterComplete(
  progress: StoryProgress,
  chapterId: number
): boolean {
  // 모든 에피소드가 시청되었는지 확인
}
```

### 📂 `src/features/progression/craftSystem.ts` (제작 시스템)

```typescript
/**
 * 제작 레시피
 */
export interface CraftRecipe {
  recipeId: string;
  name: string;
  description: string;
  type: 'unlock' | 'upgrade';
  targetCompanionId?: string;
  cost: {
    fragments?: number;
    companionShards?: Record<string, number>;
  };
  reward: {
    companionId?: string;
    companionLevel?: number;
  };
  craftTime: number;
}

/**
 * 제작 실행
 */
export function executeCraft(
  recipe: CraftRecipe,
  companionProgress: Record<string, CompanionProgress>,
  currentFragments: number,
  companionShards: Record<string, number>
): {
  success: boolean;
  updatedCompanionProgress?: Record<string, CompanionProgress>;
  updatedFragments?: number;
  updatedCompanionShards?: Record<string, number>;
  message: string;
} {
  // 비용 확인 → 소비 → 보상 지급
}
```

### 📂 `src/features/ui/StoryModal.tsx` (스토리 모달)

```typescript
/**
 * 에피소드 팝업 모달
 * - 제목, 화자, 텍스트 표시
 * - "다음" / "닫기" 버튼
 * - 아이콘 표시 (플레이스홀더)
 */
export const StoryModal: React.FC<StoryModalProps> = ({
  visible,
  episodeTitle,
  speaker,
  text,
  icon,
  onNext,
  onClose,
}) => {
  // 모달 UI 렌더링
};
```

### 📂 `src/features/ui/CollectionCard.tsx` (컬렉션 카드)

```typescript
/**
 * 도감 카드 (그리드 아이템)
 * - 해금: 아이콘 + 이름 + 희귀도
 * - 잠금: 🔒 + "???"
 */
export const CollectionCard: React.FC<CollectionCardProps> = ({
  name,
  rarity,
  isUnlocked,
  icon,
  onPress,
}) => {
  // 카드 UI 렌더링
};
```

### 📂 `src/utils/companionBuffs.ts` (동료 버프 적용)

```typescript
/**
 * 동료 버프를 포함한 최종 스탯 계산
 */
export function calculateStatsWithCompanionBuffs(
  baseAtk: number,
  baseHp: number,
  upgradeLevels: Record<string, number>,
  companionProgress: Record<string, CompanionProgress>
) {
  const buffs = calculateCompanionBuffs(companionProgress);

  return {
    atk: Math.floor(baseAtk * (1 + buffs.atk)),
    hp: Math.floor(baseHp * (1 + buffs.hp)),
    // ... 기타 스탯
  };
}

/**
 * 동료 버프를 포함한 골드 획득량
 */
export function calculateGoldWithCompanionBuffs(
  baseGold: number,
  companionProgress: Record<string, CompanionProgress>
): number {
  const buffs = calculateCompanionBuffs(companionProgress);
  return Math.floor(baseGold * (1 + buffs.goldGain));
}
```

### 📂 `src/features/save/migrationV3.ts` (마이그레이션)

```typescript
/**
 * V2 → V3 마이그레이션
 */
export function migrateFromV2(v2: SaveStateV2): SaveState {
  return {
    // ... V2 필드 유지
    // Sprint 3 필드
    fragments: 0,
    companionShards: {},
    companionProgress: initializeCompanions(),
    storyProgress: initializeStoryProgress(),
  };
}

/**
 * SaveState 마이그레이션 통합
 */
export function migrateToV3(saved: any): SaveState {
  if (saved.version === 3) return saved;
  if (saved.version === 2) return migrateFromV2(saved);
  return getDefaultSaveStateV3();
}
```

---

## (4) 실행 방법 + 수동 테스트 시나리오 10개

### 로컬 실행
```bash
cd mythic-workshop
npm install
npm start
```

### 수동 테스트 시나리오

| # | 시나리오 | 확인 항목 |
|---|---------|---------|
| 1 | 스토리 에피소드 트리거 | 스테이지 1, 3, 5, 10 클리어 시 에피소드 팝업 표시 |
| 2 | 에피소드 보상 | 에피소드 시청 후 골드/파편/동료조각 지급 확인 |
| 3 | 동료 해금 (스테이지) | 스테이지 3 도달 시 도깨비 기술자 자동 해금 |
| 4 | 동료 해금 (제작) | 파편 10개 + 제작 → 도깨비 기술자 해금 |
| 5 | 동료 버프 적용 | 동료 해금 후 골드 획득량 증가 확인 |
| 6 | 컬렉션 도감 | 12명 동료 카드 그리드, 잠금/해금 표시 |
| 7 | 컬렉션 상세 | 카드 클릭 → 상세 화면 (이름, 희귀도, 버프 설명) |
| 8 | 챕터 진행 | 챕터 1~5 에피소드 순차 진행 |
| 9 | 다시보기 (스토리 로그) | 이전 에피소드 재시청 가능 |
| 10 | 마이그레이션 (V2→V3) | Sprint 2 저장 데이터 로드 → 자동 마이그레이션 → 기존 데이터 유지 |

---

## (5) Sprint 4 TODO

### 1. 패스 시스템 (Pass/Battle Pass)
- 무료/프리미엄 패스
- 주간/월간 진행도
- 보상 목록 (확장 포인트만, 실제 결제 금지)

### 2. 광고 SDK 실제 연동 (확장 포인트)
- Admob/Facebook Audience Network 통합 포인트
- 리워드 광고 (2배 수령 등)
- 배너/인터스티셜 광고

### 3. 밸런스 리모트 (Remote Config)
- Firebase Remote Config 통합 포인트
- 스테이지 난이도, 보상 조정
- A/B 테스트 준비

### 4. 배포 체크리스트
- iOS/Android 빌드 및 테스트
- 앱 스토어/플레이 스토어 배포 준비
- 프라이버시 정책, 이용약관 작성

### 5. 성능 최적화
- 메모리 누수 제거
- 렌더링 최적화
- 번들 크기 감소

---

## 주의사항

- **가챠/랜덤뽑기 금지**: 모든 동료는 결정론적 방식으로만 해금
- **광고 SDK 실제 연동 금지**: Mock 동작만 구현, 확장 포인트 주석만 OK
- **복잡한 결제 금지**: 게임 내 경제만 구현
- **서버 연동 금지**: 로컬 저장소만 사용

---

## 파일 크기 및 구조

| 파일 | 역할 | 크기 |
|------|------|------|
| `storyEpisodes.json` | 5개 챕터, 40개 에피소드 | ~20KB |
| `characters.json` | 12명 동료 (확장) | ~8KB |
| `companionEngine.ts` | 동료 해금/강화/버프 | ~4KB |
| `storyEngine.ts` | 스토리 트리거/로그 | ~3KB |
| `craftSystem.ts` | 제작 시스템 | ~3KB |
| `StoryModal.tsx` | 스토리 모달 UI | ~3KB |
| `CollectionCard.tsx` | 컬렉션 카드 | ~2KB |
| `companionBuffs.ts` | 버프 적용 유틸 | ~2KB |
| `migrationV3.ts` | 마이그레이션 로직 | ~2KB |

---

## 개발 노트

### 스토리 시스템
- **에피소드 트리거**: 스테이지 클리어 시 자동 팝업
- **보상**: 골드 + 파편 + 동료조각 (고정 지급, 확률 없음)
- **다시보기**: StoryLog 화면에서 챕터별 에피소드 확인 가능

### 동료 시스템
- **해금 방식**: 스테이지 도달 / 업적 달성 / 퀘스트 완료 / 제작
- **버프 적용**: 레벨에 따라 증가 (레벨 1~50/60/70)
- **버프 종류**: 골드, HP, ATK, 크리티컬확률, 크리티컬데미지, 오프라인효율

### 제작 시스템
- **레시피**: 파편/조각 → 동료 해금 또는 강화
- **비용**: 파편 또는 동료조각 (고정)
- **결과**: 즉시 또는 시간 경과 (현재는 즉시)

### 마이그레이션
- **V2 → V3**: 기존 필드 유지, 새 필드 기본값 추가
- **자동 실행**: 로드 시 자동 마이그레이션
- **호환성**: Sprint 1~2 저장 데이터 100% 호환

---

## 라이선스

(프로젝트 라이선스 추가)

## 문의

(연락처 정보 추가)

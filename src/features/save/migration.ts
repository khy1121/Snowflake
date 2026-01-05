/**
 * SaveState 마이그레이션 로직
 * Sprint 1 → Sprint 2 호환성 유지
 */

import { SaveState, DailyQuestProgress, AchievementProgress } from '@/types';

const CURRENT_VERSION = 2;

/**
 * Sprint 1 SaveState 타입 (호환성)
 */
interface SaveStateV1 {
  version: 1;
  lastSeenAt: number;
  currentStage: number;
  gold: number;
  hp: number;
  atk: number;
  upgradeLevels: {
    atk: number;
    hp: number;
  };
  offlineRewardClaimed: boolean;
}

/**
 * SaveState 마이그레이션
 */
export function migrateSaveState(saved: any): SaveState {
  if (saved.version === CURRENT_VERSION) {
    return saved as SaveState;
  }

  if (saved.version === 1) {
    return migrateFromV1(saved as SaveStateV1);
  }

  // 알 수 없는 버전: 기본값 반환
  return getDefaultSaveStateV2();
}

/**
 * V1 → V2 마이그레이션
 */
function migrateFromV1(v1: SaveStateV1): SaveState {
  return {
    version: CURRENT_VERSION,
    lastSeenAt: v1.lastSeenAt,
    currentStage: v1.currentStage,
    gold: v1.gold,
    hp: v1.hp,
    atk: v1.atk,
    upgradeLevels: {
      atk: v1.upgradeLevels.atk,
      hp: v1.upgradeLevels.hp,
      attackSpeed: 0,
      critChance: 0,
      critDamage: 0,
      offlineEfficiency: 0,
    },
    offlineRewardClaimed: v1.offlineRewardClaimed,
    // Sprint 2 필드
    tutorialCompleted: false,
    tutorialStep: 0,
    dailyQuestProgress: {},
    achievementProgress: {},
    totalBattleWins: 0,
    totalUpgrades: v1.upgradeLevels.atk + v1.upgradeLevels.hp,
    totalGoldEarned: v1.gold,
    totalOfflineRewardsClaimed: v1.offlineRewardClaimed ? 1 : 0,
    lastDailyResetTime: Date.now(),
    stats: {
      totalBattles: 0,
      totalStagesCleared: v1.currentStage - 1,
      highestStageReached: v1.currentStage,
    },
  };
}

/**
 * 기본 SaveState V2
 */
export function getDefaultSaveStateV2(): SaveState {
  return {
    version: CURRENT_VERSION,
    lastSeenAt: Date.now(),
    currentStage: 1,
    gold: 0,
    hp: 100,
    atk: 5,
    upgradeLevels: {
      atk: 0,
      hp: 0,
      attackSpeed: 0,
      critChance: 0,
      critDamage: 0,
      offlineEfficiency: 0,
    },
    offlineRewardClaimed: false,
    tutorialCompleted: false,
    tutorialStep: 0,
    dailyQuestProgress: {},
    achievementProgress: {},
    totalBattleWins: 0,
    totalUpgrades: 0,
    totalGoldEarned: 0,
    totalOfflineRewardsClaimed: 0,
    lastDailyResetTime: Date.now(),
    stats: {
      totalBattles: 0,
      totalStagesCleared: 0,
      highestStageReached: 1,
    },
  };
}

/**
 * SaveState 마이그레이션 V4 → V5 (Sprint 5)
 */

import { SaveState } from '@/types';

const CURRENT_VERSION = 5;

/**
 * V4 SaveState 타입 (호환성)
 */
interface SaveStateV4 {
  version: 4;
  // ... (Sprint 4의 모든 필드)
  lastSeenAt: number;
  currentStage: number;
  gold: number;
  // ...
  cosmeticTokens: number;
  cosmeticProgress: any;
  passProgress: any;
  adRewardCooldowns: any;
  remoteConfigVersion: string;
}

/**
 * V4 → V5 마이그레이션
 */
export function migrateFromV4(v4: SaveStateV4): SaveState {
  return {
    ...(v4 as any), // 기존 필드 유지
    version: CURRENT_VERSION,
    // Sprint 5 필드
    eventProgress: {},
    settings: {
      notificationsEnabled: true,
      musicVolume: 0.8,
      sfxVolume: 1.0,
    },
    userId: `user_${Date.now()}` // 익명 사용자 ID
  };
}

/**
 * SaveState 마이그레이션 통합
 */
export function migrateToV5(saved: any): SaveState {
  if (saved.version === CURRENT_VERSION) {
    return saved as SaveState;
  }

  if (saved.version === 4) {
    return migrateFromV4(saved as SaveStateV4);
  }

  // 이전 버전은 순차적으로 마이그레이션
  // ...

  return getDefaultSaveStateV5();
}

/**
 * 기본 SaveState V5
 */
export function getDefaultSaveStateV5(): SaveState {
  // ... (getDefaultSaveStateV4와 유사하게 모든 필드 초기화)
  return {} as SaveState; // Placeholder
}

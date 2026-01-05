/**
 * 동료(Companion) 시스템 엔진
 * 해금, 강화, 버프 적용
 */

import companions from '@/data/characters.json';
import { CompanionProgress } from '@/types';

/**
 * 동료 초기화
 */
export function initializeCompanions(): Record<string, CompanionProgress> {
  const progress: Record<string, CompanionProgress> = {};

  companions.companions.forEach((companion) => {
    progress[companion.companionId] = {
      companionId: companion.companionId,
      level: 0,
      isUnlocked: false,
      unlockedAt: null,
      shardCount: 0,
    };
  });

  return progress;
}

/**
 * 동료 해금 (스테이지 도달)
 */
export function unlockCompanionByStage(
  progress: Record<string, CompanionProgress>,
  stageId: number
): Record<string, CompanionProgress> {
  const updated = { ...progress };

  companions.companions.forEach((companion) => {
    if (
      companion.unlockType === 'stage' &&
      (companion.unlockCondition as number) === stageId &&
      !updated[companion.companionId].isUnlocked
    ) {
      updated[companion.companionId].isUnlocked = true;
      updated[companion.companionId].unlockedAt = Date.now();
      updated[companion.companionId].level = 1;
    }
  });

  return updated;
}

/**
 * 동료 조각 추가
 */
export function addCompanionShards(
  progress: Record<string, CompanionProgress>,
  companionId: string,
  shardCount: number
): Record<string, CompanionProgress> {
  const updated = { ...progress };

  if (updated[companionId]) {
    updated[companionId].shardCount += shardCount;
  }

  return updated;
}

/**
 * 동료 강화 (파편 소비)
 */
export function upgradeCompanion(
  progress: Record<string, CompanionProgress>,
  companionId: string,
  fragmentsCost: number
): { updated: Record<string, CompanionProgress>; success: boolean } {
  const updated = { ...progress };
  const companion = companions.companions.find((c) => c.companionId === companionId);

  if (!companion || !updated[companionId].isUnlocked) {
    return { updated, success: false };
  }

  if (updated[companionId].level >= companion.maxLevel) {
    return { updated, success: false };
  }

  updated[companionId].level += 1;
  return { updated, success: true };
}

/**
 * 동료 조각으로 해금
 */
export function unlockCompanionByCraft(
  progress: Record<string, CompanionProgress>,
  companionId: string,
  requiredShards: number
): { updated: Record<string, CompanionProgress>; success: boolean } {
  const updated = { ...progress };

  if (!updated[companionId] || updated[companionId].isUnlocked) {
    return { updated, success: false };
  }

  if (updated[companionId].shardCount < requiredShards) {
    return { updated, success: false };
  }

  updated[companionId].isUnlocked = true;
  updated[companionId].unlockedAt = Date.now();
  updated[companionId].level = 1;
  updated[companionId].shardCount -= requiredShards;

  return { updated, success: true };
}

/**
 * 동료 버프 합산 (모든 해금된 동료)
 */
export function calculateCompanionBuffs(
  progress: Record<string, CompanionProgress>
): Record<string, number> {
  const buffs: Record<string, number> = {
    goldGain: 0,
    hp: 0,
    atk: 0,
    critChance: 0,
    critDamage: 0,
    offlineEfficiency: 0,
  };

  companions.companions.forEach((companion) => {
    const p = progress[companion.companionId];
    if (p && p.isUnlocked) {
      const buffType = companion.passiveBuff.type;
      const buffValue = companion.passiveBuff.value * p.level; // 레벨에 따라 증가

      if (buffType in buffs) {
        buffs[buffType] += buffValue;
      }
    }
  });

  return buffs;
}

/**
 * 동료 데이터 조회
 */
export function getCompanionData(companionId: string) {
  return companions.companions.find((c) => c.companionId === companionId);
}

/**
 * 모든 동료 데이터 조회
 */
export function getAllCompanionData() {
  return companions.companions;
}

/**
 * 동료 해금 조건 확인
 */
export function checkCompanionUnlockConditions(
  progress: Record<string, CompanionProgress>,
  stageId: number,
  achievementId?: string,
  questId?: string
): Record<string, CompanionProgress> {
  let updated = { ...progress };

  // 스테이지 조건
  updated = unlockCompanionByStage(updated, stageId);

  // 추후 업적/퀘스트 조건 추가 가능
  // if (achievementId) { ... }
  // if (questId) { ... }

  return updated;
}

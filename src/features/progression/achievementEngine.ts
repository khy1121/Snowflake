/**
 * 업적(Achievement) 엔진
 */

import achievements from '@/data/achievements.json';
import { AchievementProgress } from '@/types';

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
  const achievement = achievements.achievements.find((a) => a.achievementId === achievementId);

  if (!achievement || updated[achievementId].isUnlocked) {
    return updated;
  }

  const newProgress = updated[achievementId].progress + value;
  updated[achievementId].progress = newProgress;

  // 목표 달성 확인
  if ((achievement as any).targetValue && newProgress >= (achievement as any).targetValue) {
    updated[achievementId].isUnlocked = true;
    updated[achievementId].unlockedAt = Date.now();
  }

  return updated;
}

/**
 * 특정 업그레이드 레벨 업적 확인
 */
export function checkUpgradeAchievement(
  progress: Record<string, AchievementProgress>,
  upgradeId: string,
  level: number
): Record<string, AchievementProgress> {
  const updated = { ...progress };

  achievements.achievements.forEach((achievement) => {
    if (
      (achievement as any).type === 'upgrade' &&
      (achievement as any).upgradeId === upgradeId &&
      (achievement as any).targetLevel === level
    ) {
      if (!updated[achievement.achievementId].isUnlocked) {
        updated[achievement.achievementId].isUnlocked = true;
        updated[achievement.achievementId].unlockedAt = Date.now();
      }
    }
  });

  return updated;
}

/**
 * 스테이지 클리어 업적 확인
 */
export function checkStageAchievements(
  progress: Record<string, AchievementProgress>,
  stageId: number
): Record<string, AchievementProgress> {
  const updated = { ...progress };

  achievements.achievements.forEach((achievement) => {
    if ((achievement as any).type === 'milestone') {
      if (achievement.achievementId === 'first_battle' && stageId >= 1) {
        if (!updated[achievement.achievementId].isUnlocked) {
          updated[achievement.achievementId].isUnlocked = true;
          updated[achievement.achievementId].unlockedAt = Date.now();
        }
      } else if (achievement.achievementId === 'stage_10' && stageId >= 10) {
        if (!updated[achievement.achievementId].isUnlocked) {
          updated[achievement.achievementId].isUnlocked = true;
          updated[achievement.achievementId].unlockedAt = Date.now();
        }
      } else if (achievement.achievementId === 'stage_50' && stageId >= 50) {
        if (!updated[achievement.achievementId].isUnlocked) {
          updated[achievement.achievementId].isUnlocked = true;
          updated[achievement.achievementId].unlockedAt = Date.now();
        }
      }
    }
  });

  return updated;
}

/**
 * 업적 보상 수령
 */
export function claimAchievementReward(
  progress: Record<string, AchievementProgress>,
  achievementId: string
): { updated: Record<string, AchievementProgress>; goldReward: number } {
  const updated = { ...progress };
  const achievement = achievements.achievements.find((a) => a.achievementId === achievementId);

  if (!achievement) {
    return { updated, goldReward: 0 };
  }

  if (updated[achievementId] && updated[achievementId].isUnlocked && !updated[achievementId].isRewarded) {
    updated[achievementId].isRewarded = true;
    return { updated, goldReward: achievement.reward };
  }

  return { updated, goldReward: 0 };
}

/**
 * 모든 해금된 업적의 보상 합계
 */
export function getClaimableAchievementRewards(progress: Record<string, AchievementProgress>): number {
  let total = 0;

  achievements.achievements.forEach((achievement) => {
    const p = progress[achievement.achievementId];
    if (p && p.isUnlocked && !p.isRewarded) {
      total += achievement.reward;
    }
  });

  return total;
}

/**
 * 업적 데이터 조회
 */
export function getAchievementData(achievementId: string) {
  return achievements.achievements.find((a) => a.achievementId === achievementId);
}

/**
 * 모든 업적 데이터 조회
 */
export function getAllAchievementData() {
  return achievements.achievements;
}

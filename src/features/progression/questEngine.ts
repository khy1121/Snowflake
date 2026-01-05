/**
 * 일일 미션(Quest) 엔진
 */

import quests from '@/data/quests.json';
import { DailyQuestProgress } from '@/types';

/**
 * 일일 미션 초기화 (새로운 날)
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
 * 일일 미션 리셋 필요 여부 확인
 */
export function shouldResetDailyQuests(lastResetTime: number): boolean {
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;
  return now - lastResetTime >= dayInMs;
}

/**
 * 일일 미션 진행도 업데이트
 */
export function updateQuestProgress(
  progress: Record<string, DailyQuestProgress>,
  questId: string,
  increment: number = 1
): Record<string, DailyQuestProgress> {
  const updated = { ...progress };

  if (updated[questId]) {
    updated[questId] = {
      ...updated[questId],
      currentProgress: updated[questId].currentProgress + increment,
    };

    // 목표 달성 확인
    const quest = quests.dailyQuests.find((q) => q.questId === questId);
    if (quest && updated[questId].currentProgress >= quest.targetCount) {
      updated[questId].isCompleted = true;
    }
  }

  return updated;
}

/**
 * 일일 미션 보상 수령
 */
export function claimQuestReward(
  progress: Record<string, DailyQuestProgress>,
  questId: string
): { updated: Record<string, DailyQuestProgress>; goldReward: number } {
  const updated = { ...progress };
  const quest = quests.dailyQuests.find((q) => q.questId === questId);

  if (!quest) {
    return { updated, goldReward: 0 };
  }

  if (updated[questId] && updated[questId].isCompleted && !updated[questId].isRewarded) {
    updated[questId].isRewarded = true;
    return { updated, goldReward: quest.goldReward };
  }

  return { updated, goldReward: 0 };
}

/**
 * 모든 완료된 미션의 보상 합계
 */
export function getClaimableQuestRewards(progress: Record<string, DailyQuestProgress>): number {
  let total = 0;

  quests.dailyQuests.forEach((quest) => {
    const p = progress[quest.questId];
    if (p && p.isCompleted && !p.isRewarded) {
      total += quest.goldReward;
    }
  });

  return total;
}

/**
 * 미션 데이터 조회
 */
export function getQuestData(questId: string) {
  return quests.dailyQuests.find((q) => q.questId === questId);
}

/**
 * 모든 미션 데이터 조회
 */
export function getAllQuestData() {
  return quests.dailyQuests;
}

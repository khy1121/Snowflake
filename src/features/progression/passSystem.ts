/**
 * 패스(Pass) 시스템 엔진
 * 무료/프리미엄 패스, XP 획득, 보상 수령
 */

import passData from '@/data/pass.json';

export interface PassProgress {
  seasonId: string;
  currentLevel: number;
  currentExp: number;
  isPremiumUnlocked: boolean;
  claimedFreeRewards: number[]; // 수령한 레벨 목록
  claimedPremiumRewards: number[]; // 수령한 프리미엄 보상 레벨 목록
  unlockedAt: number | null;
}

export interface PassReward {
  type: 'gold' | 'fragments' | 'companionShard' | 'cosmeticToken' | 'cosmeticItem';
  amount?: number;
  companionId?: string;
  itemId?: string;
}

/**
 * 패스 초기화
 */
export function initializePassProgress(): PassProgress {
  const currentSeason = passData.seasons[0];

  return {
    seasonId: currentSeason.seasonId,
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
  const updated = { ...progress };
  const season = passData.seasons.find((s) => s.seasonId === progress.seasonId);

  if (!season) {
    return { updated, leveledUp: false };
  }

  updated.currentExp += expAmount;

  let leveledUp = false;
  let newLevel = progress.currentLevel;

  while (
    updated.currentExp >= season.expPerLevel &&
    updated.currentLevel < season.levels
  ) {
    updated.currentExp -= season.expPerLevel;
    updated.currentLevel += 1;
    leveledUp = true;
    newLevel = updated.currentLevel;
  }

  return { updated, leveledUp, newLevel };
}

/**
 * 패스 레벨 보상 수령
 */
export function claimPassReward(
  progress: PassProgress,
  level: number,
  isPremium: boolean
): { updated: PassProgress; rewards: PassReward[]; success: boolean } {
  const updated = { ...progress };
  const season = passData.seasons.find((s) => s.seasonId === progress.seasonId);

  if (!season || level > progress.currentLevel) {
    return { updated, rewards: [], success: false };
  }

  const claimedList = isPremium
    ? updated.claimedPremiumRewards
    : updated.claimedFreeRewards;

  if (claimedList.includes(level)) {
    return { updated, rewards: [], success: false };
  }

  const rewardsList = isPremium
    ? season.rewardsPremium
    : season.rewardsFree;

  const rewardData = rewardsList.find((r) => r.level === level);

  if (!rewardData) {
    return { updated, rewards: [], success: false };
  }

  claimedList.push(level);

  if (isPremium) {
    updated.claimedPremiumRewards = claimedList;
  } else {
    updated.claimedFreeRewards = claimedList;
  }

  return {
    updated,
    rewards: rewardData.rewards,
    success: true,
  };
}

/**
 * 프리미엄 패스 잠금 해제 (Mock 구매)
 */
export function unlockPremiumPass(
  progress: PassProgress
): PassProgress {
  return {
    ...progress,
    isPremiumUnlocked: true,
    unlockedAt: Date.now(),
  };
}

/**
 * 현재 시즌 데이터 조회
 */
export function getCurrentSeason() {
  return passData.seasons[0];
}

/**
 * 패스 진행률 계산
 */
export function getPassProgress(progress: PassProgress): number {
  const season = getCurrentSeason();
  const totalExp = season.expPerLevel * season.levels;
  const currentTotalExp =
    (progress.currentLevel - 1) * season.expPerLevel + progress.currentExp;

  return (currentTotalExp / totalExp) * 100;
}

/**
 * 다음 레벨까지 필요한 XP
 */
export function getExpToNextLevel(progress: PassProgress): number {
  const season = getCurrentSeason();

  if (progress.currentLevel >= season.levels) {
    return 0;
  }

  return season.expPerLevel - progress.currentExp;
}

/**
 * 클레임 가능한 보상 목록
 */
export function getClaimableRewards(
  progress: PassProgress
): Array<{ level: number; isPremium: boolean; rewards: PassReward[] }> {
  const season = getCurrentSeason();
  const claimable = [];

  // 무료 보상
  for (const reward of season.rewardsFree) {
    if (
      reward.level <= progress.currentLevel &&
      !progress.claimedFreeRewards.includes(reward.level)
    ) {
      claimable.push({
        level: reward.level,
        isPremium: false,
        rewards: reward.rewards,
      });
    }
  }

  // 프리미엄 보상
  if (progress.isPremiumUnlocked) {
    for (const reward of season.rewardsPremium) {
      if (
        reward.level <= progress.currentLevel &&
        !progress.claimedPremiumRewards.includes(reward.level)
      ) {
        claimable.push({
          level: reward.level,
          isPremium: true,
          rewards: reward.rewards,
        });
      }
    }
  }

  return claimable;
}

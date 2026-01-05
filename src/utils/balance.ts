/**
 * 게임 밸런스 계산 유틸리티 (Sprint 2 고도화)
 */

import balanceTables from '@/data/balanceTables.json';
import { Stage, UpgradeConfig, UpgradeInfo } from '@/types';

/**
 * 스테이지 정보 조회
 */
export function getStage(stageId: number): Stage {
  const stage = balanceTables.stages.find((s) => s.stageId === stageId);
  if (!stage) {
    throw new Error(`Stage ${stageId} not found`);
  }
  return stage;
}

/**
 * 업그레이드 설정 조회
 */
export function getUpgradeConfig(upgradeId: string): UpgradeConfig {
  const upgrade = balanceTables.upgrades.find((u) => u.upgradeId === upgradeId);
  if (!upgrade) {
    throw new Error(`Upgrade ${upgradeId} not found`);
  }
  return upgrade;
}

/**
 * 업그레이드 정보 계산 (Sprint 2: 새로운 수식)
 */
export function calculateUpgradeInfo(
  upgradeId: string,
  currentLevel: number
): UpgradeInfo {
  const config = getUpgradeConfig(upgradeId) as any;

  // 다음 레벨 비용 계산
  const nextCost = Math.floor(
    config.baseCost * Math.pow(config.costCurve, currentLevel)
  );

  // 다음 레벨 효과 계산 (perLevelDelta 사용)
  const nextEffect = config.baseValue + config.perLevelDelta * (currentLevel + 1);

  return {
    config,
    currentLevel,
    currentCost: nextCost,
    nextEffect,
  };
}

/**
 * 모든 업그레이드 정보 조회
 */
export function getAllUpgradeInfos(
  upgradeLevels: Record<string, number>
): UpgradeInfo[] {
  return balanceTables.upgrades.map((config) => {
    const currentLevel = upgradeLevels[config.upgradeId] || 0;
    return calculateUpgradeInfo(config.upgradeId, currentLevel);
  });
}

/**
 * 현재 스탯 계산 (업그레이드 반영)
 */
export function calculateStats(
  baseAtk: number,
  baseHp: number,
  upgradeLevels: Record<string, number>
): {
  atk: number;
  hp: number;
  attackSpeed: number;
  critChance: number;
  critDamage: number;
  offlineEfficiency: number;
} {
  const atkUpgrade = calculateUpgradeInfo('atk', upgradeLevels.atk || 0);
  const hpUpgrade = calculateUpgradeInfo('hp', upgradeLevels.hp || 0);
  const attackSpeedUpgrade = calculateUpgradeInfo('attackSpeed', upgradeLevels.attackSpeed || 0);
  const critChanceUpgrade = calculateUpgradeInfo('critChance', upgradeLevels.critChance || 0);
  const critDamageUpgrade = calculateUpgradeInfo('critDamage', upgradeLevels.critDamage || 0);
  const offlineEfficiencyUpgrade = calculateUpgradeInfo('offlineEfficiency', upgradeLevels.offlineEfficiency || 0);

  return {
    atk: baseAtk + (atkUpgrade.nextEffect - (getUpgradeConfig('atk') as any).baseValue),
    hp: baseHp + (hpUpgrade.nextEffect - (getUpgradeConfig('hp') as any).baseValue),
    attackSpeed: attackSpeedUpgrade.nextEffect,
    critChance: Math.min(critChanceUpgrade.nextEffect / 100, 1), // 0~1 범위
    critDamage: critDamageUpgrade.nextEffect,
    offlineEfficiency: offlineEfficiencyUpgrade.nextEffect,
  };
}

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
 * 오프라인 보상 계산 (고도화)
 */
export function calculateOfflineReward(
  lastSeenAt: number,
  currentStage: number,
  offlineEfficiency: number,
  currentTime: number = Date.now()
): number {
  const elapsedMs = currentTime - lastSeenAt;
  const elapsedSeconds = Math.floor(elapsedMs / 1000);

  const maxSeconds = balanceTables.offlineReward.maxOfflineSeconds;
  const cappedSeconds = Math.min(elapsedSeconds, maxSeconds);

  // 현재 스테이지의 기본 보상
  const stage = getStage(currentStage);
  const baseGoldPerMinute = stage.goldReward / 60; // 스테이지 보상을 분 단위로 환산

  // 오프라인 효율 적용
  const goldPerSecond = (baseGoldPerMinute / 60) * offlineEfficiency;
  const totalGold = Math.floor(cappedSeconds * goldPerSecond);

  return totalGold;
}

/**
 * 오프라인 보상 정보 (UI용)
 */
export function getOfflineRewardInfo(
  lastSeenAt: number,
  currentStage: number,
  offlineEfficiency: number,
  currentTime: number = Date.now()
): {
  elapsedMinutes: number;
  elapsedSeconds: number;
  totalGold: number;
  maxHours: number;
  cappedMinutes: number;
} {
  const elapsedMs = currentTime - lastSeenAt;
  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);

  const maxSeconds = balanceTables.offlineReward.maxOfflineSeconds;
  const cappedSeconds = Math.min(elapsedSeconds, maxSeconds);
  const cappedMinutes = Math.floor(cappedSeconds / 60);

  const totalGold = calculateOfflineReward(lastSeenAt, currentStage, offlineEfficiency, currentTime);

  return {
    elapsedMinutes,
    elapsedSeconds,
    totalGold,
    maxHours: maxSeconds / 3600,
    cappedMinutes,
  };
}

/**
 * 공격 간격 계산 (공격 속도 업그레이드 반영)
 */
export function calculateAttackInterval(baseInterval: number, attackSpeedLevel: number): number {
  const attackSpeedUpgrade = calculateUpgradeInfo('attackSpeed', attackSpeedLevel);
  // attackSpeed는 음수 delta를 가지므로 간격이 줄어듦
  return Math.max(100, baseInterval + (attackSpeedUpgrade.nextEffect - 300)); // 최소 100ms
}

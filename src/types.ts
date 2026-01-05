/**
 * 게임 상태 및 데이터 타입 정의
 */

// ============ SaveState ============
export interface SaveState {
  version: number;
  lastSeenAt: number; // timestamp
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
  // 누적 통계
  stats: {
    totalBattles: number;
    totalStagesCleared: number;
    highestStageReached: number;
  };
  // Sprint 3 추가
  fragments: number;
  companionShards: Record<string, number>;
  companionProgress: Record<string, CompanionProgress>;
  storyProgress: StoryProgress;
  // Sprint 4 추가
  cosmeticTokens: number;
  cosmeticProgress: Record<string, CosmeticProgress>;
  passProgress: PassProgress;
  adRewardCooldowns: Record<string, number>;
  remoteConfigVersion: string;
}

// ============ Stage & Battle ============
export interface Stage {
  stageId: number;
  name: string;
  monsterHp: number;
  goldReward: number;
  difficulty: number;
}

export interface BattleState {
  playerHp: number;
  playerMaxHp: number;
  playerAtk: number;
  monsterHp: number;
  monsterMaxHp: number;
  isWon: boolean;
  isLost: boolean;
  damageEvents: DamageEvent[];
  particleEffects: ParticleEffect[];
}

export interface DamageEvent {
  id: string;
  damage: number;
  x: number;
  y: number;
  createdAt: number;
  duration: number; // ms
}

export interface ParticleEffect {
  id: string;
  x: number;
  y: number;
  particles: Particle[];
  createdAt: number;
  duration: number; // ms
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 0~1
}

// ============ Upgrade ============
export interface UpgradeConfig {
  upgradeId: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  baseEffect: number;
  effectMultiplier: number;
  maxLevel: number;
}

export interface UpgradeInfo {
  config: UpgradeConfig;
  currentLevel: number;
  currentCost: number;
  nextEffect: number;
}

// ============ Story ============
export interface StoryScene {
  sceneId: number;
  text: string;
  character: string;
}

export interface StoryEpisode {
  episodeId: number;
  title: string;
  scenes: StoryScene[];
}

// ============ Character (Companion) ============
export interface Character {
  characterId: string;
  name: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  description: string;
  isLocked: boolean;
  unlockedAt: number | null;
  skills: string[];
}

// ============ Offline Reward ============
export interface OfflineRewardInfo {
  elapsedMinutes: number;
  totalGold: number;
  maxHours: number;
}

// ============ Quest & Achievement ============
export interface DailyQuestProgress {
  questId: string;
  currentProgress: number;
  isCompleted: boolean;
  isRewarded: boolean;
  resetTime: number; // timestamp
}

export interface AchievementProgress {
  achievementId: string;
  progress: number;
  isUnlocked: boolean;
  isRewarded: boolean;
  unlockedAt: number | null;
}

// ============ Tutorial ============
export interface TutorialState {
  completed: boolean;
  currentStep: number; // 0-3
  steps: string[];
}

// ============ Upgrade Config Extended ============
export interface UpgradeConfigExtended extends UpgradeConfig {
  baseValue: number;
  perLevelDelta: number;
  costCurve: number;
}

// ============ Story & Companion (Sprint 3) ============
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

// ============ Pass & Cosmetics (Sprint 4) ============
export interface PassProgress {
  seasonId: string;
  currentLevel: number;
  currentExp: number;
  isPremiumUnlocked: boolean;
  claimedFreeRewards: number[];
  claimedPremiumRewards: number[];
  unlockedAt: number | null;
}

export interface CosmeticProgress {
  cosmeticId: string;
  isOwned: boolean;
  isEquipped: boolean;
  ownedAt: number | null;
}

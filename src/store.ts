/**
 * Zustand 상태 관리
 * 게임의 모든 상태를 중앙에서 관리
 */

import { create } from 'zustand';
import { SaveState, BattleState, OfflineRewardInfo } from '@/types';
import { saveSaveState } from '@/features/save/persistence';

interface GameStore {
  // ========== 게임 상태 ==========
  saveState: SaveState;
  setSaveState: (state: SaveState) => void;
  updateSaveState: (partial: Partial<SaveState>) => void;

  // ========== 전투 상태 ==========
  battleState: BattleState | null;
  setBattleState: (state: BattleState | null) => void;
  updateBattleState: (partial: Partial<BattleState>) => void;

  // ========== 오프라인 보상 ==========
  offlineRewardInfo: OfflineRewardInfo | null;
  setOfflineRewardInfo: (info: OfflineRewardInfo | null) => void;

  // ========== 액션 ==========
  addGold: (amount: number) => void;
  buyUpgrade: (upgradeId: string, cost: number, effect: number) => void;
  claimOfflineReward: (gold: number) => void;
  advanceStage: () => void;
  persistGame: () => Promise<void>;
}

const createBattleState = (
  playerHp: number,
  playerMaxHp: number,
  playerAtk: number,
  monsterHp: number
): BattleState => ({
  playerHp,
  playerMaxHp,
  playerAtk,
  monsterHp,
  monsterMaxHp: monsterHp,
  isWon: false,
  isLost: false,
  damageEvents: [],
  particleEffects: [],
});

export const useGameStore = create<GameStore>((set, get) => ({
  // ========== 초기 상태 ==========
  saveState: {
    version: 1,
    lastSeenAt: Date.now(),
    currentStage: 1,
    gold: 0,
    hp: 100,
    atk: 5,
    upgradeLevels: {
      atk: 0,
      hp: 0,
    },
    offlineRewardClaimed: false,
  },
  battleState: null,
  offlineRewardInfo: null,

  // ========== Setters ==========
  setSaveState: (state: SaveState) => set({ saveState: state }),

  updateSaveState: (partial: Partial<SaveState>) =>
    set((state) => ({
      saveState: { ...state.saveState, ...partial },
    })),

  setBattleState: (state: BattleState | null) => set({ battleState: state }),

  updateBattleState: (partial: Partial<BattleState>) =>
    set((state) => {
      if (!state.battleState) return {};
      return {
        battleState: { ...state.battleState, ...partial },
      };
    }),

  setOfflineRewardInfo: (info: OfflineRewardInfo | null) =>
    set({ offlineRewardInfo: info }),

  // ========== 액션 ==========
  addGold: (amount: number) =>
    set((state) => ({
      saveState: {
        ...state.saveState,
        gold: state.saveState.gold + amount,
      },
    })),

  buyUpgrade: (upgradeId: string, cost: number, effect: number) =>
    set((state) => {
      const newGold = state.saveState.gold - cost;
      if (newGold < 0) return {};

      const newLevels = { ...state.saveState.upgradeLevels };
      const currentLevel = newLevels[upgradeId as keyof typeof newLevels] || 0;
      newLevels[upgradeId as keyof typeof newLevels] = currentLevel + 1;

      const newState = {
        ...state.saveState,
        gold: newGold,
        upgradeLevels: newLevels,
      };

      // 스탯 반영
      if (upgradeId === 'atk') {
        newState.atk += effect;
      } else if (upgradeId === 'hp') {
        newState.hp += effect;
      }

      return { saveState: newState };
    }),

  claimOfflineReward: (gold: number) =>
    set((state) => ({
      saveState: {
        ...state.saveState,
        gold: state.saveState.gold + gold,
        offlineRewardClaimed: true,
      },
      offlineRewardInfo: null,
    })),

  advanceStage: () =>
    set((state) => ({
      saveState: {
        ...state.saveState,
        currentStage: Math.min(state.saveState.currentStage + 1, 10),
      },
    })),

  persistGame: async () => {
    const state = get();
    await saveSaveState(state.saveState);
  },
}));

/**
 * 제작(Craft) 시스템
 * 동료 해금, 강화 재료 변환
 */

import companions from '@/data/characters.json';
import { CompanionProgress } from '@/types';

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
  craftTime: number; // 밀리초 (0 = 즉시)
}

/**
 * 기본 제작 레시피
 */
const CRAFT_RECIPES: CraftRecipe[] = [
  {
    recipeId: 'craft_dokkaebi_unlock',
    name: '도깨비 기술자 해금',
    description: '설화 파편 10개로 도깨비 기술자를 해금합니다',
    type: 'unlock',
    targetCompanionId: 'dokkaebi_engineer',
    cost: {
      fragments: 10,
    },
    reward: {
      companionId: 'dokkaebi_engineer',
    },
    craftTime: 0,
  },
  {
    recipeId: 'craft_jangseung_unlock',
    name: '장승 수문장 해금',
    description: '설화 파편 15개로 장승 수문장을 해금합니다',
    type: 'unlock',
    targetCompanionId: 'jangseung_guardian',
    cost: {
      fragments: 15,
    },
    reward: {
      companionId: 'jangseung_guardian',
    },
    craftTime: 0,
  },
  {
    recipeId: 'craft_haetae_unlock',
    name: '해태 감시자 해금',
    description: '설화 파편 20개로 해태 감시자를 해금합니다',
    type: 'unlock',
    targetCompanionId: 'haetae_guardian',
    cost: {
      fragments: 20,
    },
    reward: {
      companionId: 'haetae_guardian',
    },
    craftTime: 0,
  },
  {
    recipeId: 'craft_moonjeongshin_unlock',
    name: '문전신 수호 해금',
    description: '설화 파편 8개로 문전신 수호를 해금합니다',
    type: 'unlock',
    targetCompanionId: 'moonjeongshin_gatekeeper',
    cost: {
      fragments: 8,
    },
    reward: {
      companionId: 'moonjeongshin_gatekeeper',
    },
    craftTime: 0,
  },
];

/**
 * 제작 가능 여부 확인
 */
export function canCraft(
  recipe: CraftRecipe,
  currentFragments: number,
  companionShards: Record<string, number>
): boolean {
  if (recipe.cost.fragments && currentFragments < recipe.cost.fragments) {
    return false;
  }

  if (recipe.cost.companionShards) {
    for (const [companionId, requiredCount] of Object.entries(recipe.cost.companionShards)) {
      if ((companionShards[companionId] || 0) < requiredCount) {
        return false;
      }
    }
  }

  return true;
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
  // 비용 확인
  if (!canCraft(recipe, currentFragments, companionShards)) {
    return {
      success: false,
      message: '재료가 부족합니다',
    };
  }

  let updatedProgress = { ...companionProgress };
  let updatedFragments = currentFragments;
  let updatedShards = { ...companionShards };

  // 비용 소비
  if (recipe.cost.fragments) {
    updatedFragments -= recipe.cost.fragments;
  }

  if (recipe.cost.companionShards) {
    for (const [companionId, requiredCount] of Object.entries(recipe.cost.companionShards)) {
      updatedShards[companionId] = (updatedShards[companionId] || 0) - requiredCount;
    }
  }

  // 보상 지급
  if (recipe.type === 'unlock' && recipe.reward.companionId) {
    const companionId = recipe.reward.companionId;
    if (updatedProgress[companionId]) {
      updatedProgress[companionId] = {
        ...updatedProgress[companionId],
        isUnlocked: true,
        unlockedAt: Date.now(),
        level: 1,
      };
    }
  }

  return {
    success: true,
    updatedCompanionProgress: updatedProgress,
    updatedFragments,
    updatedCompanionShards: updatedShards,
    message: '제작 완료!',
  };
}

/**
 * 모든 제작 레시피 조회
 */
export function getAllCraftRecipes(): CraftRecipe[] {
  return CRAFT_RECIPES;
}

/**
 * 특정 동료 해금 레시피 조회
 */
export function getCompanionUnlockRecipe(companionId: string): CraftRecipe | null {
  return (
    CRAFT_RECIPES.find(
      (recipe) => recipe.type === 'unlock' && recipe.reward.companionId === companionId
    ) || null
  );
}

/**
 * 제작 가능한 레시피 목록
 */
export function getAvailableCraftRecipes(
  companionProgress: Record<string, CompanionProgress>,
  currentFragments: number,
  companionShards: Record<string, number>
): CraftRecipe[] {
  return CRAFT_RECIPES.filter((recipe) => {
    // 이미 해금된 동료는 제외
    if (
      recipe.type === 'unlock' &&
      recipe.reward.companionId &&
      companionProgress[recipe.reward.companionId]?.isUnlocked
    ) {
      return false;
    }

    // 비용 확인
    return canCraft(recipe, currentFragments, companionShards);
  });
}

/**
 * 게임 상태 저장/로드 (AsyncStorage 사용)
 * MMKV가 설치되지 않을 경우 AsyncStorage로 대체
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SaveState } from '@/types';
import { migrateToV3, getDefaultSaveStateV3 } from './migrationV3';

const SAVE_KEY = 'mythic_workshop_save';

export const defaultSaveState: SaveState = getDefaultSaveStateV3();

/**
 * 저장된 게임 상태 로드
 */
export async function loadSaveState(): Promise<SaveState> {
  try {
    const saved = await AsyncStorage.getItem(SAVE_KEY);
    if (!saved) {
      return defaultSaveState;
    }

    const parsed = JSON.parse(saved);
    const migrated = migrateToV3(parsed);

    if (parsed.version !== migrated.version) {
      console.log(`Migrated save from v${parsed.version} to v${migrated.version}`);
      // 자동으로 새 버전으로 저장
      await saveSaveState(migrated);
    }

    return migrated;
  } catch (error) {
    console.error('Failed to load save state:', error);
    return defaultSaveState;
  }
}

/**
 * 게임 상태 저장
 */
export async function saveSaveState(state: SaveState): Promise<void> {
  try {
    const toSave: SaveState = {
      ...state,
      lastSeenAt: Date.now(),
    };
    await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
  } catch (error) {
    console.error('Failed to save state:', error);
  }
}

/**
 * 저장 상태 초기화 (디버그용)
 */
export async function clearSaveState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SAVE_KEY);
  } catch (error) {
    console.error('Failed to clear save state:', error);
  }
}

/**
 * 메인 App 컴포넌트
 * 네비게이션 및 게임 상태 초기화
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useGameStore } from '@/store';
import { loadSaveState } from '@/features/save/persistence';
import { HomeScreen } from './screens/HomeScreen';
import { BattleScreen } from './screens/BattleScreen';
import { UpgradeScreen } from './screens/UpgradeScreen';

type Screen = 'home' | 'battle' | 'upgrade';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [isLoading, setIsLoading] = useState(true);

  const setSaveState = useGameStore((state) => state.setSaveState);
  const addGold = useGameStore((state) => state.addGold);
  const advanceStage = useGameStore((state) => state.advanceStage);
  const setBattleState = useGameStore((state) => state.setBattleState);
  const persistGame = useGameStore((state) => state.persistGame);

  // 게임 상태 로드
  useEffect(() => {
    const initializeGame = async () => {
      try {
        const savedState = await loadSaveState();
        setSaveState(savedState);
      } catch (error) {
        console.error('Failed to initialize game:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeGame();
  }, [setSaveState]);

  // 앱 백그라운드 진입 시 저장
  useEffect(() => {
    const handleAppBackground = () => {
      persistGame();
    };

    // 실제 환경에서는 AppState를 사용하여 감지
    // 여기서는 간단히 구현
    return () => {
      handleAppBackground();
    };
  }, [persistGame]);

  const handleStartBattle = () => {
    setCurrentScreen('battle');
  };

  const handleBattleEnd = async (won: boolean, goldReward: number) => {
    if (won) {
      addGold(goldReward);
      advanceStage();
    }
    setBattleState(null);
    await persistGame();
    setCurrentScreen('home');
  };

  const handleUpgrade = () => {
    setCurrentScreen('upgrade');
  };

  const handleBackFromUpgrade = () => {
    setCurrentScreen('home');
  };

  if (isLoading) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      {currentScreen === 'home' && (
        <HomeScreen
          onStartBattle={handleStartBattle}
          onUpgrade={handleUpgrade}
        />
      )}
      {currentScreen === 'battle' && (
        <BattleScreen onBattleEnd={handleBattleEnd} />
      )}
      {currentScreen === 'upgrade' && (
        <UpgradeScreen onBack={handleBackFromUpgrade} />
      )}
    </View>
  );
}

/**
 * Battle 화면 (Skia Canvas 기반 전투)
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
} from 'react-native';
import { useGameStore } from '@/store';
import { getStage } from '@/utils/balance';
import { BattleScene } from '@/features/battle/BattleScene';
import {
  initializeBattle,
  updateBattleLoop,
} from '@/features/battle/battleLoop';
import { Button } from '@/features/ui/Button';
import { colors, spacing, typography } from '@/features/ui/theme';

interface BattleScreenProps {
  onBattleEnd: (won: boolean, goldReward: number) => void;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  battleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  resultText: {
    ...typography.h1,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  resultDetails: {
    ...typography.body,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
});

export const BattleScreen: React.FC<BattleScreenProps> = ({ onBattleEnd }) => {
  const saveState = useGameStore((state) => state.saveState);
  const setBattleState = useGameStore((state) => state.setBattleState);
  const battleState = useGameStore((state) => state.battleState);

  const lastAttackTimeRef = useRef(Date.now());
  const [showResult, setShowResult] = useState(false);

  const currentStage = getStage(saveState.currentStage);

  // 전투 초기화
  useEffect(() => {
    if (!battleState) {
      const newBattleState = initializeBattle(
        saveState.hp,
        saveState.hp,
        saveState.atk,
        currentStage.monsterHp
      );
      setBattleState(newBattleState);
    }
  }, []);

  // 전투 루프
  const handleFrame = () => {
    if (!battleState) return;

    const { updatedState, lastAttackTime } = updateBattleLoop(
      battleState,
      saveState.atk,
      lastAttackTimeRef.current
    );

    lastAttackTimeRef.current = lastAttackTime;
    setBattleState(updatedState);

    // 전투 종료 체크
    if (updatedState.isWon || updatedState.isLost) {
      setShowResult(true);
    }
  };

  const handleContinue = () => {
    if (battleState?.isWon) {
      onBattleEnd(true, currentStage.goldReward);
    } else {
      onBattleEnd(false, 0);
    }
  };

  if (!battleState) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>전투 준비 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (showResult) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>
            {battleState.isWon ? '🎉 승리!' : '😢 패배...'}
          </Text>
          {battleState.isWon && (
            <Text style={styles.resultDetails}>
              골드 획득: +{currentStage.goldReward}
            </Text>
          )}
          <View style={styles.buttonContainer}>
            <Button
              title="계속하기"
              onPress={handleContinue}
              variant="primary"
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.battleContainer}>
        <BattleScene battleState={battleState} onFrame={handleFrame} />
      </View>
    </SafeAreaView>
  );
};

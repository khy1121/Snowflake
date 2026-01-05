/**
 * Upgrade 화면 (강화)
 * 업그레이드 카드 리스트 및 구매 버튼
 */

import React, { useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useGameStore } from '@/store';
import { getAllUpgradeInfos } from '@/utils/balance';
import { Button } from '@/features/ui/Button';
import { Card } from '@/features/ui/Card';
import { colors, spacing, typography, borderRadius } from '@/features/ui/theme';

interface UpgradeScreenProps {
  onBack: () => void;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textLight,
  },
  upgradeCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
  },
  upgradeCardAtk: {
    borderLeftColor: colors.atk,
  },
  upgradeCardHp: {
    borderLeftColor: colors.hp,
  },
  upgradeName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  upgradeDescription: {
    ...typography.small,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  upgradeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    ...typography.small,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.h3,
    color: colors.primary,
  },
  buttonContainer: {
    marginTop: spacing.md,
  },
  goldDisplay: {
    backgroundColor: colors.gold,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  goldText: {
    ...typography.h2,
    color: colors.text,
  },
});

export const UpgradeScreen: React.FC<UpgradeScreenProps> = ({ onBack }) => {
  const saveState = useGameStore((state) => state.saveState);
  const buyUpgrade = useGameStore((state) => state.buyUpgrade);
  const persistGame = useGameStore((state) => state.persistGame);

  const upgradeInfos = useMemo(
    () => getAllUpgradeInfos(saveState.upgradeLevels),
    [saveState.upgradeLevels]
  );

  const handleBuyUpgrade = async (upgradeId: string, cost: number, effect: number) => {
    if (saveState.gold < cost) {
      Alert.alert('골드 부족', '업그레이드를 구매할 골드가 부족합니다.');
      return;
    }

    buyUpgrade(upgradeId, cost, effect);
    await persistGame();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>💪 강화하기</Text>
          <Text style={styles.subtitle}>설화 파편을 강화해보세요</Text>
        </View>

        {/* 골드 표시 */}
        <View style={styles.goldDisplay}>
          <Text style={styles.goldText}>💰 {saveState.gold}</Text>
        </View>

        {/* 업그레이드 카드 */}
        {upgradeInfos.map((info) => {
          const cardStyle =
            info.config.upgradeId === 'atk'
              ? styles.upgradeCardAtk
              : styles.upgradeCardHp;

          const canAfford = saveState.gold >= info.currentCost;

          return (
            <View
              key={info.config.upgradeId}
              style={[styles.upgradeCard, cardStyle]}
            >
              <Text style={styles.upgradeName}>
                {info.config.upgradeId === 'atk' ? '⚔️' : '🛡️'}{' '}
                {info.config.name}
              </Text>
              <Text style={styles.upgradeDescription}>
                {info.config.description}
              </Text>

              <View style={styles.upgradeStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>현재 레벨</Text>
                  <Text style={styles.statValue}>{info.currentLevel}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>다음 효과</Text>
                  <Text style={styles.statValue}>+{info.nextEffect}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>비용</Text>
                  <Text
                    style={[
                      styles.statValue,
                      { color: canAfford ? colors.success : colors.danger },
                    ]}
                  >
                    {info.currentCost}
                  </Text>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  title={`구매 (${info.currentCost})`}
                  onPress={() =>
                    handleBuyUpgrade(
                      info.config.upgradeId,
                      info.currentCost,
                      info.nextEffect
                    )
                  }
                  variant={canAfford ? 'primary' : 'danger'}
                  disabled={!canAfford}
                />
              </View>
            </View>
          );
        })}

        {/* 뒤로가기 버튼 */}
        <Button
          title="← 돌아가기"
          onPress={onBack}
          variant="secondary"
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

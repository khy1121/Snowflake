/**
 * Home 화면 (정비소 허브)
 * 스테이지, 골드, 전투력 표시 및 전투 시작 버튼
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useGameStore } from '@/store';
import { getStage, getOfflineRewardInfo } from '@/utils/balance';
import { formatMinutes } from '@/utils/time';
import { Button } from '@/features/ui/Button';
import { Card } from '@/features/ui/Card';
import { colors, spacing, typography, borderRadius } from '@/features/ui/theme';
import { OfflineRewardInfo } from '@/types';

interface HomeScreenProps {
  onStartBattle: () => void;
  onUpgrade: () => void;
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
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    ...typography.small,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.h2,
    color: colors.primary,
  },
  stageCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  stageTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  stageInfo: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  offlineRewardCard: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  offlineRewardTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  offlineRewardText: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.md,
  },
  buttonContainer: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
});

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartBattle,
  onUpgrade,
}) => {
  const saveState = useGameStore((state) => state.saveState);
  const claimOfflineReward = useGameStore((state) => state.claimOfflineReward);
  const [offlineReward, setOfflineReward] = useState<OfflineRewardInfo | null>(
    null
  );

  const currentStage = getStage(saveState.currentStage);

  // 오프라인 보상 계산
  useEffect(() => {
    const reward = getOfflineRewardInfo(saveState.lastSeenAt);
    if (reward.totalGold > 0 && !saveState.offlineRewardClaimed) {
      setOfflineReward(reward);
    }
  }, [saveState.lastSeenAt, saveState.offlineRewardClaimed]);

  const handleClaimReward = () => {
    if (offlineReward) {
      claimOfflineReward(offlineReward.totalGold);
      setOfflineReward(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>⚙️ 설화 정비소</Text>
          <Text style={styles.subtitle}>망각상회에 맞서자!</Text>
        </View>

        {/* 스탯 카드 */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>골드</Text>
            <Text style={styles.statValue}>{saveState.gold}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>공격력</Text>
            <Text style={styles.statValue}>{saveState.atk}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>생명력</Text>
            <Text style={styles.statValue}>{saveState.hp}</Text>
          </View>
        </View>

        {/* 현재 스테이지 정보 */}
        <View style={styles.stageCard}>
          <Text style={styles.stageTitle}>
            🎯 {saveState.currentStage}. {currentStage.name}
          </Text>
          <Text style={styles.stageInfo}>
            몬스터 HP: {currentStage.monsterHp}
          </Text>
          <Text style={styles.stageInfo}>
            보상 골드: +{currentStage.goldReward}
          </Text>
        </View>

        {/* 오프라인 보상 */}
        {offlineReward && (
          <View style={styles.offlineRewardCard}>
            <Text style={styles.offlineRewardTitle}>
              ✨ 오프라인 보상이 있어요!
            </Text>
            <Text style={styles.offlineRewardText}>
              경과 시간: {formatMinutes(offlineReward.elapsedMinutes)}
            </Text>
            <Text style={styles.offlineRewardText}>
              획득 골드: +{offlineReward.totalGold}
            </Text>
            <Button
              title="수령하기"
              onPress={handleClaimReward}
              variant="primary"
            />
          </View>
        )}

        {/* 액션 버튼 */}
        <View style={styles.buttonContainer}>
          <Button
            title="⚔️ 전투 시작"
            onPress={onStartBattle}
            variant="primary"
          />
          <Button
            title="💪 강화하기"
            onPress={onUpgrade}
            variant="secondary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

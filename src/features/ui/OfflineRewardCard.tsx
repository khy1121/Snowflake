/**
 * 오프라인 보상 카드 (광고 Mock 포함)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from './theme';
import { Button } from './Button';
import { formatMinutes, formatNumber } from '@/utils/index';

interface OfflineRewardCardProps {
  elapsedMinutes: number;
  totalGold: number;
  maxHours: number;
  onClaim: () => void;
  onClaimWithAd: () => void;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.small,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  statLabel: {
    ...typography.small,
    color: colors.textLight,
  },
  statValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  buttonContainer: {
    gap: spacing.md,
  },
  adButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  adButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textInverse,
  },
  adLoadingContainer: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const OfflineRewardCard: React.FC<OfflineRewardCardProps> = ({
  elapsedMinutes,
  totalGold,
  maxHours,
  onClaim,
  onClaimWithAd,
}) => {
  const [isLoadingAd, setIsLoadingAd] = useState(false);

  const handleClaimWithAd = async () => {
    setIsLoadingAd(true);
    // Mock 광고 로딩 (1~2초)
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoadingAd(false);
    onClaimWithAd();
  };

  const isCapped = elapsedMinutes >= maxHours * 60;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>✨ 오프라인 보상이 있어요!</Text>
      <Text style={styles.subtitle}>
        {isCapped ? '최대 보상에 도달했어요' : '계속 일하고 있어요'}
      </Text>

      {/* 통계 */}
      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>경과 시간</Text>
          <Text style={styles.statValue}>{formatMinutes(elapsedMinutes)}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>최대 시간</Text>
          <Text style={styles.statValue}>{maxHours}시간</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>획득 골드</Text>
          <Text style={[styles.statValue, { color: colors.gold }]}>
            +{formatNumber(totalGold)}
          </Text>
        </View>
      </View>

      {/* 버튼 */}
      <View style={styles.buttonContainer}>
        <Button
          title={`수령하기 (+${formatNumber(totalGold)})`}
          onPress={onClaim}
          variant="primary"
        />

        {/* 광고 2배 수령 (Mock) */}
        {isLoadingAd ? (
          <View style={styles.adLoadingContainer}>
            <ActivityIndicator size="small" color={colors.textInverse} />
            <Text style={[styles.adButtonText, { marginTop: spacing.sm }]}>
              광고 로딩 중...
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.adButton}
            onPress={handleClaimWithAd}
          >
            <Text style={styles.adButtonText}>📺 2배 수령</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

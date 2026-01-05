/**
 * 튜토리얼 오버레이 (4단계)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from './theme';
import { Button } from './Button';

interface TutorialOverlayProps {
  visible: boolean;
  step: number; // 0-3
  onNext: () => void;
  onSkip: () => void;
}

const TUTORIAL_STEPS = [
  {
    title: '⚔️ 전투는 자동이야!',
    description: '전투 시작 버튼을 누르면 자동으로 진행돼요. 몬스터를 이기면 보상을 받을 수 있어요!',
    highlight: 'battle',
  },
  {
    title: '💰 이기면 골드를 줘!',
    description: '전투에서 승리하면 골드를 획득해요. 골드로 강화하거나 다른 것들을 업그레이드할 수 있어요!',
    highlight: 'reward',
  },
  {
    title: '💪 강화하면 더 쎄져!',
    description: '강화 화면에서 공격력, 생명력 등을 업그레이드할 수 있어요. 강해질수록 더 높은 스테이지에 도전할 수 있어요!',
    highlight: 'upgrade',
  },
  {
    title: '🌙 오프라인도 일해준다구~',
    description: '앱을 종료해도 설화 정비소는 계속 일해요. 다시 켜면 오프라인 보상을 받을 수 있어요!',
    highlight: 'offline',
  },
];

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    maxWidth: 400,
  },
  title: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
    lineHeight: 22,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textLight,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  buttonContainer: {
    gap: spacing.md,
  },
  skipButton: {
    padding: spacing.md,
    alignItems: 'center',
  },
  skipText: {
    ...typography.small,
    color: colors.textLight,
  },
});

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  visible,
  step,
  onNext,
  onSkip,
}) => {
  if (!visible || step >= TUTORIAL_STEPS.length) {
    return null;
  }

  const currentStep = TUTORIAL_STEPS[step];
  const isLastStep = step === TUTORIAL_STEPS.length - 1;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <SafeAreaView style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{currentStep.title}</Text>
          <Text style={styles.description}>{currentStep.description}</Text>

          {/* 단계 표시 */}
          <View style={styles.stepIndicator}>
            {TUTORIAL_STEPS.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  idx === step && styles.dotActive,
                ]}
              />
            ))}
          </View>

          {/* 버튼 */}
          <View style={styles.buttonContainer}>
            <Button
              title={isLastStep ? '시작하기' : '다음'}
              onPress={onNext}
              variant="primary"
            />
            <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
              <Text style={styles.skipText}>건너뛰기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

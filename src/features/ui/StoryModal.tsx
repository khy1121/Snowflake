/**
 * 스토리 모달 (에피소드 표시)
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

interface StoryModalProps {\n  visible: boolean;\n  episodeTitle: string;\n  speaker: string;\n  text: string;\n  icon?: string;\n  onNext: () => void;\n  onClose: () => void;\n}\n\nconst styles = StyleSheet.create({\n  overlay: {\n    flex: 1,\n    backgroundColor: 'rgba(0, 0, 0, 0.7)',\n    justifyContent: 'flex-end',\n  },\n  container: {\n    backgroundColor: colors.surface,\n    borderTopLeftRadius: borderRadius.xl,\n    borderTopRightRadius: borderRadius.xl,\n    padding: spacing.lg,\n    paddingBottom: spacing.xl,\n  },\n  header: {\n    marginBottom: spacing.md,\n  },\n  title: {\n    ...typography.h3,\n    color: colors.primary,\n    marginBottom: spacing.sm,\n  },\n  speaker: {\n    ...typography.small,\n    color: colors.textLight,\n  },\n  content: {\n    backgroundColor: 'rgba(255, 255, 255, 0.5)',\n    borderRadius: borderRadius.md,\n    padding: spacing.md,\n    marginBottom: spacing.lg,\n  },\n  text: {\n    ...typography.body,\n    color: colors.text,\n    lineHeight: 24,\n  },\n  iconContainer: {\n    width: 60,\n    height: 60,\n    borderRadius: 30,\n    backgroundColor: colors.accent,\n    justifyContent: 'center',\n    alignItems: 'center',\n    marginBottom: spacing.md,\n  },\n  icon: {\n    fontSize: 32,\n  },\n  buttonContainer: {\n    gap: spacing.md,\n    flexDirection: 'row',\n  },\n  nextButton: {\n    flex: 1,\n  },\n  closeButton: {\n    flex: 1,\n  },\n});\n\nexport const StoryModal: React.FC<StoryModalProps> = ({\n  visible,\n  episodeTitle,\n  speaker,\n  text,\n  icon,\n  onNext,\n  onClose,\n}) => {\n  return (\n    <Modal\n      visible={visible}\n      transparent\n      animationType=\"slide\"\n    >\n      <SafeAreaView style={styles.overlay}>\n        <View style={styles.container}>\n          {/* 아이콘 */}\n          {icon && (\n            <View style={styles.iconContainer}>\n              <Text style={styles.icon}>{icon}</Text>\n            </View>\n          )}\n\n          {/* 헤더 */}\n          <View style={styles.header}>\n            <Text style={styles.title}>{episodeTitle}</Text>\n            <Text style={styles.speaker}>— {speaker}</Text>\n          </View>\n\n          {/* 내용 */}\n          <View style={styles.content}>\n            <Text style={styles.text}>{text}</Text>\n          </View>\n\n          {/* 버튼 */}\n          <View style={styles.buttonContainer}>\n            <View style={styles.nextButton}>\n              <Button\n                title=\"다음\"\n                onPress={onNext}\n                variant=\"primary\"\n              />\n            </View>\n            <View style={styles.closeButton}>\n              <Button\n                title=\"닫기\"\n                onPress={onClose}\n                variant=\"secondary\"\n              />\n            </View>\n          </View>\n        </View>\n      </SafeAreaView>\n    </Modal>\n  );\n};\n

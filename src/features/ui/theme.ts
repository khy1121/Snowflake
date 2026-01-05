/**
 * 게임 UI 테마 (귀엽고 가벼운 톤)
 */

export const colors = {
  // 주요 색상
  primary: '#6B5FFF', // 보라색 (마법)
  secondary: '#FF6B9D', // 분홍색 (귀여움)
  accent: '#FFD93D', // 노랑색 (강조)

  // 배경
  background: '#F8F6FF', // 밝은 보라
  surface: '#FFFFFF', // 흰색

  // 텍스트
  text: '#2D2D2D', // 어두운 회색
  textLight: '#7A7A7A', // 밝은 회색
  textInverse: '#FFFFFF', // 흰색

  // 상태
  success: '#4CAF50', // 초록색
  warning: '#FF9800', // 주황색
  danger: '#F44336', // 빨강색
  info: '#2196F3', // 파랑색

  // 게임 특화
  gold: '#FFD700', // 금색
  hp: '#FF6B6B', // 빨강색
  atk: '#FF9500', // 주황색
  defense: '#4ECDC4', // 청록색
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
};

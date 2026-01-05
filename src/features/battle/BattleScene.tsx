/**
 * Skia Canvas를 사용한 전투 화면
 * 플레이어, 몬스터, 데미지 숫자, 파티클 효과 렌더링
 */

import React, { useEffect, useState } from 'react';
import {
  Canvas,
  Circle,
  Text,
  Group,
  Rect,
  Paint,
  Skia,
} from '@shopify/react-native-skia';
import { Dimensions } from 'react-native';
import { BattleState, DamageEvent, ParticleEffect } from '@/types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface BattleSceneProps {
  battleState: BattleState;
  onFrame?: (deltaTime: number) => void;
}

/**
 * 데미지 숫자 컴포넌트 (위로 이동 + 페이드)
 */
const DamageNumber: React.FC<{
  event: DamageEvent;
  currentTime: number;
}> = ({ event, currentTime }) => {
  const elapsed = currentTime - event.createdAt;
  const progress = Math.min(elapsed / event.duration, 1);

  // 위로 이동
  const offsetY = progress * 50;
  // 페이드 아웃
  const opacity = Math.max(0, 1 - progress);

  return (
    <Group
      opacity={opacity}
      transform={[{ translateY: -offsetY }]}
    >
      <Text
        x={event.x}
        y={event.y}
        text={`-${event.damage}`}
        font={{
          size: 24,
          familyName: 'System',
        }}
        color="rgb(255, 100, 100)"
      />
    </Group>
  );
};

/**
 * 파티클 효과 컴포넌트
 */
const ParticleEffectComponent: React.FC<{
  effect: ParticleEffect;
  currentTime: number;
}> = ({ effect, currentTime }) => {
  const elapsed = currentTime - effect.createdAt;
  const progress = Math.min(elapsed / effect.duration, 1);

  return (
    <Group>
      {effect.particles.map((particle, idx) => {
        const life = Math.max(0, 1 - progress);
        const x = particle.x + particle.vx * elapsed * 0.1;
        const y = particle.y + particle.vy * elapsed * 0.1;

        return (
          <Circle
            key={idx}
            cx={x}
            cy={y}
            r={3}
            color={`rgba(255, 200, 100, ${life * 0.8})`}
          />
        );
      })}
    </Group>
  );
};

/**
 * 플레이어 캐릭터 렌더링 (원형)
 */
const PlayerCharacter: React.FC<{
  hp: number;
  maxHp: number;
}> = ({ hp, maxHp }) => {
  const playerX = screenWidth * 0.25;
  const playerY = screenHeight * 0.5;
  const playerRadius = 40;

  const hpPercent = Math.max(0, hp / maxHp);
  const hpColor = hpPercent > 0.5 ? 'rgb(100, 200, 100)' : 'rgb(255, 100, 100)';

  return (
    <Group>
      {/* 배경 원 */}
      <Circle
        cx={playerX}
        cy={playerY}
        r={playerRadius}
        color="rgba(200, 200, 200, 0.3)"
      />
      {/* HP 바 (원 주변) */}
      <Circle
        cx={playerX}
        cy={playerY}
        r={playerRadius + 5}
        color="transparent"
        strokeColor={hpColor}
        strokeWidth={4}
        opacity={hpPercent}
      />
      {/* 플레이어 원 */}
      <Circle
        cx={playerX}
        cy={playerY}
        r={playerRadius}
        color="rgb(100, 150, 255)"
      />
      {/* HP 텍스트 */}
      <Text
        x={playerX - 20}
        y={playerY - 10}
        text={`${Math.ceil(hp)}`}
        font={{
          size: 16,
          familyName: 'System',
        }}
        color="white"
      />
    </Group>
  );
};

/**
 * 몬스터 캐릭터 렌더링 (사각형)
 */
const MonsterCharacter: React.FC<{
  hp: number;
  maxHp: number;
}> = ({ hp, maxHp }) => {
  const monsterX = screenWidth * 0.75;
  const monsterY = screenHeight * 0.5;
  const monsterSize = 60;

  const hpPercent = Math.max(0, hp / maxHp);
  const hpColor = hpPercent > 0.5 ? 'rgb(100, 200, 100)' : 'rgb(255, 100, 100)';

  return (
    <Group>
      {/* 배경 사각형 */}
      <Rect
        x={monsterX - monsterSize / 2}
        y={monsterY - monsterSize / 2}
        width={monsterSize}
        height={monsterSize}
        color="rgba(150, 100, 150, 0.3)"
      />
      {/* HP 바 */}
      <Rect
        x={monsterX - monsterSize / 2 - 5}
        y={monsterY - monsterSize / 2 - 5}
        width={monsterSize + 10}
        height={monsterSize + 10}
        color="transparent"
        strokeColor={hpColor}
        strokeWidth={4}
        opacity={hpPercent}
      />
      {/* 몬스터 사각형 */}
      <Rect
        x={monsterX - monsterSize / 2}
        y={monsterY - monsterSize / 2}
        width={monsterSize}
        height={monsterSize}
        color="rgb(200, 100, 100)"
      />
      {/* HP 텍스트 */}
      <Text
        x={monsterX - 20}
        y={monsterY - 10}
        text={`${Math.ceil(hp)}`}
        font={{
          size: 16,
          familyName: 'System',
        }}
        color="white"
      />
    </Group>
  );
};

/**
 * 메인 BattleScene 컴포넌트
 */
export const BattleScene: React.FC<BattleSceneProps> = ({
  battleState,
  onFrame,
}) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const newTime = Date.now();
      setCurrentTime(newTime);
      onFrame?.(newTime - currentTime);
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [currentTime, onFrame]);

  // 활성 데미지 이벤트 필터링
  const activeDamageEvents = battleState.damageEvents.filter(
    (event) => currentTime - event.createdAt < event.duration
  );

  // 활성 파티클 이펙트 필터링
  const activeParticleEffects = battleState.particleEffects.filter(
    (effect) => currentTime - effect.createdAt < effect.duration
  );

  return (
    <Canvas style={{ width: screenWidth, height: screenHeight }}>
      {/* 배경 */}
      <Rect
        x={0}
        y={0}
        width={screenWidth}
        height={screenHeight}
        color="rgb(240, 240, 250)"
      />

      {/* 플레이어 */}
      <PlayerCharacter
        hp={battleState.playerHp}
        maxHp={battleState.playerMaxHp}
      />

      {/* 몬스터 */}
      <MonsterCharacter
        hp={battleState.monsterHp}
        maxHp={battleState.monsterMaxHp}
      />

      {/* 데미지 숫자 */}
      {activeDamageEvents.map((event) => (
        <DamageNumber
          key={event.id}
          event={event}
          currentTime={currentTime}
        />
      ))}

      {/* 파티클 효과 */}
      {activeParticleEffects.map((effect) => (
        <ParticleEffectComponent
          key={effect.id}
          effect={effect}
          currentTime={currentTime}
        />
      ))}

      {/* 상태 텍스트 */}
      {battleState.isWon && (
        <Text
          x={screenWidth / 2 - 50}
          y={screenHeight * 0.2}
          text="승리! 🎉"
          font={{
            size: 32,
            familyName: 'System',
          }}
          color="rgb(100, 200, 100)"
        />
      )}

      {battleState.isLost && (
        <Text
          x={screenWidth / 2 - 50}
          y={screenHeight * 0.2}
          text="패배..."
          font={{
            size: 32,
            familyName: 'System',
          }}
          color="rgb(255, 100, 100)"
        />
      )}
    </Canvas>
  );
};

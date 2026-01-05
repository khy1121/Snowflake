/**
 * 자동 전투 루프 로직
 * 일정 간격으로 데미지를 주고, 파티클 효과를 생성
 */

import { BattleState, DamageEvent, ParticleEffect, Particle } from '@/types';
import { v4 as uuidv4 } from 'crypto';

const ATTACK_INTERVAL = 300; // ms
const DAMAGE_DURATION = 800; // ms
const PARTICLE_DURATION = 600; // ms
const PARTICLE_COUNT = 8;

/**
 * 파티클 효과 생성
 */
function createParticleEffect(x: number, y: number): ParticleEffect {
  const particles: Particle[] = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
    const speed = 100 + Math.random() * 100;

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
    });
  }

  return {
    id: uuidv4(),
    x,
    y,
    particles,
    createdAt: Date.now(),
    duration: PARTICLE_DURATION,
  };
}

/**
 * 데미지 이벤트 생성
 */
function createDamageEvent(
  damage: number,
  x: number,
  y: number
): DamageEvent {
  return {
    id: uuidv4(),
    damage,
    x,
    y,
    createdAt: Date.now(),
    duration: DAMAGE_DURATION,
  };
}

/**
 * 전투 루프 업데이트
 * 매 프레임마다 호출되어 전투 상태를 업데이트
 */
export function updateBattleLoop(
  battleState: BattleState,
  playerAtk: number,
  lastAttackTime: number
): {
  updatedState: BattleState;
  lastAttackTime: number;
} {
  const now = Date.now();
  let updatedState = { ...battleState };

  // 이미 끝난 전투는 업데이트 하지 않음
  if (battleState.isWon || battleState.isLost) {
    return { updatedState, lastAttackTime };
  }

  // 공격 간격 체크
  if (now - lastAttackTime >= ATTACK_INTERVAL) {
    const damage = playerAtk;
    const newMonsterHp = battleState.monsterHp - damage;

    // 데미지 이벤트 추가 (몬스터 위치에서 표시)
    const monsterX = 300; // 화면 우측 (BattleScene의 monsterX 참조)
    const damageEvent = createDamageEvent(damage, monsterX, 150);

    // 파티클 효과 추가
    const particleEffect = createParticleEffect(monsterX, 150);

    updatedState = {
      ...updatedState,
      monsterHp: Math.max(0, newMonsterHp),
      damageEvents: [...updatedState.damageEvents, damageEvent],
      particleEffects: [...updatedState.particleEffects, particleEffect],
    };

    // 몬스터 HP가 0 이하면 승리
    if (newMonsterHp <= 0) {
      updatedState.isWon = true;
    }

    return { updatedState, lastAttackTime: now };
  }

  return { updatedState, lastAttackTime };
}

/**
 * 전투 초기화
 */
export function initializeBattle(
  playerHp: number,
  playerMaxHp: number,
  playerAtk: number,
  monsterHp: number
): BattleState {
  return {
    playerHp,
    playerMaxHp,
    playerAtk,
    monsterHp,
    monsterMaxHp: monsterHp,
    isWon: false,
    isLost: false,
    damageEvents: [],
    particleEffects: [],
  };
}

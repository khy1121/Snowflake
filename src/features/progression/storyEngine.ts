/**
 * 스토리(Story) 엔진
 * 에피소드 트리거, 로그, 진행도 관리
 */

import storyData from '@/data/storyEpisodes.json';
import { StoryProgress } from '@/types';

/**
 * 스토리 초기화
 */
export function initializeStoryProgress(): StoryProgress {
  return {
    currentChapter: 1,
    currentEpisode: 0,
    viewedEpisodes: [],
  };
}

/**
 * 에피소드 트리거 확인 (스테이지 클리어 시)
 */
export function checkEpisodeTrigger(
  stageId: number,
  achievementId?: string,
  questId?: string
): { episodeId: number; chapterId: number } | null {
  for (const chapter of storyData.chapters) {
    for (const episode of chapter.episodes) {
      if (episode.trigger.type === 'stage' && episode.trigger.value === stageId) {
        return { episodeId: episode.episodeId, chapterId: chapter.chapterId };
      }
      // 추후 achievement, quest 트리거 추가 가능
    }
  }

  return null;
}

/**
 * 에피소드 데이터 조회
 */
export function getEpisodeData(episodeId: number) {
  for (const chapter of storyData.chapters) {
    const episode = chapter.episodes.find((e) => e.episodeId === episodeId);
    if (episode) {
      return { ...episode, chapterId: chapter.chapterId };
    }
  }

  return null;
}

/**
 * 챕터 데이터 조회
 */
export function getChapterData(chapterId: number) {
  return storyData.chapters.find((c) => c.chapterId === chapterId);
}

/**
 * 에피소드 시청 기록
 */
export function markEpisodeAsViewed(
  progress: StoryProgress,
  episodeId: number
): StoryProgress {
  if (!progress.viewedEpisodes.includes(episodeId)) {
    return {
      ...progress,
      viewedEpisodes: [...progress.viewedEpisodes, episodeId],
    };
  }

  return progress;
}

/**
 * 에피소드 보상 계산
 */
export function getEpisodeReward(episodeId: number) {
  const episode = getEpisodeData(episodeId);
  if (!episode) {
    return null;
  }

  return {
    gold: episode.reward.gold || 0,
    fragments: episode.reward.fragments || 0,
    companionShards: episode.reward.companionShard || {},
  };
}

/**
 * 모든 에피소드 조회
 */
export function getAllEpisodes() {
  const episodes = [];
  for (const chapter of storyData.chapters) {
    for (const episode of chapter.episodes) {
      episodes.push({
        ...episode,
        chapterId: chapter.chapterId,
      });
    }
  }
  return episodes;
}

/**
 * 챕터별 에피소드 조회
 */
export function getChapterEpisodes(chapterId: number) {
  const chapter = getChapterData(chapterId);
  if (!chapter) {
    return [];
  }

  return chapter.episodes.map((episode) => ({
    ...episode,
    chapterId,
  }));
}

/**
 * 다음 챕터 진행
 */
export function advanceChapter(progress: StoryProgress): StoryProgress {
  const maxChapter = storyData.chapters.length;

  if (progress.currentChapter < maxChapter) {
    return {
      ...progress,
      currentChapter: progress.currentChapter + 1,
      currentEpisode: 0,
    };
  }

  return progress;
}

/**
 * 챕터 클리어 확인
 */
export function isChapterComplete(
  progress: StoryProgress,
  chapterId: number
): boolean {
  const chapter = getChapterData(chapterId);
  if (!chapter) {
    return false;
  }

  // 모든 에피소드가 시청되었는지 확인
  return chapter.episodes.every((episode) =>
    progress.viewedEpisodes.includes(episode.episodeId)
  );
}

/**
 * 전체 진행률 계산
 */
export function getStoryProgress(progress: StoryProgress): number {
  const totalEpisodes = getAllEpisodes().length;
  const viewedCount = progress.viewedEpisodes.length;

  return totalEpisodes > 0 ? (viewedCount / totalEpisodes) * 100 : 0;
}

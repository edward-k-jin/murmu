import type { MoodCode } from '@/types/groups';

export const moods: { code: MoodCode; emoji: string; label: string }[] = [
  { code: 'calm', emoji: '😌', label: '차분해' },
  { code: 'happy', emoji: '😊', label: '좋아' },
  { code: 'hopeful', emoji: '🌱', label: '기대돼' },
  { code: 'tired', emoji: '😮‍💨', label: '지쳤어' },
  { code: 'sad', emoji: '😔', label: '속상해' },
];

export function getMood(code: MoodCode) {
  return moods.find((mood) => mood.code === code) ?? moods[0];
}

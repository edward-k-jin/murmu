import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ScreenShell } from '@/components/screen-shell';
import { TextField } from '@/components/text-field';
import { moods } from '@/constants/moods';
import { colors, radius, spacing, typography } from '@/design/tokens';
import { createRequestId } from '@/lib/uuid';
import { useGroups } from '@/providers/group-provider';
import { createMonologue, getScheduledMonologue, updateScheduledMonologue } from '@/services/group-service';
import type { MoodCode } from '@/types/groups';

export default function ComposeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ monologueId?: string }>();
  const monologueId = typeof params.monologueId === 'string' ? params.monologueId : undefined;
  const { selectedGroup } = useGroups();
  const [requestId] = useState(() => createRequestId());
  const [moodOverride, setMoodOverride] = useState<MoodCode | null>(null);
  const [bodyOverride, setBodyOverride] = useState<string | null>(null);
  const [mode, setMode] = useState<'immediate' | 'scheduled'>('immediate');
  const [scheduledOverride, setScheduledOverride] = useState<string | null>(null);
  const [defaultScheduledInput] = useState(() => formatInput(new Date(Date.now() + 24 * 60 * 60 * 1000)));
  const [error, setError] = useState<string | null>(null);
  const scheduledQuery = useQuery({
    queryKey: ['scheduled-monologue', monologueId],
    queryFn: () => getScheduledMonologue(monologueId!),
    enabled: Boolean(monologueId),
  });

  const moodCode = moodOverride ?? scheduledQuery.data?.moodCode ?? 'calm';
  const body = bodyOverride ?? scheduledQuery.data?.body ?? '';
  const publishMode = monologueId ? 'scheduled' : mode;
  const scheduledInput = scheduledOverride
    ?? (scheduledQuery.data ? formatInput(new Date(scheduledQuery.data.scheduledFor)) : defaultScheduledInput);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedGroup) throw new Error('GROUP_REQUIRED');
      const cleanBody = body.trim();
      if (!cleanBody || cleanBody.length > 10000) throw new Error('BODY_INVALID');
      const scheduledFor = publishMode === 'scheduled' ? parseInput(scheduledInput) : null;
      if (publishMode === 'scheduled' && (!scheduledFor || scheduledFor.getTime() <= Date.now())) throw new Error('DATE_INVALID');
      if (monologueId) {
        await updateScheduledMonologue(monologueId, moodCode, cleanBody, scheduledFor!.toISOString());
        return;
      }
      await createMonologue({
        groupId: selectedGroup.id,
        clientRequestId: requestId,
        moodCode,
        body: cleanBody,
        publishMode,
        scheduledFor: scheduledFor?.toISOString() ?? null,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['group-feed', selectedGroup?.id] });
      router.replace('/groups/monologues' as Href);
    },
    onError: (nextError) => {
      setError(nextError.message === 'DATE_INVALID' ? '현재보다 뒤의 시간을 YYYY-MM-DD HH:mm 형식으로 입력해주세요.' : '내용과 공개 시간을 다시 확인해주세요.');
    },
  });

  return (
    <ScreenShell footer={<PrimaryButton label={monologueId ? '예약 수정하기' : publishMode === 'immediate' ? '지금 공개하기' : '예약하기'} loading={saveMutation.isPending} onPress={() => { setError(null); saveMutation.mutate(); }} />}>
      <View style={styles.header}><Pressable onPress={() => router.back()}><Text style={styles.back}>‹ 돌아가기</Text></Pressable><Text style={styles.title}>{monologueId ? '예약한 혼잣말 수정' : '혼잣말 남기기'}</Text><Text style={styles.body}>지금은 나에게 말하듯 편하게 적어도 괜찮아요.</Text></View>
      <Text style={styles.label}>지금 기분</Text>
      <View style={styles.moods}>{moods.map((mood) => <Pressable key={mood.code} onPress={() => setMoodOverride(mood.code)} style={[styles.mood, moodCode === mood.code && styles.moodSelected]}><Text style={styles.emoji}>{mood.emoji}</Text><Text style={styles.moodText}>{mood.label}</Text></Pressable>)}</View>
      <View style={styles.editor}><Text style={styles.label}>혼잣말</Text><TextInput accessibilityLabel="혼잣말" maxLength={10000} multiline onChangeText={setBodyOverride} placeholder="오늘 마음에 남은 일을 적어보세요." placeholderTextColor={colors.muted} style={styles.textarea} textAlignVertical="top" value={body} /><Text style={styles.count}>{body.length} / 10,000</Text></View>
      {!monologueId ? <View style={styles.modeRow}><Pressable onPress={() => setMode('immediate')} style={[styles.mode, mode === 'immediate' && styles.modeSelected]}><Text style={styles.modeTitle}>지금 공개</Text><Text style={styles.modeBody}>상대에게 바로 보여요</Text></Pressable><Pressable onPress={() => setMode('scheduled')} style={[styles.mode, mode === 'scheduled' && styles.modeSelected]}><Text style={styles.modeTitle}>나중에 공개</Text><Text style={styles.modeBody}>정한 시간까지 잠겨요</Text></Pressable></View> : null}
      {publishMode === 'scheduled' ? <TextField autoCapitalize="none" label="공개 시간" onChangeText={setScheduledOverride} placeholder="2026-06-15 21:30" value={scheduledInput} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </ScreenShell>
  );
}

function parseInput(value: string) {
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/);
  if (!match) return null;
  const [, year, month, day, hour, minute] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatInput(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.md, gap: spacing.sm },
  back: { ...typography.label, color: colors.primary },
  title: { ...typography.titleLarge, color: colors.ink },
  body: { ...typography.body, color: colors.body },
  label: { ...typography.label, color: colors.ink, marginTop: spacing.xl },
  moods: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  mood: { minWidth: 80, alignItems: 'center', padding: spacing.sm, borderRadius: radius.card, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.surface },
  moodSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  emoji: { fontSize: 22 },
  moodText: { ...typography.caption, color: colors.body },
  editor: { gap: spacing.sm },
  textarea: { minHeight: 180, padding: spacing.base, borderRadius: radius.card, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.surface, ...typography.body, color: colors.ink },
  count: { ...typography.caption, color: colors.muted, textAlign: 'right' },
  modeRow: { flexDirection: 'row', gap: spacing.md, marginVertical: spacing.xl },
  mode: { flex: 1, padding: spacing.base, gap: spacing.xs, borderRadius: radius.card, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.surface },
  modeSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  modeTitle: { ...typography.label, color: colors.ink },
  modeBody: { ...typography.caption, color: colors.muted },
  error: { ...typography.bodySmall, color: colors.danger, marginTop: spacing.md },
});

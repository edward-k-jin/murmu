import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ScreenShell } from '@/components/screen-shell';
import { moods } from '@/constants/moods';
import { colors, radius, spacing, typography } from '@/design/tokens';
import { createRequestId } from '@/lib/uuid';
import { useGroups } from '@/providers/group-provider';
import { createMonologue, getScheduledMonologue, updateScheduledMonologue } from '@/services/group-service';
import type { MoodCode } from '@/types/groups';

const MAX_SCHEDULE_DAYS = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

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
  const [scheduleSheetVisible, setScheduleSheetVisible] = useState(false);
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
  const scheduledDate = parseInput(scheduledInput) ?? parseInput(defaultScheduledInput)!;

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedGroup) throw new Error('GROUP_REQUIRED');
      const cleanBody = body.trim();
      if (!cleanBody || cleanBody.length > 10000) throw new Error('BODY_INVALID');
      const scheduledFor = publishMode === 'scheduled' ? parseInput(scheduledInput) : null;
      const maxScheduledAt = Date.now() + MAX_SCHEDULE_DAYS * MS_PER_DAY;
      if (publishMode === 'scheduled') {
        if (!scheduledFor || scheduledFor.getTime() <= Date.now()) throw new Error('DATE_INVALID');
        if (scheduledFor.getTime() > maxScheduledAt) throw new Error('DATE_TOO_FAR');
      }
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
      setError(
        nextError.message === 'DATE_INVALID'
          ? '현재보다 뒤의 시간을 골라주세요.'
          : nextError.message === 'DATE_TOO_FAR'
            ? '공개 시간은 최대 7일 뒤까지만 정할 수 있어요.'
            : '내용과 공개 시간을 다시 확인해주세요.',
      );
    },
  });

  return (
    <ScreenShell footer={<PrimaryButton label={monologueId ? '예약 수정하기' : publishMode === 'immediate' ? '지금 공개하기' : '예약하기'} loading={saveMutation.isPending} onPress={() => { setError(null); saveMutation.mutate(); }} />}>
      <View style={styles.header}><Pressable onPress={() => router.back()}><Text style={styles.back}>‹ 돌아가기</Text></Pressable><Text style={styles.title}>{monologueId ? '예약한 혼잣말 수정' : '혼잣말 남기기'}</Text><Text style={styles.body}>지금은 나에게 말하듯 편하게 적어도 괜찮아요.</Text></View>
      <Text style={styles.label}>지금 기분</Text>
      <View style={styles.moods}>{moods.map((mood) => <Pressable key={mood.code} onPress={() => setMoodOverride(mood.code)} style={[styles.mood, moodCode === mood.code && styles.moodSelected]}><Text style={styles.emoji}>{mood.emoji}</Text><Text style={styles.moodText}>{mood.label}</Text></Pressable>)}</View>
      <View style={styles.editor}><Text style={styles.label}>혼잣말</Text><TextInput accessibilityLabel="혼잣말" maxLength={10000} multiline onChangeText={setBodyOverride} placeholder="오늘 마음에 남은 일을 적어보세요." placeholderTextColor={colors.muted} style={styles.textarea} textAlignVertical="top" value={body} /><Text style={styles.count}>{body.length} / 10,000</Text></View>
      {!monologueId ? (
        <View style={styles.modeRow}>
          <Pressable
            accessibilityLabel="지금 공개, 상대에게 바로 보여요"
            accessibilityRole="button"
            accessibilityState={{ selected: mode === 'immediate' }}
            onPress={() => setMode('immediate')}
            style={[styles.mode, mode === 'immediate' && styles.modeSelected]}>
            <Text style={styles.modeTitle}>지금 공개</Text>
            <Text style={styles.modeBody}>상대에게 바로 보여요</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="나중에 공개, 정한 시간까지 잠겨요"
            accessibilityRole="button"
            accessibilityState={{ selected: mode === 'scheduled' }}
            onPress={() => setMode('scheduled')}
            style={[styles.mode, mode === 'scheduled' && styles.modeSelected]}>
            <Text style={styles.modeTitle}>나중에 공개</Text>
            <Text style={styles.modeBody}>정한 시간까지 잠겨요</Text>
          </Pressable>
        </View>
      ) : null}
      {publishMode === 'scheduled' ? (
        <View>
          <Text style={styles.label}>공개 시간</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setScheduleSheetVisible(true)}
            style={({ pressed }) => [styles.scheduleField, pressed && styles.scheduleFieldPressed]}>
            <View>
              <Text style={styles.scheduleValue}>{formatScheduleDisplay(scheduledInput)}</Text>
              <Text style={styles.scheduleHint}>앞으로 7일 안에서, 마음이 정리될 만큼만 잠가둘 수 있어요.</Text>
            </View>
            <Text style={styles.scheduleChevron}>›</Text>
          </Pressable>
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.composeBottomSpace} />
      {scheduleSheetVisible ? (
        <SchedulePickerSheet
          initialDate={scheduledDate}
          onClose={() => setScheduleSheetVisible(false)}
          onConfirm={(date) => {
            setScheduledOverride(formatInput(date));
            setScheduleSheetVisible(false);
          }}
        />
      ) : null}
    </ScreenShell>
  );
}

type SchedulePickerSheetProps = {
  initialDate: Date;
  onClose: () => void;
  onConfirm: (date: Date) => void;
};

const hourOptions = Array.from({ length: 24 }, (_, hour) => hour);
const minuteOptions = [0, 15, 30, 45];

function SchedulePickerSheet({ initialDate, onClose, onConfirm }: SchedulePickerSheetProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [dateOptions] = useState(() => createDateOptions(new Date()));

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible>
      <Pressable accessibilityRole="button" onPress={onClose} style={styles.sheetBackdrop} />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <View>
            <Text style={styles.sheetEyebrow}>나중에 공개</Text>
            <Text style={styles.sheetTitle}>언제 보여줄까요?</Text>
            <Text style={styles.sheetBody}>너무 오래 묻어두지 않도록 공개 시간은 앞으로 7일 안에서만 정할 수 있어요.</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>닫기</Text>
          </Pressable>
        </View>

        <Text style={styles.sheetLabel}>날짜</Text>
        <ScrollView contentContainerStyle={styles.optionRow} horizontal showsHorizontalScrollIndicator={false}>
          {dateOptions.map((option) => {
            const selected = isSameLocalDay(selectedDate, option.date);
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={option.value}
                onPress={() => setSelectedDate(mergeDate(selectedDate, option.date))}
                style={[styles.dateOption, selected && styles.optionSelected]}>
                <Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>{option.label}</Text>
                <Text style={[styles.optionBody, selected && styles.optionBodySelected]}>{option.body}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.sheetLabel}>시간</Text>
        <ScrollView contentContainerStyle={styles.optionRow} horizontal showsHorizontalScrollIndicator={false}>
          {hourOptions.map((hour) => {
            const selected = selectedDate.getHours() === hour;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={hour}
                onPress={() => setSelectedDate(setTimePart(selectedDate, hour, selectedDate.getMinutes()))}
                style={[styles.timeOption, selected && styles.optionSelected]}>
                <Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>{formatHour(hour)}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.sheetLabel}>분</Text>
        <View style={styles.minuteRow}>
          {minuteOptions.map((minute) => {
            const selected = selectedDate.getMinutes() === minute;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={minute}
                onPress={() => setSelectedDate(setTimePart(selectedDate, selectedDate.getHours(), minute))}
                style={[styles.minuteOption, selected && styles.optionSelected]}>
                <Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>{String(minute).padStart(2, '0')}분</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.sheetSummary}>
          <Text style={styles.sheetSummaryLabel}>선택한 공개 시간</Text>
          <Text style={styles.sheetSummaryValue}>{formatKoreanDateTime(selectedDate)}</Text>
        </View>
        <PrimaryButton label="이 시간으로 정하기" onPress={() => onConfirm(selectedDate)} />
      </View>
    </Modal>
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

function formatScheduleDisplay(value: string) {
  const date = parseInput(value);
  return date ? formatKoreanDateTime(date) : '공개 시간을 골라주세요';
}

function formatKoreanDateTime(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function createDateOptions(baseDate: Date) {
  const formatter = new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric' });
  const weekdayFormatter = new Intl.DateTimeFormat('ko-KR', { weekday: 'short' });
  return Array.from({ length: MAX_SCHEDULE_DAYS }, (_, index) => {
    const date = startOfLocalDay(new Date(baseDate.getTime() + index * MS_PER_DAY));
    return {
      body: weekdayFormatter.format(date),
      date,
      label: index === 0 ? '오늘' : index === 1 ? '내일' : formatter.format(date),
      value: formatDateKey(date),
    };
  });
}

function mergeDate(timeSource: Date, dateSource: Date) {
  return new Date(
    dateSource.getFullYear(),
    dateSource.getMonth(),
    dateSource.getDate(),
    timeSource.getHours(),
    timeSource.getMinutes(),
  );
}

function setTimePart(date: Date, hour: number, minute: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute);
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameLocalDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatHour(hour: number) {
  const suffix = hour < 12 ? '오전' : '오후';
  const displayHour = hour % 12 || 12;
  return `${suffix} ${displayHour}시`;
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
  scheduleField: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.md,
    padding: spacing.base,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
  },
  scheduleFieldPressed: { transform: [{ scale: 0.985 }], backgroundColor: colors.surfaceSoft },
  scheduleValue: { ...typography.title, color: colors.ink },
  scheduleHint: { ...typography.caption, color: colors.muted, marginTop: spacing.xs },
  scheduleChevron: { fontSize: 28, lineHeight: 32, color: colors.muted },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(37, 34, 35, 0.28)',
  },
  sheet: {
    maxHeight: '78%',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    backgroundColor: colors.canvas,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.hairline,
    marginBottom: spacing.lg,
  },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  sheetEyebrow: { ...typography.caption, color: colors.primary, marginBottom: spacing.xs },
  sheetTitle: { ...typography.titleLarge, color: colors.ink },
  sheetBody: { ...typography.bodySmall, color: colors.body, marginTop: spacing.xs, maxWidth: 250 },
  closeButton: { minHeight: 40, justifyContent: 'center', paddingHorizontal: spacing.sm, borderRadius: radius.input },
  closeText: { ...typography.label, color: colors.muted },
  sheetLabel: { ...typography.label, color: colors.ink, marginTop: spacing.xl, marginBottom: spacing.sm },
  optionRow: { gap: spacing.sm, paddingRight: spacing.xl },
  dateOption: {
    minWidth: 78,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
  },
  timeOption: {
    minWidth: 86,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
  },
  minuteRow: { flexDirection: 'row', gap: spacing.sm },
  minuteOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  optionTitle: { ...typography.label, color: colors.ink },
  optionTitleSelected: { color: colors.primary },
  optionBody: { ...typography.caption, color: colors.muted },
  optionBodySelected: { color: colors.primary },
  sheetSummary: {
    marginVertical: spacing.xl,
    padding: spacing.base,
    borderRadius: radius.card,
    backgroundColor: colors.surfaceSoft,
    gap: spacing.xs,
  },
  sheetSummaryLabel: { ...typography.caption, color: colors.muted },
  sheetSummaryValue: { ...typography.title, color: colors.ink },
  error: { ...typography.bodySmall, color: colors.danger, marginTop: spacing.md },
  composeBottomSpace: { height: 112 },
});

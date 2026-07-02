import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomNav } from '@/components/bottom-nav';
import { GroupSwitcher } from '@/components/group-switcher';
import { ScreenShell } from '@/components/screen-shell';
import { getMood, moods } from '@/constants/moods';
import { colors, radius, spacing, typography } from '@/design/tokens';
import { useGroups } from '@/providers/group-provider';
import { getGroupMembers, upsertGroupMood } from '@/services/group-service';
import type { MoodCode } from '@/types/groups';

export default function GroupScreen() {
  const queryClient = useQueryClient();
  const { selectedGroup } = useGroups();
  const localDate = toLocalDate(new Date());
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const membersQuery = useQuery({
    queryKey: ['group-members', selectedGroup?.id, localDate],
    queryFn: () => getGroupMembers(selectedGroup!.id, localDate),
    enabled: Boolean(selectedGroup),
  });
  const moodMutation = useMutation({
    mutationFn: (moodCode: MoodCode) => upsertGroupMood(selectedGroup!.id, localDate, timezone, moodCode),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['group-members', selectedGroup?.id] }),
  });

  return (
    <ScreenShell footer={<BottomNav />}>
      <GroupSwitcher />
      <View style={styles.header}><Text style={styles.eyebrow}>오늘의 기분</Text><Text style={styles.title}>지금 마음은 어때?</Text></View>
      <View style={styles.moods}>
        {moods.map((mood) => <Pressable disabled={moodMutation.isPending} key={mood.code} onPress={() => moodMutation.mutate(mood.code)} style={({ pressed }) => [styles.moodChip, pressed && styles.pressed]}><Text style={styles.moodEmoji}>{mood.emoji}</Text><Text style={styles.moodLabel}>{mood.label}</Text></Pressable>)}
      </View>
      <View style={styles.memberHeader}><Text style={styles.sectionTitle}>함께하는 사람</Text><Text style={styles.meta}>{selectedGroup?.activeMemberCount} / {selectedGroup?.memberLimit}명</Text></View>
      <View style={styles.members}>
        {membersQuery.data?.map((member) => {
          const mood = member.todayMood ? getMood(member.todayMood) : null;
          return <View key={member.userId} style={styles.member}><View><Text style={styles.memberName}>{member.nickname}</Text><Text style={styles.meta}>{member.role === 'admin' ? '공간 만든 사람' : '상대'}</Text></View><Text style={mood ? styles.memberMood : styles.noMood}>{mood ? `${mood.emoji} ${mood.label}` : '아직 체크인 전'}</Text></View>;
        })}
      </View>
    </ScreenShell>
  );
}

function toLocalDate(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.xl, gap: spacing.xs },
  eyebrow: { ...typography.caption, color: colors.primary },
  title: { ...typography.titleLarge, color: colors.ink },
  moods: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xl },
  moodChip: { minWidth: 94, padding: spacing.md, alignItems: 'center', gap: spacing.xs, borderRadius: radius.card, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.hairline },
  pressed: { backgroundColor: colors.primarySoft },
  moodEmoji: { fontSize: 24 },
  moodLabel: { ...typography.caption, color: colors.body },
  memberHeader: { marginTop: spacing.xxxl, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { ...typography.title, color: colors.ink },
  meta: { ...typography.caption, color: colors.muted },
  members: { gap: spacing.sm, marginTop: spacing.md },
  member: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.base, borderRadius: radius.card, backgroundColor: colors.surfaceSoft },
  memberName: { ...typography.label, color: colors.ink },
  memberMood: { ...typography.bodySmall, color: colors.body },
  noMood: { ...typography.caption, color: colors.muted },
});

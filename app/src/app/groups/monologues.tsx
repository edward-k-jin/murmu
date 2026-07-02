import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomNav } from '@/components/bottom-nav';
import { GroupSwitcher } from '@/components/group-switcher';
import { ScreenShell } from '@/components/screen-shell';
import { colors, radius, spacing, typography } from '@/design/tokens';
import { useAuth } from '@/providers/auth-provider';
import { useGroups } from '@/providers/group-provider';
import { cancelScheduledMonologue, listGroupFeed } from '@/services/group-service';
import { getMood } from '@/constants/moods';

export default function MonologuesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { groups, loading, selectedGroup } = useGroups();
  const feedQuery = useQuery({
    queryKey: ['group-feed', selectedGroup?.id],
    queryFn: () => listGroupFeed(selectedGroup!.id),
    enabled: Boolean(selectedGroup),
  });
  const cancelMutation = useMutation({
    mutationFn: cancelScheduledMonologue,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['group-feed', selectedGroup?.id] }),
  });

  if (loading) {
    return <ScreenShellWithLoading />;
  }

  if (groups.length === 0) {
    return (
      <ScreenShellWithBottomNav>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>혼잣말</Text>
          <Text style={styles.title}>먼저 공간을 만들어주세요.</Text>
          <Text style={styles.body}>혼잣말은 1:1 공간 안에서 안전하게 남길 수 있어요.</Text>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>연결된 공간이 아직 없어요</Text>
          <Text style={styles.body}>공간 탭에서 새 1:1 공간을 만들거나 초대코드로 참여해보세요.</Text>
        </View>
      </ScreenShellWithBottomNav>
    );
  }

  return (
    <ScreenShellWithBottomNav>
      <GroupSwitcher />
      <View style={styles.feedHeader}>
        <View>
          <Text style={styles.eyebrow}>혼잣말</Text>
          <Text style={styles.title}>둘만의 마음 기록</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => router.push('/groups/compose')} style={({ pressed }) => [styles.writeButton, pressed && styles.writeButtonPressed]}>
          <Text style={styles.writeButtonText}>+ 쓰기</Text>
        </Pressable>
      </View>

      {feedQuery.isLoading ? <ActivityIndicator color={colors.primary} style={styles.spinner} /> : null}
      {feedQuery.isError ? <Text style={styles.error}>피드를 불러오지 못했어요. 잠시 후 다시 열어주세요.</Text> : null}
      {feedQuery.data?.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>아직 기록이 없어요</Text>
          <Text style={styles.body}>지금 마음을 혼잣말처럼 남겨보세요.</Text>
        </View>
      ) : null}

      <View style={styles.cards}>
        {feedQuery.data?.map((item) => {
          const mood = getMood(item.moodCode);
          const isMine = item.authorId === session?.user.id;
          if (item.status === 'scheduled') {
            return (
              <View key={item.id} style={[styles.card, styles.lockedCard]}>
                <View style={styles.cardMeta}>
                  <Text style={styles.mood}>{mood.emoji} {mood.label}</Text>
                  <Text style={styles.meta}>{item.authorNickname}</Text>
                </View>
                <Text style={styles.lockedTitle}>아직 공개 전인 혼잣말이에요</Text>
                <Text style={styles.meta}>{formatDate(item.scheduledFor)} 공개 예정</Text>
                {isMine ? (
                  <View style={styles.rowActions}>
                    <Pressable onPress={() => router.push({ pathname: '/groups/compose', params: { monologueId: item.id } })} style={({ pressed }) => [styles.textAction, pressed && styles.textActionPressed]}>
                      <Text style={styles.actionText}>수정</Text>
                    </Pressable>
                    <Pressable disabled={cancelMutation.isPending} onPress={() => cancelMutation.mutate(item.id)} style={({ pressed }) => [styles.textAction, pressed && styles.textActionPressed, cancelMutation.isPending && styles.textActionDisabled]}>
                      <Text style={styles.dangerText}>예약 취소</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            );
          }
          return (
            <Pressable
              key={item.id}
              onPress={() => router.push({ pathname: '/groups/monologue/[id]', params: { id: item.id } })}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
              <View style={styles.cardMeta}>
                <Text style={styles.mood}>{mood.emoji} {mood.label}</Text>
                <Text style={styles.meta}>{item.authorNickname}{item.authorIsActive ? '' : ' · 이전 상대'}</Text>
              </View>
              <Text numberOfLines={5} style={styles.cardBody}>{item.body}</Text>
              <Text style={styles.meta}>{formatDate(item.publishedAt)} · 답장 {item.threadCount}</Text>
            </Pressable>
          );
        })}
      </View>
    </ScreenShellWithBottomNav>
  );
}

function ScreenShellWithBottomNav({ children }: { children: ReactNode }) {
  return <ScreenShell footer={<BottomNav />}>{children}</ScreenShell>;
}

function ScreenShellWithLoading() {
  return <ScreenShell scroll={false}><View style={styles.loading}><ActivityIndicator color={colors.primary} /></View></ScreenShell>;
}

function formatDate(value: string | null) {
  if (!value) return '';
  return new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { marginTop: spacing.xl, gap: spacing.xs },
  feedHeader: { marginTop: spacing.xl, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  eyebrow: { ...typography.caption, color: colors.primary, marginBottom: spacing.xs },
  title: { ...typography.titleLarge, color: colors.ink },
  body: { ...typography.body, color: colors.body },
  writeButton: { paddingHorizontal: spacing.base, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.primarySoft },
  writeButtonPressed: { transform: [{ scale: 0.98 }] },
  writeButtonText: { ...typography.label, color: colors.primary },
  spinner: { marginTop: spacing.xxxl },
  error: { ...typography.bodySmall, color: colors.danger, marginTop: spacing.xl },
  empty: { marginTop: spacing.xxxl, padding: spacing.xl, borderRadius: radius.card, backgroundColor: colors.surfaceSoft, gap: spacing.sm },
  emptyTitle: { ...typography.title, color: colors.ink },
  cards: { gap: spacing.md, marginTop: spacing.xl, paddingBottom: 108 },
  card: { padding: spacing.lg, borderRadius: radius.card, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.hairline, gap: spacing.md },
  lockedCard: { backgroundColor: colors.surfaceSoft },
  cardPressed: { transform: [{ scale: 0.985 }], backgroundColor: colors.surfaceSoft },
  cardMeta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  mood: { ...typography.label, color: colors.ink },
  meta: { ...typography.caption, color: colors.muted },
  cardBody: { ...typography.body, color: colors.body },
  lockedTitle: { ...typography.title, color: colors.ink },
  rowActions: { flexDirection: 'row', gap: spacing.xl, marginTop: spacing.xs },
  textAction: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.sm, borderRadius: radius.input },
  textActionPressed: { backgroundColor: colors.surface },
  textActionDisabled: { opacity: 0.45 },
  actionText: { ...typography.label, color: colors.primary },
  dangerText: { ...typography.label, color: colors.danger },
});

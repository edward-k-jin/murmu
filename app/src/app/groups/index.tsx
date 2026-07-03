import { type Href, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ScreenShell } from '@/components/screen-shell';
import { SecondaryButton } from '@/components/secondary-button';
import { colors, radius, spacing, typography } from '@/design/tokens';
import { useGroups } from '@/providers/group-provider';

export default function SpacesScreen() {
  const router = useRouter();
  const { groups, loading, selectGroup, selectedGroup } = useGroups();

  if (loading) {
    return <ScreenShell scroll={false}><View style={styles.loading}><ActivityIndicator color={colors.primary} /></View></ScreenShell>;
  }

  if (groups.length === 0) {
    return (
      <ScreenShell scroll={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>공간</Text>
          <Text style={styles.title}>누구와 마음을 나눌까요?</Text>
          <Text style={styles.body}>한 사람과 마음을 나눌 1:1 공간을 시작해보세요.</Text>
        </View>
        <View style={styles.actions}>
          <PrimaryButton label="1:1 공간 만들기" onPress={() => router.push('/groups/create')} />
          <SecondaryButton label="초대코드로 들어가기" onPress={() => router.push('/groups/join')} />
          <Text style={styles.hint}>한 공간에는 나와 상대, 두 명만 함께할 수 있어요.</Text>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>공간</Text>
        <Text style={styles.title}>{groups.length === 1 ? '지금 연결된 1:1 공간이에요' : '내 1:1 공간들'}</Text>
        <Text style={styles.body}>
          {groups.length === 1
            ? '이 공간에서 혼잣말을 남기고 상대의 기분을 확인할 수 있어요.'
            : '공간마다 혼잣말, 기분, 알림이 따로 관리돼요.'}
        </Text>
      </View>

      <View style={styles.quickActions}>
        <Pressable accessibilityRole="button" onPress={() => router.push('/groups/create')} style={({ pressed }) => [styles.quickAction, pressed && styles.quickActionPressed]}>
          <Text style={styles.quickActionTitle}>새 공간</Text>
          <Text style={styles.quickActionBody}>초대 만들기</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.push('/groups/join')} style={({ pressed }) => [styles.quickAction, pressed && styles.quickActionPressed]}>
          <Text style={styles.quickActionTitle}>초대코드</Text>
          <Text style={styles.quickActionBody}>공간 참여</Text>
        </Pressable>
      </View>

      <View style={styles.spaceList}>
        {groups.map((group) => {
          const selected = group.id === selectedGroup?.id;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={group.id}
              onPress={async () => {
                await selectGroup(group.id);
                router.push('/groups/monologues' as Href);
              }}
              style={({ pressed }) => [styles.spaceCard, selected && styles.spaceCardSelected, pressed && styles.spaceCardPressed]}>
              <View style={styles.spaceCardTop}>
                <View style={styles.spaceMark}>
                  <Text style={styles.spaceMarkText}>{group.name.slice(0, 1)}</Text>
                </View>
                <View style={styles.spaceTitleArea}>
                  <Text numberOfLines={1} style={styles.spaceName}>{group.name}</Text>
                  <Text style={styles.meta}>{group.role === 'admin' ? '내가 만든 공간' : '초대로 참여한 공간'}</Text>
                </View>
                {selected ? <View style={styles.selectedPill}><Text style={styles.selectedText}>선택됨</Text></View> : null}
              </View>
              <View style={styles.spaceCardBottom}>
                <Text style={styles.meta}>{group.activeMemberCount} / {group.memberLimit}명 연결됨</Text>
                <View style={styles.openPill}><Text style={styles.openText}>혼잣말 보기</Text></View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { marginTop: spacing.xl, gap: spacing.xs },
  eyebrow: { ...typography.caption, color: colors.primary },
  title: { ...typography.titleLarge, color: colors.ink },
  body: { ...typography.body, color: colors.body },
  actions: { marginTop: 'auto', gap: spacing.md },
  hint: { ...typography.caption, color: colors.muted, textAlign: 'center' },
  quickActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xxl },
  quickAction: {
    flex: 1,
    minHeight: 88,
    justifyContent: 'center',
    padding: spacing.base,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  quickActionPressed: { transform: [{ scale: 0.985 }], backgroundColor: colors.surfaceSoft },
  quickActionTitle: { ...typography.label, color: colors.ink },
  quickActionBody: { ...typography.caption, color: colors.muted },
  spaceList: { gap: spacing.md, marginTop: spacing.xxl, paddingBottom: 108 },
  spaceCard: {
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    gap: spacing.lg,
  },
  spaceCardSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  spaceCardPressed: { transform: [{ scale: 0.985 }] },
  spaceCardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  spaceMark: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSoft,
  },
  spaceMarkText: { ...typography.title, color: colors.primary },
  spaceTitleArea: { flex: 1, gap: spacing.xs },
  spaceName: { ...typography.title, color: colors.ink },
  selectedPill: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full, backgroundColor: colors.surface },
  selectedText: { ...typography.caption, color: colors.primary },
  spaceCardBottom: { alignItems: 'flex-start', gap: spacing.sm },
  meta: { ...typography.caption, color: colors.muted },
  openPill: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full, backgroundColor: colors.surface },
  openText: { ...typography.label, color: colors.primary },
});

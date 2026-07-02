import { type Href, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomNav } from '@/components/bottom-nav';
import { ScreenShell } from '@/components/screen-shell';
import { SecondaryButton } from '@/components/secondary-button';
import { colors, radius, spacing, typography } from '@/design/tokens';
import { useAuth } from '@/providers/auth-provider';
import { useGroups } from '@/providers/group-provider';

export default function MyScreen() {
  const router = useRouter();
  const { session, signOut } = useAuth();
  const { groups } = useGroups();

  return (
    <ScreenShell footer={<BottomNav />}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>나</Text>
        <Text style={styles.title}>내 설정</Text>
        <Text style={styles.body}>계정과 알림을 편하게 관리해보세요.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>프로필</Text>
        <View style={styles.account}>
          <Text style={styles.label}>로그인 계정</Text>
          <Text style={styles.value}>{session?.user.email ?? '연결된 계정'}</Text>
          <Text style={styles.meta}>참여 중인 공간 {groups.length}개</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>알림</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/groups/notification-settings' as Href)}
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>알림 설정</Text>
            <Text style={styles.rowBody}>중요한 변화만 조용히 알려드릴게요.</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>개인정보와 보안</Text>
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>잠금 화면 미리보기</Text>
          <Text style={styles.noticeBody}>혼잣말 본문과 답장 내용은 알림 미리보기에 보여주지 않아요.</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <SecondaryButton label="로그아웃" onPress={() => void signOut()} />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.xl, gap: spacing.xs },
  eyebrow: { ...typography.caption, color: colors.primary },
  title: { ...typography.titleLarge, color: colors.ink },
  body: { ...typography.body, color: colors.body },
  section: { marginTop: spacing.xxl, gap: spacing.md },
  sectionTitle: { ...typography.title, color: colors.ink },
  account: { padding: spacing.lg, gap: spacing.sm, borderRadius: radius.card, backgroundColor: colors.surfaceSoft },
  label: { ...typography.caption, color: colors.muted },
  value: { ...typography.body, color: colors.ink },
  meta: { ...typography.bodySmall, color: colors.body },
  row: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
  },
  rowPressed: { transform: [{ scale: 0.985 }], backgroundColor: colors.surfaceSoft },
  rowText: { flex: 1, gap: spacing.xs },
  rowTitle: { ...typography.label, color: colors.ink },
  rowBody: { ...typography.bodySmall, color: colors.body },
  chevron: { fontSize: 26, lineHeight: 28, color: colors.muted },
  notice: { padding: spacing.lg, gap: spacing.sm, borderRadius: radius.card, backgroundColor: colors.surfaceSoft },
  noticeTitle: { ...typography.label, color: colors.ink },
  noticeBody: { ...typography.bodySmall, color: colors.body },
  actions: { marginTop: spacing.xxl, gap: spacing.md, paddingBottom: 108 },
});

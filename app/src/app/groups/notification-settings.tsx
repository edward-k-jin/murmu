import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ScreenShell } from '@/components/screen-shell';
import { colors, radius, spacing, typography } from '@/design/tokens';

type NotificationKey = 'all' | 'published' | 'scheduled' | 'thread' | 'space' | 'mood';

const initialSettings: Record<NotificationKey, boolean> = {
  all: true,
  published: true,
  scheduled: true,
  thread: true,
  space: true,
  mood: false,
};

const notificationRows: {
  key: NotificationKey;
  title: string;
  body: string;
}[] = [
  { key: 'all', title: '전체 푸시 알림', body: 'Murmu의 중요한 알림을 받을게요.' },
  { key: 'published', title: '새로 공개된 혼잣말', body: '상대가 혼잣말을 공개하면 알려드려요.' },
  { key: 'scheduled', title: '내 예약 혼잣말 공개', body: '예약한 혼잣말이 공개되면 알려드려요.' },
  { key: 'thread', title: '스레드 답장', body: '공개된 혼잣말에 새 답장이 달리면 알려드려요.' },
  { key: 'space', title: '초대와 공간 변경', body: '참여, 나가기, 접근 변경 같은 운영 알림이에요.' },
  { key: 'mood', title: '기분 체크인 리마인더', body: '하루에 한 번 마음을 확인하도록 조용히 알려드려요.' },
];

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);

  const toggle = (key: NotificationKey) => {
    setSettings((current) => {
      const nextValue = !current[key];
      if (key === 'all') {
        return Object.fromEntries(Object.keys(current).map((itemKey) => [itemKey, nextValue])) as Record<NotificationKey, boolean>;
      }
      return { ...current, [key]: nextValue };
    });
  };

  return (
    <ScreenShell>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>‹ 나로 돌아가기</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.eyebrow}>알림</Text>
        <Text style={styles.title}>필요한 순간만 알려드릴게요.</Text>
        <Text style={styles.body}>권한이 꺼져 있으면 기기 설정에서 다시 켤 수 있어요.</Text>
      </View>

      <View style={styles.permissionCard}>
        <View style={styles.permissionText}>
          <Text style={styles.permissionTitle}>기기 알림 권한</Text>
          <Text style={styles.permissionBody}>알림을 받으려면 기기 권한이 필요해요.</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => void Linking.openSettings()} style={({ pressed }) => [styles.settingsButton, pressed && styles.settingsButtonPressed]}>
          <Text style={styles.settingsButtonText}>설정 열기</Text>
        </Pressable>
      </View>

      <View style={styles.rows}>
        {notificationRows.map((row) => {
          const enabled = row.key === 'all' ? settings.all : settings.all && settings[row.key];
          return (
            <View key={row.key} style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{row.title}</Text>
                <Text style={styles.rowBody}>{row.body}</Text>
              </View>
              <Switch
                disabled={row.key !== 'all' && !settings.all}
                ios_backgroundColor={colors.hairline}
                onValueChange={() => toggle(row.key)}
                thumbColor={enabled ? colors.primary : colors.surface}
                trackColor={{ false: colors.hairline, true: colors.primarySoft }}
                value={enabled}
              />
            </View>
          );
        })}
      </View>

      <View style={styles.privacyNote}>
        <Text style={styles.privacyTitle}>알림 미리보기 기준</Text>
        <Text style={styles.privacyBody}>잠금 화면에는 혼잣말 본문, 답장 내용, 글자 수를 보여주지 않아요. 알림에는 필요한 화면으로 이동할 정보만 담아요.</Text>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  back: { ...typography.label, color: colors.primary, marginTop: spacing.md },
  header: { marginTop: spacing.xl, gap: spacing.sm },
  eyebrow: { ...typography.caption, color: colors.primary },
  title: { ...typography.titleLarge, color: colors.ink },
  body: { ...typography.body, color: colors.body },
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xxl,
    padding: spacing.lg,
    borderRadius: radius.card,
    backgroundColor: colors.primarySoft,
  },
  permissionText: { flex: 1, gap: spacing.xs },
  permissionTitle: { ...typography.label, color: colors.ink },
  permissionBody: { ...typography.bodySmall, color: colors.body },
  settingsButton: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface },
  settingsButtonPressed: { transform: [{ scale: 0.98 }] },
  settingsButtonText: { ...typography.label, color: colors.primary },
  rows: { marginTop: spacing.xxl, borderRadius: radius.card, overflow: 'hidden', borderWidth: 1, borderColor: colors.hairline },
  row: { minHeight: 84, flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.hairline },
  rowText: { flex: 1, gap: spacing.xs },
  rowTitle: { ...typography.label, color: colors.ink },
  rowBody: { ...typography.bodySmall, color: colors.body },
  privacyNote: { marginTop: spacing.xxl, padding: spacing.lg, gap: spacing.sm, borderRadius: radius.card, backgroundColor: colors.surfaceSoft },
  privacyTitle: { ...typography.label, color: colors.ink },
  privacyBody: { ...typography.bodySmall, color: colors.body },
});

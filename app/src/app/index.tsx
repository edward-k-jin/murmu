import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { colors, radius, spacing, typography } from '@/design/tokens';

const moods = ['편안해', '설레', '조금 복잡해'];

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark} />
          <Text style={styles.brand}>Murmu</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>우리 사이의 작은 감정까지</Text>
          <Text style={styles.title}>말하기 어려운 마음도{`\n`}천천히 나눠봐.</Text>
          <Text style={styles.description}>
            오늘의 기분을 알리고, 준비됐을 때 혼잣말을 서로에게 열어주는 커플 공간이야.
          </Text>
        </View>

        <View style={styles.preview}>
          <Text style={styles.previewLabel}>오늘 나는</Text>
          <View style={styles.moodRow}>
            {moods.map((mood, index) => (
              <View key={mood} style={[styles.moodChip, index === 1 && styles.moodChipActive]}>
                <Text style={[styles.moodText, index === 1 && styles.moodTextActive]}>{mood}</Text>
              </View>
            ))}
          </View>
          <View style={styles.divider} />
          <Text style={styles.privateLabel}>혼잣말은 네가 허락하기 전까지 내용이 보이지 않아.</Text>
        </View>

        <View style={styles.actions}>
          <PrimaryButton label="시작하기" onPress={() => {}} />
          <Text style={styles.loginHint}>이미 계정이 있다면 로그인</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandMark: {
    width: 12,
    height: 12,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  brand: {
    ...typography.label,
    color: colors.ink,
  },
  hero: {
    marginTop: spacing.xxxl,
    gap: spacing.md,
  },
  eyebrow: {
    ...typography.label,
    color: colors.primary,
  },
  title: {
    ...typography.display,
    color: colors.ink,
  },
  description: {
    ...typography.body,
    color: colors.body,
    maxWidth: 330,
  },
  preview: {
    marginTop: spacing.xxl,
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  previewLabel: {
    ...typography.title,
    color: colors.ink,
  },
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  moodChip: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSoft,
  },
  moodChipActive: {
    backgroundColor: colors.primarySoft,
  },
  moodText: {
    ...typography.bodySmall,
    color: colors.body,
  },
  moodTextActive: {
    color: colors.primaryPressed,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.hairline,
  },
  privateLabel: {
    ...typography.caption,
    color: colors.muted,
  },
  actions: {
    marginTop: 'auto',
    gap: spacing.md,
    alignItems: 'center',
  },
  loginHint: {
    ...typography.bodySmall,
    color: colors.muted,
    paddingVertical: spacing.sm,
  },
});

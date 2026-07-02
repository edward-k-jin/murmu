import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ScreenShell } from '@/components/screen-shell';
import { SecondaryButton } from '@/components/secondary-button';
import { colors, radius, spacing, typography } from '@/design/tokens';
import { useAuth } from '@/providers/auth-provider';
import { useGroups } from '@/providers/group-provider';

const onboardingSteps = [
  {
    eyebrow: '말하기 어려운 마음도 괜찮아요',
    title: `바로 말하지 못한 마음을${`\n`}먼저 혼잣말로 남겨요.`,
    description:
      '친구나 연인 사이에서 불편했던 마음, 전하고 싶지만 아직 준비되지 않은 이야기를 조용히 적어둘 수 있어요.',
    cardTitle: '오늘 마음에 남은 이야기',
    cardBody: '서운했던 말, 고마웠던 순간, 아직 꺼내기 어려운 마음을 나에게 말하듯 적어보세요.',
  },
  {
    eyebrow: '상대에게 닿는 속도는 내가 정해요',
    title: `혼잣말은 바로 공개하지${`\n`}않아도 돼요.`,
    description:
      '지금은 나만 볼 수 있게 두고, 마음이 정리되었을 때 상대에게 보여줄 수 있어요. 공개 전까지는 내 공간에만 안전하게 머물러요.',
    cardTitle: '공개 전까지는 비공개',
    cardBody: '예약한 혼잣말은 정한 시점 전까지 상대에게 본문이 보이지 않아요.',
  },
  {
    eyebrow: '우리 둘만의 대화를 시작해요',
    title: `편하게 남기고,${`\n`}준비되면 전해보세요.`,
    description:
      'Murmu는 감정을 숨기기보다 안전하게 표현하도록 돕는 1:1 공간이에요. 시작하려면 계정으로 로그인해주세요.',
    cardTitle: '로그인하면 할 수 있어요',
    cardBody: '1:1 공간을 만들거나 초대코드로 참여하고, 공개된 혼잣말에서 대화를 이어갈 수 있어요.',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { configured, loading: authLoading, session, signInWithProvider } = useAuth();
  const { loading: groupsLoading } = useGroups();
  const [step, setStep] = useState(0);
  const [provider, setProvider] = useState<'apple' | 'google' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const currentStep = onboardingSteps[step];

  if (authLoading || (session && groupsLoading)) {
    return <ScreenShell scroll={false}><View style={styles.loading}><ActivityIndicator color={colors.primary} /></View></ScreenShell>;
  }

  if (!configured) {
    return (
      <ScreenShell scroll={false}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>개발 환경 설정이 필요해</Text>
          <Text style={styles.title}>Supabase 연결값을{`\n`}먼저 설정해줘.</Text>
          <Text style={styles.description}>`app/.env.local`에 아래 두 값을 추가하면 돼.</Text>
          <View style={styles.configBox}>
            <Text style={styles.configKey}>EXPO_PUBLIC_SUPABASE_URL</Text>
            <Text style={styles.configKey}>EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY</Text>
          </View>
        </View>
      </ScreenShell>
    );
  }

  if (session) {
    return <Redirect href="/groups" />;
  }

  const signIn = async (nextProvider: 'apple' | 'google') => {
    try {
      setError(null);
      setProvider(nextProvider);
      const completed = await signInWithProvider(nextProvider);
      if (completed) router.replace('/profile');
    } catch {
      setError('로그인을 완료하지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setProvider(null);
    }
  };

  const footer = step < onboardingSteps.length - 1 ? (
    <PrimaryButton label="다음" onPress={() => setStep((nextStep) => nextStep + 1)} />
  ) : (
    <View style={styles.loginActions}>
      <SecondaryButton
        disabled={provider !== null}
        label={provider === 'apple' ? '잠시만요...' : 'Apple로 계속하기'}
        onPress={() => void signIn('apple')}
      />
      <PrimaryButton
        disabled={provider !== null}
        label="Google로 계속하기"
        loading={provider === 'google'}
        onPress={() => void signIn('google')}
      />
    </View>
  );

  return (
    <ScreenShell
      footer={footer}
      scroll={false}>
      <View style={styles.brandRow}><View style={styles.brandMark} /><Text style={styles.brand}>Murmu</Text></View>
      <View style={styles.hero}>
        <Text style={styles.stepText}>{step + 1}/3</Text>
        <Text style={styles.eyebrow}>{currentStep.eyebrow}</Text>
        <Text style={styles.title}>{currentStep.title}</Text>
        <Text style={styles.description}>{currentStep.description}</Text>
      </View>
      <View style={styles.preview}>
        <Text style={styles.previewLabel}>{currentStep.cardTitle}</Text>
        <Text style={styles.privateLabel}>{currentStep.cardBody}</Text>
        <View style={styles.divider} />
        <View style={styles.progressRow}>
          {onboardingSteps.map((item, index) => (
            <View
              key={item.eyebrow}
              style={[styles.progressDot, index === step && styles.progressDotActive]}
            />
          ))}
        </View>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  brandMark: { width: 12, height: 12, borderRadius: radius.full, backgroundColor: colors.primary },
  brand: { ...typography.label, color: colors.ink },
  hero: { marginTop: spacing.xxxl, gap: spacing.md },
  stepText: { ...typography.caption, color: colors.muted },
  eyebrow: { ...typography.label, color: colors.primary },
  title: { ...typography.display, color: colors.ink },
  description: { ...typography.body, color: colors.body, maxWidth: 340 },
  configBox: { padding: spacing.base, gap: spacing.sm, borderRadius: radius.input, backgroundColor: colors.surfaceSoft },
  configKey: { fontFamily: 'monospace', fontSize: 12, lineHeight: 18, color: colors.body },
  preview: { marginTop: spacing.xxl, padding: spacing.lg, borderRadius: radius.card, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.surface, gap: spacing.md },
  previewLabel: { ...typography.title, color: colors.ink },
  divider: { height: 1, backgroundColor: colors.hairline },
  privateLabel: { ...typography.caption, color: colors.muted },
  progressRow: { flexDirection: 'row', gap: spacing.sm },
  progressDot: { width: 8, height: 8, borderRadius: radius.full, backgroundColor: colors.hairline },
  progressDotActive: { width: 24, backgroundColor: colors.primary },
  loginActions: { gap: spacing.md },
  error: { ...typography.bodySmall, marginTop: spacing.md, color: colors.danger },
});

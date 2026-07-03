import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ScreenShell } from '@/components/screen-shell';
import { SecondaryButton } from '@/components/secondary-button';
import { colors, radius, spacing, typography } from '@/design/tokens';
import { useAuth } from '@/providers/auth-provider';
import { useGroups } from '@/providers/group-provider';

const onboardingSteps = [
  {
    eyebrow: '오늘 무슨 일 있었나요?',
    title: '직접 말하지 못했어도 괜찮아요',
    description:
      `그게 누구든 말하기 어려웠던 마음을${`\n`}혼잣말로 안전하게 남겨보세요.`,
  },
  {
    eyebrow: '상대에게 닿는 속도를 정해요',
    title: '공개 속도는 직접 정해요',
    description:
      `지금은 나만 보관하고, 마음이 정리되면${`\n`}정한 시간에 상대에게 보여줄 수 있어요.`,
  },
  {
    eyebrow: '우리 둘만의 대화를 시작해요',
    title: '이제 편하게 시작해요',
    description:
      `1:1 공간을 만들고 초대코드로 연결해요.${`\n`}로그인하면 둘만의 이야기를 시작할 수 있어요.`,
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
    <View style={styles.footerActions}>
      {step > 0 ? <SecondaryButton label="이전" onPress={() => setStep((nextStep) => nextStep - 1)} /> : null}
      <PrimaryButton label="다음" onPress={() => setStep((nextStep) => nextStep + 1)} />
    </View>
  ) : (
    <View style={styles.loginActions}>
      <SecondaryButton label="이전" onPress={() => setStep((nextStep) => nextStep - 1)} />
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
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>{currentStep.eyebrow}</Text>
        <Text style={styles.title}>{currentStep.title}</Text>
        <Text style={styles.description}>{currentStep.description}</Text>
      </View>
      <AnimatedOnboardingSymbol step={step} />
      <View style={styles.progressRow}>
        {onboardingSteps.map((item, index) => (
          <View
            key={item.eyebrow}
            style={[styles.progressDot, index === step && styles.progressDotActive]}
          />
        ))}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </ScreenShell>
  );
}

function AnimatedOnboardingSymbol({ step }: { step: number }) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    progress.setValue(0);
    const animation = Animated.loop(
      Animated.timing(progress, {
        duration: 2800,
        easing: Easing.inOut(Easing.ease),
        toValue: 1,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [progress, step]);

  const breathe = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.98, 1.04, 0.98] });
  const pulse = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.35, 0.85, 0.35] });
  const bubbleScale = progress.interpolate({ inputRange: [0, 0.45, 1], outputRange: [0.94, 1, 0.94] });
  const bubbleDotShift = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [-8, 8, -8] });
  const lockTopTranslateX = progress.interpolate({ inputRange: [0, 0.45, 0.7, 1], outputRange: [-18, -18, 0, 0] });
  const lockTopRotate = progress.interpolate({ inputRange: [0, 0.45, 0.7, 1], outputRange: ['-18deg', '-18deg', '0deg', '0deg'] });
  const lockBodyScale = progress.interpolate({ inputRange: [0, 0.7, 0.82, 1], outputRange: [1, 1, 1.06, 1] });
  const bridgeScale = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.55, 1, 0.55] });
  const leftHeartShift = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [-6, 0, -6] });
  const rightHeartShift = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [6, 0, 6] });

  return (
    <View style={styles.symbolStage}>
      <Animated.View
        style={[
          styles.symbolGlow,
          step === 1 && styles.symbolGlowQuiet,
          step === 2 && styles.symbolGlowWarm,
          { opacity: pulse, transform: [{ scale: breathe }] },
        ]}
      />
      {step === 0 ? (
        <View style={styles.symbolGroup}>
          <Animated.View style={[styles.symbolBubbleLarge, { transform: [{ scale: bubbleScale }] }]} />
          <Animated.View style={[styles.symbolBubbleSmall, { transform: [{ scale: breathe }] }]} />
          <Animated.View style={[styles.symbolDot, { transform: [{ translateX: bubbleDotShift }] }]} />
        </View>
      ) : step === 1 ? (
        <View style={styles.symbolGroup}>
          <Animated.View
            style={[
              styles.symbolLockTop,
              { transform: [{ translateX: lockTopTranslateX }, { rotate: lockTopRotate }] },
            ]}
          />
          <Animated.View style={[styles.symbolLockBody, { transform: [{ scale: lockBodyScale }] }]}>
            <View style={styles.symbolLockDot} />
          </Animated.View>
          <Animated.View style={[styles.symbolLine, { transform: [{ scaleX: bridgeScale }] }]} />
        </View>
      ) : (
        <View style={styles.symbolGroup}>
          <Animated.View style={[styles.symbolOrbit, { transform: [{ scale: breathe }] }]} />
          <Animated.View style={[styles.symbolHeartLeft, { transform: [{ translateX: leftHeartShift }] }]} />
          <Animated.View style={[styles.symbolHeartRight, { transform: [{ translateX: rightHeartShift }] }]} />
          <Animated.View style={[styles.symbolBridge, { transform: [{ scaleX: bridgeScale }] }]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: { marginTop: spacing.xxl, gap: spacing.sm },
  eyebrow: { ...typography.label, color: colors.primary },
  title: { ...typography.display, color: colors.ink, fontSize: 26, lineHeight: 34 },
  description: { ...typography.body, color: colors.body, maxWidth: 340, marginTop: spacing.xs },
  configBox: { padding: spacing.base, gap: spacing.sm, borderRadius: radius.input, backgroundColor: colors.surfaceSoft },
  configKey: { fontFamily: 'monospace', fontSize: 12, lineHeight: 18, color: colors.body },
  symbolStage: {
    height: 188,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  symbolGlow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
  },
  symbolGlowQuiet: { backgroundColor: colors.surfaceSoft },
  symbolGlowWarm: { backgroundColor: '#FFF2E9' },
  symbolGroup: {
    width: 128,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolBubbleLarge: {
    width: 88,
    height: 62,
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  symbolBubbleSmall: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    width: 34,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  symbolDot: {
    position: 'absolute',
    left: 34,
    top: 50,
    width: 12,
    height: 12,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
  },
  symbolLockTop: {
    width: 48,
    height: 42,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 8,
    borderBottomWidth: 0,
    borderColor: colors.primary,
  },
  symbolLockBody: {
    width: 78,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  symbolLockDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  symbolLine: {
    width: 96,
    height: 4,
    marginTop: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
  },
  symbolOrbit: {
    position: 'absolute',
    width: 118,
    height: 82,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  symbolHeartLeft: {
    position: 'absolute',
    left: 20,
    width: 42,
    height: 42,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
  },
  symbolHeartRight: {
    position: 'absolute',
    right: 20,
    width: 42,
    height: 42,
    borderRadius: 18,
    backgroundColor: colors.primary,
  },
  symbolBridge: {
    width: 54,
    height: 5,
    borderRadius: radius.full,
    backgroundColor: colors.hairline,
  },
  progressRow: { flexDirection: 'row', alignSelf: 'center', gap: spacing.sm, marginTop: spacing.xs },
  progressDot: { width: 8, height: 8, borderRadius: radius.full, backgroundColor: colors.hairline },
  progressDotActive: { width: 24, backgroundColor: colors.primary },
  footerActions: { gap: spacing.md },
  loginActions: { gap: spacing.md },
  error: { ...typography.bodySmall, marginTop: spacing.md, color: colors.danger },
});

import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ScreenShell } from '@/components/screen-shell';
import { SecondaryButton } from '@/components/secondary-button';
import { colors, spacing, typography } from '@/design/tokens';
import { useAuth } from '@/providers/auth-provider';

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithProvider } = useAuth();
  const [provider, setProvider] = useState<'apple' | 'google' | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <ScreenShell>
      <View style={styles.header}>
        <Text style={styles.title}>어떤 계정으로 시작할까요?</Text>
        <Text style={styles.body}>1:1 공간마다 같은 계정으로 안전하게 연결해드릴게요.</Text>
      </View>
      <View style={styles.actions}>
        <SecondaryButton disabled={provider !== null} label={provider === 'apple' ? '잠시만요...' : 'Apple로 계속하기'} onPress={() => void signIn('apple')} />
        <PrimaryButton disabled={provider !== null} label="Google로 계속하기" loading={provider === 'google'} onPress={() => void signIn('google')} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.xxxl, gap: spacing.md },
  title: { ...typography.titleLarge, color: colors.ink },
  body: { ...typography.body, color: colors.body },
  actions: { marginTop: spacing.xxxl, gap: spacing.md },
  error: { ...typography.bodySmall, color: colors.danger },
});

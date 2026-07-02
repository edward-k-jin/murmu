import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ScreenShell } from '@/components/screen-shell';
import { TextField } from '@/components/text-field';
import { colors, spacing, typography } from '@/design/tokens';
import { upsertProfile } from '@/services/group-service';

export default function ProfileScreen() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const cleanNickname = nickname.trim();
    if (!cleanNickname || cleanNickname.length > 20) {
      setError('닉네임은 1자 이상 20자 이하로 입력해주세요.');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await upsertProfile(cleanNickname, Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Seoul');
      router.replace('/groups');
    } catch {
      setError('프로필을 저장하지 못했어요. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenShell footer={<PrimaryButton label="계속하기" loading={saving} onPress={() => void submit()} />}>
      <View style={styles.header}><Text style={styles.step}>1 / 1</Text><Text style={styles.title}>상대가 부를 이름을 알려주세요.</Text><Text style={styles.body}>1:1 공간마다 같은 닉네임이 보여요.</Text></View>
      <View style={styles.form}><TextField autoCapitalize="none" error={error} label="닉네임" maxLength={20} onChangeText={setNickname} placeholder="닉네임 입력" value={nickname} /></View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.lg, gap: spacing.md },
  step: { ...typography.caption, color: colors.primary },
  title: { ...typography.titleLarge, color: colors.ink },
  body: { ...typography.body, color: colors.body },
  form: { marginTop: spacing.xxxl },
});

import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ScreenShell } from '@/components/screen-shell';
import { SecondaryButton } from '@/components/secondary-button';
import { TextField } from '@/components/text-field';
import { colors, radius, spacing, typography } from '@/design/tokens';
import { createRequestId } from '@/lib/uuid';
import { useGroups } from '@/providers/group-provider';
import { acceptGroupInvite, previewGroupInvite } from '@/services/group-service';
import type { InvitePreview } from '@/types/groups';

const previewMessages: Record<Exclude<InvitePreview['state'], 'valid'>, string> = {
  already_joined: '이미 참여한 공간이에요.',
  expired: '초대코드가 만료됐어요.',
  full: '이미 두 명이 함께하는 공간이에요.',
  invalid: '초대코드를 찾을 수 없어요.',
  revoked: '더 이상 사용할 수 없는 초대코드예요.',
};

export default function JoinGroupScreen() {
  const router = useRouter();
  const { refreshGroups, selectGroup } = useGroups();
  const [requestId] = useState(() => createRequestId());
  const [code, setCode] = useState('');
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkCode = async () => {
    if (!code.trim()) return setError('초대코드를 입력해주세요.');
    try {
      setLoading(true);
      setError(null);
      setPreview(await previewGroupInvite(code.trim()));
    } catch {
      setError('초대코드를 확인하지 못했어요.');
    } finally {
      setLoading(false);
    }
  };

  const join = async () => {
    try {
      setLoading(true);
      const group = await acceptGroupInvite(code.trim(), requestId);
      await refreshGroups();
      await selectGroup(group.id);
      router.replace('/groups');
    } catch {
      setError('1:1 공간에 참여하지 못했어요. 초대 상태를 다시 확인해주세요.');
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  if (preview) {
    const valid = preview.state === 'valid';
    const title = valid ? preview.groupName : previewMessages[preview.state as Exclude<InvitePreview['state'], 'valid'>];
    return (
      <ScreenShell footer={valid ? <PrimaryButton label="이 공간에 참여하기" loading={loading} onPress={() => void join()} /> : <SecondaryButton label="다른 코드 입력하기" onPress={() => setPreview(null)} />}>
        <View style={styles.header}><Text style={styles.eyebrow}>{valid ? '초대받은 1:1 공간' : '초대 확인'}</Text><Text style={styles.title}>{title}</Text></View>
        {valid ? <View style={styles.previewCard}><Text style={styles.admin}>{preview.adminNickname}님이 만든 공간</Text><Text style={styles.count}>{preview.activeMemberCount} / {preview.memberLimit}명</Text><View style={styles.divider} /><Text style={styles.notice}>참여하면 이 공간에서 이전에 공개된 혼잣말도 볼 수 있어요.</Text></View> : null}
      </ScreenShell>
    );
  }

  return (
    <ScreenShell footer={<PrimaryButton label="초대 확인하기" loading={loading} onPress={() => void checkCode()} />}>
      <View style={styles.header}><Text style={styles.title}>초대코드를 입력해주세요.</Text><Text style={styles.body}>상대에게 받은 10자리 코드를 확인할게요.</Text></View>
      <View style={styles.form}><TextField autoCapitalize="characters" autoCorrect={false} error={error} label="초대코드" maxLength={10} onChangeText={(value) => setCode(value.toUpperCase())} placeholder="예: A1B2C3D4E5" value={code} /></View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.lg, gap: spacing.md },
  eyebrow: { ...typography.label, color: colors.primary },
  title: { ...typography.titleLarge, color: colors.ink },
  body: { ...typography.body, color: colors.body },
  form: { marginTop: spacing.xxxl },
  previewCard: { marginTop: spacing.xxxl, padding: spacing.lg, gap: spacing.md, borderRadius: radius.card, backgroundColor: colors.surface },
  admin: { ...typography.body, color: colors.ink },
  count: { ...typography.bodySmall, color: colors.body },
  divider: { height: 1, backgroundColor: colors.hairline },
  notice: { ...typography.bodySmall, color: colors.muted },
});

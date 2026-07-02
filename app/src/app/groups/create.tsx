import { useRouter } from 'expo-router';
import { Share, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import { PrimaryButton } from '@/components/primary-button';
import { ScreenShell } from '@/components/screen-shell';
import { SecondaryButton } from '@/components/secondary-button';
import { TextField } from '@/components/text-field';
import { colors, radius, spacing, typography } from '@/design/tokens';
import { createRequestId } from '@/lib/uuid';
import { useGroups } from '@/providers/group-provider';
import { createGroup, createGroupInvite } from '@/services/group-service';
import type { GroupInvite, GroupSummary } from '@/types/groups';

export default function CreateGroupScreen() {
  const router = useRouter();
  const { refreshGroups, selectGroup } = useGroups();
  const [requestId] = useState(() => createRequestId());
  const [name, setName] = useState('');
  const [createdGroup, setCreatedGroup] = useState<GroupSummary | null>(null);
  const [invite, setInvite] = useState<GroupInvite | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async () => {
    const cleanName = name.trim();
    if (!cleanName || cleanName.length > 30) {
      setError('공간 이름은 1자 이상 30자 이하로 입력해주세요.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const group = await createGroup(cleanName, requestId);
      const nextInvite = await createGroupInvite(group.id);
      await refreshGroups();
      await selectGroup(group.id);
      setCreatedGroup(group);
      setInvite(nextInvite);
    } catch {
      setError('1:1 공간을 만들지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (createdGroup && invite) {
    return (
      <ScreenShell footer={<PrimaryButton label="공간으로 들어가기" onPress={() => router.replace('/groups')} />}>
        <View style={styles.header}><Text style={styles.eyebrow}>1:1 공간을 만들었어요</Text><Text style={styles.title}>{createdGroup.name}</Text><Text style={styles.body}>상대가 참여하면 이전에 공개된 기록도 볼 수 있어요.</Text></View>
        <View style={styles.inviteCard}><Text style={styles.codeLabel}>초대코드</Text><Text selectable style={styles.code}>{invite.code}</Text><Text style={styles.meta}>{createdGroup.activeMemberCount} / {createdGroup.memberLimit}명</Text></View>
        <View style={styles.actions}><PrimaryButton label="초대 링크 공유하기" onPress={() => void Share.share({ message: `${createdGroup.name}에 초대할게요. ${invite.deepLink}` })} /><SecondaryButton label="나중에 초대하기" onPress={() => router.replace('/groups')} /></View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell footer={<PrimaryButton label="1:1 공간 만들기" loading={loading} onPress={() => void create()} />}>
      <View style={styles.header}><Text style={styles.title}>새 1:1 공간을 만들어볼까요?</Text><Text style={styles.body}>초대한 한 사람과만 혼잣말과 대화를 나눌 수 있어요.</Text></View>
      <View style={styles.form}><TextField error={error} label="공간 이름" maxLength={30} onChangeText={setName} placeholder="예: 우리 둘" value={name} /><Text style={styles.hint}>한 공간에는 나와 상대, 두 명만 함께할 수 있어요.</Text></View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.lg, gap: spacing.md },
  eyebrow: { ...typography.label, color: colors.primary },
  title: { ...typography.titleLarge, color: colors.ink },
  body: { ...typography.body, color: colors.body },
  form: { marginTop: spacing.xxxl, gap: spacing.md },
  hint: { ...typography.caption, color: colors.muted },
  inviteCard: { marginTop: spacing.xxxl, padding: spacing.lg, gap: spacing.sm, borderRadius: radius.card, backgroundColor: colors.surfaceSoft },
  codeLabel: { ...typography.caption, color: colors.muted },
  code: { fontSize: 26, lineHeight: 34, fontWeight: '700', letterSpacing: 2, color: colors.ink },
  meta: { ...typography.bodySmall, color: colors.body },
  actions: { marginTop: spacing.xxl, gap: spacing.md },
});

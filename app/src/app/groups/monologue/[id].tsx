import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ScreenShell } from '@/components/screen-shell';
import { getMood } from '@/constants/moods';
import { colors, radius, spacing, typography } from '@/design/tokens';
import { createRequestId } from '@/lib/uuid';
import { useGroups } from '@/providers/group-provider';
import { getPublishedMonologue, listThreadMessages, sendThreadMessage } from '@/services/group-service';

export default function MonologueDetailScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ id: string }>();
  const monologueId = typeof params.id === 'string' ? params.id : '';
  const { selectedGroup } = useGroups();
  const [message, setMessage] = useState('');
  const detailQuery = useQuery({
    queryKey: ['published-monologue', selectedGroup?.id, monologueId],
    queryFn: () => getPublishedMonologue(selectedGroup!.id, monologueId),
    enabled: Boolean(selectedGroup && monologueId),
  });
  const threadQuery = useQuery({
    queryKey: ['thread', selectedGroup?.id, monologueId],
    queryFn: () => listThreadMessages(selectedGroup!.id, monologueId),
    enabled: Boolean(selectedGroup && monologueId),
  });
  const sendMutation = useMutation({
    mutationFn: () => sendThreadMessage(selectedGroup!.id, monologueId, createRequestId(), message.trim()),
    onSuccess: async () => {
      setMessage('');
      await queryClient.invalidateQueries({ queryKey: ['thread', selectedGroup?.id, monologueId] });
      await queryClient.invalidateQueries({ queryKey: ['group-feed', selectedGroup?.id] });
    },
  });
  const detail = detailQuery.data;

  return (
    <ScreenShell footer={<View style={styles.composer}><TextInput accessibilityLabel="답장" maxLength={5000} onChangeText={setMessage} placeholder="짧게 마음을 건네보세요" placeholderTextColor={colors.muted} style={styles.input} value={message} /><View style={styles.send}><PrimaryButton disabled={!message.trim()} label="보내기" loading={sendMutation.isPending} onPress={() => sendMutation.mutate()} /></View></View>}>
      <Pressable onPress={() => router.back()}><Text style={styles.back}>‹ 피드로 돌아가기</Text></Pressable>
      {detail ? <View style={styles.monologue}><View style={styles.metaRow}><Text style={styles.mood}>{getMood(detail.moodCode).emoji} {getMood(detail.moodCode).label}</Text><Text style={styles.metaRight}>{detail.authorNickname}{detail.authorIsActive ? '' : ' · 이전 멤버'}</Text></View><Text style={styles.body}>{detail.body}</Text><Text style={styles.meta}>{formatDate(detail.publishedAt)}</Text></View> : null}
      {detailQuery.isError ? <Text style={styles.error}>이 혼잣말을 볼 수 없거나 삭제됐어요.</Text> : null}
      <Text style={styles.sectionTitle}>이어진 이야기</Text>
      <View style={styles.messages}>
        {threadQuery.data?.length === 0 ? <Text style={styles.empty}>아직 답장이 없어요. 첫 마음을 건네보세요.</Text> : null}
        {threadQuery.data?.map((item) => <View key={item.id} style={styles.message}><View style={styles.messageHeader}><Text numberOfLines={1} style={styles.sender}>{item.senderNickname}</Text><Text numberOfLines={1} style={styles.messageTime}>{item.senderIsActive ? formatDate(item.createdAt) : `이전 멤버 · ${formatDate(item.createdAt)}`}</Text></View><Text style={styles.messageBody}>{item.body}</Text></View>)}
      </View>
    </ScreenShell>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

const styles = StyleSheet.create({
  back: { ...typography.label, color: colors.primary, marginTop: spacing.md },
  monologue: { marginTop: spacing.xl, padding: spacing.lg, gap: spacing.lg, borderRadius: radius.card, backgroundColor: colors.surfaceSoft },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  mood: { ...typography.label, color: colors.ink },
  meta: { ...typography.caption, color: colors.muted },
  metaRight: { ...typography.caption, flexShrink: 0, color: colors.muted, textAlign: 'right' },
  body: { fontSize: 18, lineHeight: 30, color: colors.ink },
  error: { ...typography.bodySmall, color: colors.danger, marginTop: spacing.xl },
  sectionTitle: { ...typography.title, color: colors.ink, marginTop: spacing.xxxl },
  messages: { gap: spacing.sm, marginTop: spacing.md },
  message: { padding: spacing.lg, gap: spacing.md, borderRadius: radius.card, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.hairline },
  messageHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  sender: { ...typography.label, flex: 1, color: colors.ink },
  messageTime: { ...typography.caption, minWidth: 92, flexShrink: 0, color: colors.muted, textAlign: 'right' },
  messageBody: { ...typography.body, color: colors.body },
  empty: { ...typography.bodySmall, color: colors.muted },
  composer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  input: { flex: 1, minHeight: 52, paddingHorizontal: spacing.base, borderRadius: radius.button, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.surface, ...typography.body, color: colors.ink },
  send: { width: 92 },
});

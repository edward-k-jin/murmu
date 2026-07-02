import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

import { colors, radius, spacing, typography } from '@/design/tokens';
import { useGroups } from '@/providers/group-provider';

export function GroupSwitcher() {
  const router = useRouter();
  const { groups, selectedGroup, selectGroup } = useGroups();
  const [open, setOpen] = useState(false);

  if (!selectedGroup) return null;

  return (
    <>
      <Pressable
        accessibilityLabel={`현재 1:1 공간 ${selectedGroup.name}, 공간 변경`}
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}>
        <Text numberOfLines={1} style={styles.triggerText}>{selectedGroup.name}</Text>
        <Text style={styles.chevron}>⌄</Text>
      </Pressable>
      <Modal animationType="fade" transparent visible={open} onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.title}>1:1 공간 선택</Text>
            {groups.map((group) => {
              const selected = group.id === selectedGroup.id;
              return (
                <Pressable
                  accessibilityState={{ selected }}
                  key={group.id}
                  onPress={() => {
                    setOpen(false);
                    void selectGroup(group.id);
                  }}
                  style={({ pressed }) => [styles.groupRow, selected && styles.groupRowSelected, pressed && styles.groupRowPressed]}>
                  <View style={styles.groupCopy}>
                    <Text numberOfLines={1} style={styles.groupName}>{group.name}</Text>
                    <Text style={styles.groupMeta}>{group.activeMemberCount} / {group.memberLimit}명</Text>
                  </View>
                  {selected ? <View style={styles.selectedDot} /> : null}
                </Pressable>
              );
            })}
            <Pressable onPress={() => { setOpen(false); router.push('/groups/create'); }} style={({ pressed }) => [styles.actionRow, pressed && styles.actionRowPressed]}>
              <Text style={styles.actionText}>새 1:1 공간 만들기</Text>
            </Pressable>
            <Pressable onPress={() => { setOpen(false); router.push('/groups/join'); }} style={({ pressed }) => [styles.actionRow, pressed && styles.actionRowPressed]}>
              <Text style={styles.actionText}>초대코드로 참여하기</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: { minHeight: 48, maxWidth: '70%', flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.sm, borderRadius: radius.full },
  triggerPressed: { backgroundColor: colors.surfaceSoft },
  triggerText: { ...typography.title, color: colors.ink, flexShrink: 1 },
  chevron: { ...typography.body, color: colors.muted },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(37,34,35,0.26)' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, padding: spacing.xl, gap: spacing.sm },
  title: { ...typography.title, color: colors.ink, marginBottom: spacing.sm },
  groupRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, borderRadius: radius.input, borderBottomWidth: 1, borderBottomColor: colors.hairline },
  groupRowSelected: { backgroundColor: colors.primarySoft },
  groupRowPressed: { backgroundColor: colors.surfaceSoft },
  groupCopy: { flex: 1 },
  groupName: { ...typography.body, color: colors.ink },
  groupMeta: { ...typography.caption, color: colors.muted },
  selectedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  actionRow: { minHeight: 48, justifyContent: 'center', paddingHorizontal: spacing.md, borderRadius: radius.input },
  actionRowPressed: { backgroundColor: colors.surfaceSoft },
  actionText: { ...typography.label, color: colors.primaryPressed },
});

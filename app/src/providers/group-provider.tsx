import * as SecureStore from 'expo-secure-store';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { listMyGroups } from '@/services/group-service';
import type { GroupSummary } from '@/types/groups';
import { useAuth } from '@/providers/auth-provider';

const SELECTED_GROUP_KEY = 'murmur.selected-group-id';

type GroupContextValue = {
  groups: GroupSummary[];
  loading: boolean;
  selectedGroup: GroupSummary | null;
  selectGroup: (groupId: string) => Promise<void>;
  refreshGroups: () => Promise<void>;
};

const GroupContext = createContext<GroupContextValue | null>(null);

export function GroupProvider({ children }: PropsWithChildren) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const groupsQuery = useQuery({
    queryKey: ['groups', session?.user.id],
    queryFn: listMyGroups,
    enabled: Boolean(session),
  });
  const groups = groupsQuery.data ?? EMPTY_GROUPS;

  useEffect(() => {
    if (!session) return;
    void getStoredGroupId().then(setSelectedGroupId);
  }, [session]);

  const selectedGroup = groups.find((group) => group.id === selectedGroupId) ?? groups[0] ?? null;
  const value: GroupContextValue = {
    groups,
    loading: groupsQuery.isLoading,
    selectedGroup,
    selectGroup: async (groupId) => {
      setSelectedGroupId(null);
      await setStoredGroupId(groupId);
      setSelectedGroupId(groupId);
    },
    refreshGroups: async () => {
      await queryClient.invalidateQueries({ queryKey: ['groups', session?.user.id] });
    },
  };

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
}

const EMPTY_GROUPS: GroupSummary[] = [];

function getStoredGroupId() {
  if (Platform.OS === 'web') return Promise.resolve(globalThis.localStorage?.getItem(SELECTED_GROUP_KEY) ?? null);
  return SecureStore.getItemAsync(SELECTED_GROUP_KEY);
}

function setStoredGroupId(groupId: string) {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(SELECTED_GROUP_KEY, groupId);
    return Promise.resolve();
  }
  return SecureStore.setItemAsync(SELECTED_GROUP_KEY, groupId);
}

export function useGroups() {
  const value = useContext(GroupContext);
  if (!value) throw new Error('useGroups must be used inside GroupProvider');
  return value;
}

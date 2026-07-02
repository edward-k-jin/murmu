import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/providers/auth-provider';

export default function GroupsLayout() {
  const { loading, session } = useAuth();

  if (!loading && !session) return <Redirect href="/" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}

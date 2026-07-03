import { Redirect, Stack, usePathname } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/bottom-nav';
import { colors, spacing } from '@/design/tokens';
import { useAuth } from '@/providers/auth-provider';

export default function GroupsLayout() {
  const { loading, session } = useAuth();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const showBottomNav = shouldShowBottomNav(pathname);

  if (!loading && !session) return <Redirect href="/" />;

  return (
    <View style={styles.container}>
      <Stack screenOptions={{ contentStyle: styles.content, headerShown: false }} />
      {showBottomNav ? (
        <View pointerEvents="box-none" style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <BottomNav />
        </View>
      ) : null}
    </View>
  );
}

function shouldShowBottomNav(pathname: string) {
  return pathname === '/groups'
    || pathname === '/groups/'
    || pathname === '/groups/group'
    || pathname.startsWith('/groups/monologues')
    || pathname === '/groups/my';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  content: { backgroundColor: colors.canvas },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
});

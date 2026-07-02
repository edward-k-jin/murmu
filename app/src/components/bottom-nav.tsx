import { type Href, usePathname, useRouter } from 'expo-router';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { SymbolView } from 'expo-symbols';
import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import type { SFSymbol } from 'sf-symbols-typescript';

import { colors, radius, spacing, typography } from '@/design/tokens';

const items: { label: string; path: string; icon: SFSymbol }[] = [
  { label: '공간', path: '/groups' as const, icon: 'square.grid.2x2.fill' as SFSymbol },
  { label: '혼잣말', path: '/groups/monologues' as const, icon: 'bubble.left.and.text.bubble.right.fill' as SFSymbol },
  { label: '나', path: '/groups/my' as const, icon: 'person.crop.circle.fill' as SFSymbol },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const glassAvailable = isLiquidGlassAvailable();
  const selectedIndex = useMemo(() => Math.max(0, items.findIndex((item) => isSelected(pathname, item.path))), [pathname]);
  const [navWidth, setNavWidth] = useState(0);
  const itemWidth = navWidth > 0 ? (navWidth - spacing.xs * 2) / items.length : 0;
  const [indicatorX] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!itemWidth) return;
    Animated.timing(indicatorX, {
      toValue: selectedIndex * itemWidth,
      duration: 160,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [indicatorX, itemWidth, selectedIndex]);

  return (
    <View style={styles.shell}>
      <View
        onLayout={(event) => setNavWidth(event.nativeEvent.layout.width)}
        style={[styles.nav, !glassAvailable && styles.navFallback]}>
        {glassAvailable ? (
          <GlassView
            colorScheme="light"
            glassEffectStyle="regular"
            isInteractive
            style={StyleSheet.absoluteFill}
            tintColor="rgba(255, 253, 252, 0.72)"
          />
        ) : null}
        <View style={styles.softHighlight} />
        {itemWidth ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.indicator,
              !glassAvailable && styles.indicatorFallback,
              { width: itemWidth, transform: [{ translateX: indicatorX }] },
            ]}
          />
        ) : null}
        {items.map((item) => {
          const selected = isSelected(pathname, item.path);
          return (
            <Pressable
              accessibilityLabel={`${item.label} 탭`}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              key={item.path}
              onPress={() => router.replace(item.path as Href)}
              style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}>
              <SymbolView
                fallback={<Text style={[styles.fallbackIcon, selected && styles.fallbackIconSelected]}>{item.label.slice(0, 1)}</Text>}
                name={item.icon}
                size={22}
                tintColor={selected ? colors.primary : colors.muted}
                type="hierarchical"
              />
              <Text style={[styles.label, selected && styles.labelSelected]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function isSelected(pathname: string, path: string) {
  const pathString = String(path);
  if (pathString === '/groups') return pathname === '/groups' || pathname === '/groups/';
  if (pathString === '/groups/monologues') return pathname.startsWith('/groups/monologues') || pathname.startsWith('/groups/compose');
  return pathname === pathString || pathname.startsWith(`${pathString}/`);
}

const styles = StyleSheet.create({
  shell: {
    width: '100%',
    alignItems: 'center',
  },
  nav: {
    width: '100%',
    maxWidth: 360,
    minHeight: 72,
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.72)',
    backgroundColor: 'rgba(255, 253, 252, 0.76)',
    padding: spacing.xs,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
  navFallback: {
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
  },
  softHighlight: {
    position: 'absolute',
    top: 1,
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
  },
  item: {
    flex: 1,
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.full,
  },
  itemPressed: {
    transform: [{ scale: 0.98 }],
  },
  indicator: {
    position: 'absolute',
    top: spacing.xs,
    bottom: spacing.xs,
    left: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.72)',
    backgroundColor: 'rgba(255, 255, 255, 0.68)',
  },
  indicatorFallback: {
    borderColor: colors.hairline,
    backgroundColor: colors.primarySoft,
  },
  label: { ...typography.caption, color: colors.muted },
  labelSelected: { color: colors.ink, fontWeight: '700' },
  fallbackIcon: { ...typography.label, color: colors.muted },
  fallbackIconSelected: { color: colors.primary },
});

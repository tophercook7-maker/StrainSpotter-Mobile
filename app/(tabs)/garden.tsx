import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth/AuthContext';
import { COLORS } from '@/constants/config';

interface Feature {
  icon: string;
  title: string;
  description: string;
  tier: 'free' | 'member' | 'pro';
  comingSoon?: boolean;
}

const FEATURES: Feature[] = [
  { icon: '🌱', title: 'Grow Tracker', description: 'Log and track every plant through each stage', tier: 'member' },
  { icon: '🤖', title: 'AI Grow Coach', description: 'GPT-4o-powered growing advice, anytime', tier: 'member' },
  { icon: '📓', title: 'Consumption Journal', description: 'Track mood, dosage, and strain effects', tier: 'member' },
  { icon: '⭐', title: 'Favorites Collection', description: 'Save and organize your best strains', tier: 'free' },
  { icon: '📊', title: 'Scan History', description: 'Full archive of every scan with notes', tier: 'free' },
  { icon: '🧬', title: 'Strain Database', description: '314+ strains with full cannabinoid profiles', tier: 'free' },
  { icon: '🏪', title: 'Dispensary Finder', description: 'Nearby dispensaries with live menus', tier: 'member' },
  { icon: '📸', title: 'Photo Journals', description: 'Timestamped grow photo documentation', tier: 'member' },
  { icon: '🌡️', title: 'Environment Logs', description: 'Track temp, humidity, pH for each grow', tier: 'pro' },
  { icon: '💬', title: 'Community', description: 'Grower threads, dispensary channels', tier: 'pro', comingSoon: true },
  { icon: '🔔', title: 'Grow Reminders', description: 'Push notifications for watering, feeding', tier: 'member', comingSoon: true },
  { icon: '📈', title: 'Yield Analytics', description: 'Yield estimates and harvest tracking', tier: 'pro', comingSoon: true },
];

const tierBadgeColor: Record<string, string> = {
  free: COLORS.textDim,
  member: COLORS.accentMuted,
  pro: COLORS.gold,
};

export default function GardenScreen() {
  const { tier, isMember, isPro, profile } = useAuth();

  const tierLabel = tier === 'pro' ? 'Pro' : tier === 'member' ? 'Member' : 'Free';
  const tierColor = tier === 'pro' ? COLORS.gold : tier === 'member' ? COLORS.accent : COLORS.textDim;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hey, {profile?.display_name || 'Grower'} 👋
          </Text>
          <Text style={styles.subGreeting}>Welcome to your Garden</Text>
        </View>
        <View style={[styles.tierBadge, { borderColor: tierColor }]}>
          <Text style={[styles.tierText, { color: tierColor }]}>{tierLabel}</Text>
        </View>
      </View>

      {!isMember && (
        <View style={styles.upgradeBanner}>
          <Text style={styles.upgradeTitle}>Unlock the full Garden 🌿</Text>
          <Text style={styles.upgradeBody}>
            Get the Grow Tracker, AI Coach, Consumption Journal, and more with a Member plan.
          </Text>
          <TouchableOpacity style={styles.upgradeBtn}>
            <Text style={styles.upgradeBtnText}>Upgrade — $4.99/mo</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionLabel}>Garden Features</Text>

      {FEATURES.map((f) => {
        const locked = (f.tier === 'member' && !isMember) || (f.tier === 'pro' && !isPro);
        return (
          <View
            key={f.title}
            style={[styles.featureCard, locked && styles.featureCardLocked]}
          >
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <View style={{ flex: 1 }}>
              <View style={styles.featureRow}>
                <Text style={[styles.featureTitle, locked && styles.textMuted]}>{f.title}</Text>
                {locked && <Ionicons name="lock-closed" size={14} color={COLORS.textDim} />}
                {f.comingSoon && (
                  <View style={styles.soonBadge}>
                    <Text style={styles.soonText}>Soon</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.featureDesc, locked && styles.textDim]}>{f.description}</Text>
            </View>
            <View style={[styles.tierDot, { backgroundColor: tierBadgeColor[f.tier] }]} />
          </View>
        );
      })}

      <Text style={styles.credit}>Made by mixedmakershop.com</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 16 },
  greeting: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  subGreeting: { fontSize: 14, color: COLORS.textMuted, marginTop: 2 },
  tierBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5 },
  tierText: { fontSize: 13, fontWeight: '700' },
  upgradeBanner: {
    margin: 20, marginTop: 4,
    backgroundColor: COLORS.surface,
    borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: COLORS.accent,
  },
  upgradeTitle: { fontSize: 17, fontWeight: '800', color: COLORS.accent, marginBottom: 6 },
  upgradeBody: { fontSize: 13, color: COLORS.textMuted, lineHeight: 19, marginBottom: 16 },
  upgradeBtn: { backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  upgradeBtnText: { color: '#000', fontWeight: '700', fontSize: 15 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textDim, letterSpacing: 1.5, textTransform: 'uppercase', paddingHorizontal: 20, marginBottom: 8 },
  featureCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16, marginBottom: 8,
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: COLORS.border, gap: 12,
  },
  featureCardLocked: { opacity: 0.55 },
  featureIcon: { fontSize: 26 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  featureTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  featureDesc: { fontSize: 12, color: COLORS.textMuted },
  textMuted: { color: COLORS.textMuted },
  textDim: { color: COLORS.textDim },
  tierDot: { width: 8, height: 8, borderRadius: 4 },
  soonBadge: { backgroundColor: COLORS.warning + '25', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  soonText: { fontSize: 10, color: COLORS.warning, fontWeight: '700' },
  credit: { textAlign: 'center', color: COLORS.textDim, fontSize: 12, marginTop: 28 },
});

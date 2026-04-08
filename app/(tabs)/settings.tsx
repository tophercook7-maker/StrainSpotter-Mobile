import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/lib/auth/AuthContext';
import { COLORS } from '@/constants/config';

function SettingRow({
  icon, label, value, onPress, destructive,
}: {
  icon: string; label: string; value?: string;
  onPress?: () => void; destructive?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress}>
      <Ionicons name={icon as any} size={20} color={destructive ? COLORS.error : COLORS.textMuted} style={styles.rowIcon} />
      <Text style={[styles.rowLabel, destructive && styles.destructive]}>{label}</Text>
      <View style={{ flex: 1 }} />
      {value && <Text style={styles.rowValue}>{value}</Text>}
      {onPress && <Ionicons name="chevron-forward" size={16} color={COLORS.textDim} />}
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function SettingsScreen() {
  const { user, profile, tier, signOut } = useAuth();

  const tierLabel = tier === 'pro' ? 'Pro' : tier === 'member' ? 'Member' : 'Free';
  const tierColor = tier === 'pro' ? COLORS.gold : tier === 'member' ? COLORS.accent : COLORS.textDim;

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {user && (
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(profile?.display_name || user.email || '?')[0].toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.profileName}>{profile?.display_name || 'Grower'}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
            <View style={[styles.tierBadge, { borderColor: tierColor }]}>
              <Text style={[styles.tierText, { color: tierColor }]}>{tierLabel} Plan</Text>
            </View>
          </View>
        </View>
      )}

      <SectionHeader title="Account" />
      <View style={styles.section}>
        <SettingRow icon="person-outline" label="Display Name" value={profile?.display_name || '—'} />
        <SettingRow icon="mail-outline" label="Email" value={user?.email || '—'} />
        <SettingRow
          icon="card-outline"
          label="Manage Subscription"
          onPress={() => Linking.openURL('https://strainspotter.vercel.app/garden/settings')}
        />
      </View>

      <SectionHeader title="App" />
      <View style={styles.section}>
        <SettingRow icon="leaf-outline" label="Strain Database" value="314 strains" />
        <SettingRow
          icon="shield-checkmark-outline"
          label="Privacy Policy"
          onPress={() => Linking.openURL('https://strainspotter.vercel.app/privacy')}
        />
        <SettingRow
          icon="document-text-outline"
          label="Terms of Service"
          onPress={() => Linking.openURL('https://strainspotter.vercel.app/terms')}
        />
        <SettingRow
          icon="help-circle-outline"
          label="Support"
          onPress={() => Linking.openURL('mailto:support@mixedmakershop.com')}
        />
      </View>

      <SectionHeader title="About" />
      <View style={styles.section}>
        <SettingRow icon="information-circle-outline" label="Version" value="1.0.0" />
        <SettingRow icon="code-slash-outline" label="Built with" value="Expo + Supabase" />
      </View>

      {user && (
        <>
          <SectionHeader title="" />
          <View style={styles.section}>
            <SettingRow icon="log-out-outline" label="Sign Out" onPress={handleSignOut} destructive />
          </View>
        </>
      )}

      <Text style={styles.credit}>Made by mixedmakershop.com</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    margin: 20, padding: 20,
    backgroundColor: COLORS.surface, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.border,
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.accentMuted, justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 24, fontWeight: '800', color: '#fff' },
  profileName: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  profileEmail: { fontSize: 13, color: COLORS.textMuted, marginBottom: 6 },
  tierBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, borderWidth: 1, alignSelf: 'flex-start' },
  tierText: { fontSize: 12, fontWeight: '700' },
  sectionHeader: { fontSize: 11, fontWeight: '700', color: COLORS.textDim, letterSpacing: 1.5, textTransform: 'uppercase', paddingHorizontal: 20, paddingVertical: 10 },
  section: { backgroundColor: COLORS.surface, marginHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.borderMuted },
  rowIcon: { marginRight: 12 },
  rowLabel: { fontSize: 15, color: COLORS.text },
  rowValue: { fontSize: 14, color: COLORS.textMuted, marginRight: 8 },
  destructive: { color: COLORS.error },
  credit: { textAlign: 'center', color: COLORS.textDim, fontSize: 12, marginTop: 32 },
});

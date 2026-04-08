import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth/AuthContext';
import { COLORS } from '@/constants/config';

interface ScanRecord {
  id: string;
  strain_name: string;
  confidence: number;
  type: string;
  effects: string[];
  image_url: string | null;
  created_at: string;
}

const typeColors: Record<string, string> = {
  Sativa: '#22D3EE',
  Indica: '#A855F7',
  Hybrid: COLORS.accent,
  CBD: '#F59E0B',
};

export default function HistoryScreen() {
  const { isLoggedIn, session } = useAuth();
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    loadHistory();
  }, [isLoggedIn]);

  const loadHistory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('scan_history')
      .select('id, strain_name, confidence, type, effects, image_url, created_at')
      .eq('user_id', session!.user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    if (!error && data) setScans(data as ScanRecord[]);
    setLoading(false);
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.center}>
        <Ionicons name="time-outline" size={56} color={COLORS.textDim} />
        <Text style={styles.emptyTitle}>Sign in to see your history</Text>
        <Text style={styles.emptyBody}>All your scans sync across devices automatically.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.accent} />
      </View>
    );
  }

  if (scans.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="scan-circle-outline" size={56} color={COLORS.textDim} />
        <Text style={styles.emptyTitle}>No scans yet</Text>
        <Text style={styles.emptyBody}>Head to the Scanner tab and identify your first strain.</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={scans}
      keyExtractor={item => item.id}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      renderItem={({ item }) => {
        const typeColor = typeColors[item.type] || COLORS.textMuted;
        const date = new Date(item.created_at);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        return (
          <View style={styles.card}>
            {item.image_url && (
              <Image source={{ uri: item.image_url }} style={styles.thumb} resizeMode="cover" />
            )}
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.strainName} numberOfLines={1}>{item.strain_name}</Text>
                <Text style={[styles.confidence, { color: item.confidence >= 75 ? COLORS.accent : COLORS.warning }]}>
                  {item.confidence}%
                </Text>
              </View>
              <View style={styles.cardMeta}>
                {item.type && (
                  <View style={[styles.typeBadge, { borderColor: typeColor }]}>
                    <Text style={[styles.typeText, { color: typeColor }]}>{item.type}</Text>
                  </View>
                )}
                <Text style={styles.dateText}>{dateStr}</Text>
              </View>
              {item.effects && item.effects.length > 0 && (
                <Text style={styles.effects} numberOfLines={1}>
                  {item.effects.slice(0, 3).join(' · ')}
                </Text>
              )}
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background, padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: 16, marginBottom: 8 },
  emptyBody: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.border,
    flexDirection: 'row', overflow: 'hidden',
  },
  thumb: { width: 80, height: 80 },
  cardContent: { flex: 1, padding: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  strainName: { fontSize: 16, fontWeight: '700', color: COLORS.text, flex: 1, marginRight: 8 },
  confidence: { fontSize: 15, fontWeight: '800' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1 },
  typeText: { fontSize: 11, fontWeight: '700' },
  dateText: { fontSize: 12, color: COLORS.textDim },
  effects: { fontSize: 12, color: COLORS.textMuted },
});

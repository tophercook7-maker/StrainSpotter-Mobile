import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/config';

interface ScanResultProps {
  result: {
    strain_name?: string;
    confidence?: number;
    type?: string;
    thc_range?: string;
    cbd_range?: string;
    effects?: string[];
    terpenes?: string[];
    flavors?: string[];
    description?: string;
    medical_uses?: string[];
    grow_difficulty?: string;
    similar_strains?: string[];
  };
  onScanAgain: () => void;
}

const typeColors: Record<string, string> = {
  Sativa: '#22D3EE',
  Indica: '#A855F7',
  Hybrid: COLORS.accent,
  CBD: '#F59E0B',
};

function Pill({ label, color }: { label: string; color?: string }) {
  return (
    <View style={[styles.pill, { borderColor: color || COLORS.border, backgroundColor: color ? `${color}18` : COLORS.surfaceElevated }]}>
      <Text style={[styles.pillText, { color: color || COLORS.textMuted }]}>{label}</Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function ScanResult({ result, onScanAgain }: ScanResultProps) {
  const typeColor = typeColors[result.type || ''] || COLORS.accent;
  const confidence = result.confidence ?? 0;
  const confidenceColor = confidence >= 80 ? COLORS.accent : confidence >= 60 ? COLORS.warning : COLORS.error;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.strainName}>{result.strain_name || 'Unknown Strain'}</Text>
            <View style={styles.badges}>
              {result.type && <Pill label={result.type} color={typeColor} />}
              {result.grow_difficulty && <Pill label={`${result.grow_difficulty} Grow`} />}
            </View>
          </View>
          <View style={styles.confidenceBox}>
            <Text style={[styles.confidenceNum, { color: confidenceColor }]}>{confidence}%</Text>
            <Text style={styles.confidenceLabel}>Match</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {(result.thc_range || result.cbd_range) && (
          <Section title="Cannabinoids">
            <View style={styles.row}>
              {result.thc_range && (
                <View style={styles.cannabinoidBox}>
                  <Text style={styles.cannabinoidLabel}>THC</Text>
                  <Text style={styles.cannabinoidValue}>{result.thc_range}</Text>
                </View>
              )}
              {result.cbd_range && (
                <View style={styles.cannabinoidBox}>
                  <Text style={styles.cannabinoidLabel}>CBD</Text>
                  <Text style={styles.cannabinoidValue}>{result.cbd_range}</Text>
                </View>
              )}
            </View>
          </Section>
        )}

        {result.effects && result.effects.length > 0 && (
          <Section title="Effects">
            <View style={styles.pillRow}>
              {result.effects.map(e => <Pill key={e} label={e} color={COLORS.accent} />)}
            </View>
          </Section>
        )}

        {result.terpenes && result.terpenes.length > 0 && (
          <Section title="Terpenes">
            <View style={styles.pillRow}>
              {result.terpenes.map(t => <Pill key={t} label={t} color={COLORS.purple} />)}
            </View>
          </Section>
        )}

        {result.flavors && result.flavors.length > 0 && (
          <Section title="Flavors">
            <View style={styles.pillRow}>
              {result.flavors.map(f => <Pill key={f} label={f} />)}
            </View>
          </Section>
        )}

        {result.description && (
          <Section title="About">
            <Text style={styles.description}>{result.description}</Text>
          </Section>
        )}

        {result.medical_uses && result.medical_uses.length > 0 && (
          <Section title="Medical Uses">
            <View style={styles.pillRow}>
              {result.medical_uses.map(m => <Pill key={m} label={m} color={COLORS.blue} />)}
            </View>
          </Section>
        )}

        {result.similar_strains && result.similar_strains.length > 0 && (
          <Section title="Similar Strains">
            <View style={styles.pillRow}>
              {result.similar_strains.map(s => <Pill key={s} label={s} />)}
            </View>
          </Section>
        )}

        <View style={styles.accuracyNote}>
          <Ionicons name="information-circle-outline" size={16} color={COLORS.textDim} />
          <Text style={styles.accuracyText}>
            {'  '}AI identification is based on visual analysis. Confidence varies by image quality,
            lighting, and strain similarity. Not medical or legal advice.
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.scanAgainBtn} onPress={onScanAgain}>
        <Ionicons name="scan-circle-outline" size={20} color="#000" />
        <Text style={styles.scanAgainText}>  Scan Another</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  strainName: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  confidenceBox: { alignItems: 'center', minWidth: 60 },
  confidenceNum: { fontSize: 28, fontWeight: '800' },
  confidenceLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: 16 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 12 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  pillText: { fontSize: 12, fontWeight: '600' },
  cannabinoidBox: {
    flex: 1, backgroundColor: COLORS.surfaceElevated,
    borderRadius: 12, padding: 12, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  cannabinoidLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '700', textTransform: 'uppercase' },
  cannabinoidValue: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: 2 },
  description: { fontSize: 14, color: COLORS.textMuted, lineHeight: 21 },
  accuracyNote: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 8, padding: 12, backgroundColor: COLORS.surfaceElevated, borderRadius: 10 },
  accuracyText: { flex: 1, fontSize: 11, color: COLORS.textDim, lineHeight: 16 },
  scanAgainBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.accent, borderRadius: 16,
    paddingVertical: 16, marginTop: 16,
  },
  scanAgainText: { fontSize: 16, fontWeight: '700', color: '#000' },
});

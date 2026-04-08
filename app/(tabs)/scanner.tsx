import { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Alert, Dimensions, Image,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth/AuthContext';
import { COLORS, API_BASE_URL } from '@/constants/config';
import { ScanResult } from '@/components/scanner/ScanResult';

const { width: SCREEN_W } = Dimensions.get('window');

export default function ScannerScreen() {
  const { tier, isLoggedIn } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<'camera' | 'result'>('camera');
  const [scanning, setScanning] = useState(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const cameraRef = useRef<CameraView>(null);

  const compressImage = async (uri: string): Promise<string> => {
    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1024 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    const base64 = await FileSystem.readAsStringAsync(manipulated.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:image/jpeg;base64,${base64}`;
  };

  const runScan = async (uri: string) => {
    setScanning(true);
    setCapturedUri(uri);
    try {
      const imageData = await compressImage(uri);
      const response = await fetch(`${API_BASE_URL}/api/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData, tier, source: 'mobile' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Scan failed');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setResult(data);
      setMode('result');
    } catch (err: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Scan Failed', err.message || 'Something went wrong. Try again.');
    } finally {
      setScanning(false);
    }
  };

  const takePhoto = async () => {
    if (!cameraRef.current || scanning) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
    if (photo?.uri) await runScan(photo.uri);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo library access to scan saved images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0]) {
      await runScan(result.assets[0].uri);
    }
  };

  const reset = () => {
    setMode('camera');
    setResult(null);
    setCapturedUri(null);
  };

  if (mode === 'result' && result) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        {capturedUri && (
          <Image source={{ uri: capturedUri }} style={styles.resultImage} resizeMode="cover" />
        )}
        <ScanResult result={result} onScanAgain={reset} />
      </ScrollView>
    );
  }

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.accent} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permText}>Camera access needed to scan strains</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <View style={styles.overlay}>
          <View style={styles.frameOuter}>
            <View style={styles.frame}>
              <View style={[styles.corner, styles.tl]} />
              <View style={[styles.corner, styles.tr]} />
              <View style={[styles.corner, styles.bl]} />
              <View style={[styles.corner, styles.br]} />
            </View>
          </View>
          <Text style={styles.hint}>
            {scanning ? 'Analyzing strain...' : 'Point at any cannabis sample'}
          </Text>
        </View>
      </CameraView>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.galleryBtn} onPress={pickImage} disabled={scanning}>
          <Ionicons name="images-outline" size={28} color={COLORS.text} />
          <Text style={styles.galleryLabel}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.captureBtn, scanning && styles.captureBtnDisabled]}
          onPress={takePhoto}
          disabled={scanning}
        >
          {scanning ? (
            <ActivityIndicator color={COLORS.background} size="large" />
          ) : (
            <View style={styles.captureInner} />
          )}
        </TouchableOpacity>

        <View style={{ width: 72 }}>
          {!isLoggedIn && (
            <Text style={styles.guestBadge}>3 free{'\n'}scans/day</Text>
          )}
        </View>
      </View>

      {scanning && (
        <View style={styles.scanningBanner}>
          <ActivityIndicator color={COLORS.accent} size="small" />
          <Text style={styles.scanningText}>  GPT-4o Vision analyzing...</Text>
        </View>
      )}
    </View>
  );
}

const FRAME = SCREEN_W * 0.72;
const CORNER = 28;
const BORDER = 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background, padding: 32 },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  frameOuter: { width: FRAME, height: FRAME, justifyContent: 'center', alignItems: 'center' },
  frame: { width: FRAME, height: FRAME, position: 'relative' },
  corner: { position: 'absolute', width: CORNER, height: CORNER, borderColor: COLORS.accent, borderWidth: BORDER },
  tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 6 },
  tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 6 },
  bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 6 },
  br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 6 },
  hint: { color: '#fff', fontSize: 14, marginTop: 20, fontWeight: '500', textShadowColor: '#000', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, paddingBottom: 12, backgroundColor: '#000' },
  galleryBtn: { width: 72, alignItems: 'center' },
  galleryLabel: { color: COLORS.textMuted, fontSize: 11, marginTop: 4 },
  captureBtn: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#fff' },
  captureBtnDisabled: { opacity: 0.6 },
  captureInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff' },
  guestBadge: { color: COLORS.textDim, fontSize: 11, textAlign: 'center' },
  resultImage: { width: SCREEN_W, height: 260 },
  scanningBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface, padding: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  scanningText: { color: COLORS.text, fontSize: 14 },
  permText: { color: COLORS.text, fontSize: 16, textAlign: 'center', marginBottom: 24 },
  permBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  permBtnText: { color: '#000', fontWeight: '700', fontSize: 16 },
});

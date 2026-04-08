import { Redirect } from 'expo-router';
import { useAuth } from '@/lib/auth/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { COLORS } from '@/constants/config';

export default function Index() {
  const { isLoading, isLoggedIn } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  return <Redirect href={isLoggedIn ? '/(tabs)/scanner' : '/(auth)/login'} />;
}

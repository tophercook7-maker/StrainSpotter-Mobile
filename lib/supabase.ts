import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/constants/config';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          membership: 'free' | 'garden' | 'pro' | 'elite' | 'standard' | null;
          display_name: string | null;
          user_type: string | null;
          experience_level: string | null;
          interests: string[] | null;
          location_text: string | null;
          moderator_interest: boolean;
          onboarding_completed: boolean;
          is_owner: boolean;
        };
      };
      scan_history: {
        Row: {
          id: string;
          user_id: string;
          strain_name: string;
          confidence: number;
          type: string;
          effects: string[];
          terpenes: string[];
          image_url: string | null;
          created_at: string;
          raw_ai_response: any;
        };
      };
      user_grows: {
        Row: {
          id: string;
          user_id: string;
          strain_name: string;
          stage: string;
          notes: string | null;
          started_at: string;
          updated_at: string;
          photo_url: string | null;
        };
      };
    };
  };
};

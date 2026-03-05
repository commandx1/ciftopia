import { Platform } from 'react-native';
import Constants from 'expo-constants';

const extra = (Constants.expoConfig as any)?.extra ?? {};

export function getRevenueCatApiKey(): string {
  const ios = extra.revenueCatApiKeyIos ?? '';
  const android = extra.revenueCatApiKeyAndroid ?? '';
  return Platform.OS === 'ios' ? ios : android;
}

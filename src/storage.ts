import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACTIVITIES, DEFAULT_PRICES, STORAGE_KEY } from './constants';
import type { ActivityPrice } from './types';

export async function loadPrices(): Promise<ActivityPrice[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_PRICES];

    const saved = JSON.parse(raw) as ActivityPrice[];
    return ACTIVITIES.map((def) => {
      const match = saved.find((p) => p.id === def.id);
      return (
        match ?? {
          id: def.id,
          price: def.defaultPrice,
          unit: def.unit,
          enabled: true,
        }
      );
    });
  } catch {
    return [...DEFAULT_PRICES];
  }
}

export async function savePrices(prices: ActivityPrice[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prices));
}

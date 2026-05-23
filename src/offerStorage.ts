import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OfferProfile } from './types';

export const OFFER_STORAGE_KEY = '@renovation_offer_profile_v1';

export const DEFAULT_OFFER_PROFILE: OfferProfile = {
  companyName: '',
  companyPhone: '',
  companyEmail: '',
  companyAddress: '',
  clientName: '',
  clientPhone: '',
  projectAddress: '',
  offerNotes:
    'Офертата е ориентировъчна. Крайната цена може да се уточни след оглед на обекта. Цените не включват материали, освен ако не е уговорено друго.',
  validityDays: '14',
};

export async function loadOfferProfile(): Promise<OfferProfile> {
  try {
    const raw = await AsyncStorage.getItem(OFFER_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_OFFER_PROFILE };
    return { ...DEFAULT_OFFER_PROFILE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_OFFER_PROFILE };
  }
}

export async function saveOfferProfile(profile: OfferProfile): Promise<void> {
  await AsyncStorage.setItem(OFFER_STORAGE_KEY, JSON.stringify(profile));
}

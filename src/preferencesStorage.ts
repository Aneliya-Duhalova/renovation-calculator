import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OpeningsTreatment } from './types';

const OPENINGS_TREATMENT_KEY = '@mr_ru_openings_treatment_v2';

export const DEFAULT_OPENINGS_TREATMENT: OpeningsTreatment = 'include_in_wall_area';

export async function loadOpeningsTreatment(): Promise<OpeningsTreatment> {
  try {
    const raw = await AsyncStorage.getItem(OPENINGS_TREATMENT_KEY);
    if (raw === 'subtract_and_linear' || raw === 'include_in_wall_area') return raw;
    return DEFAULT_OPENINGS_TREATMENT;
  } catch {
    return DEFAULT_OPENINGS_TREATMENT;
  }
}

export async function saveOpeningsTreatment(treatment: OpeningsTreatment): Promise<void> {
  await AsyncStorage.setItem(OPENINGS_TREATMENT_KEY, treatment);
}

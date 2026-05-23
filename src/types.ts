export type PriceUnit = 'm2' | 'lm';

export type ActivityId =
  | 'drywall'
  | 'putty_one'
  | 'putty_two'
  | 'paint'
  | 'frieze'
  | 'grout'
  | 'wallpaper_removal'
  | 'primer';

export interface ActivityDefinition {
  id: ActivityId;
  name: string;
  description: string;
  defaultPrice: number;
  unit: PriceUnit;
}

export interface ActivityPrice {
  id: ActivityId;
  price: number;
  unit: PriceUnit;
  enabled: boolean;
}

export interface DimensionItem {
  id: string;
  width: string;
  height: string;
  label: string;
}

export interface CalculationResult {
  grossArea: number;
  openingsArea: number;
  netArea: number;
  linearMeters: number;
  lines: { id: ActivityId; name: string; quantity: number; unit: PriceUnit; unitPrice: number; total: number }[];
  grandTotal: number;
}

export interface OfferProfile {
  companyName: string;
  companyPhone: string;
  companyEmail: string;
  companyAddress: string;
  clientName: string;
  clientPhone: string;
  projectAddress: string;
  offerNotes: string;
  validityDays: string;
}

export interface OfferPdfInput {
  profile: OfferProfile;
  offerNumber: string;
  offerDate: string;
  walls: DimensionItem[];
  openings: DimensionItem[];
  perimeterLm: string;
  result: CalculationResult;
}

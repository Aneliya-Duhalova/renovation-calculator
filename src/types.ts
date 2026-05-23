export type PriceUnit = 'm2' | 'lm';

export type ActivityCategory = 'drywall' | 'finish' | 'plumbing' | 'electrical';

export type ActivityId =
  | 'drywall_lining'
  | 'drywall_partition'
  | 'drywall_double'
  | 'putty_joints'
  | 'openings_wrap'
  | 'putty_two_fine'
  | 'sanding'
  | 'primer'
  | 'paint_one'
  | 'paint_multi'
  | 'plumb_sink'
  | 'plumb_toilet'
  | 'plumb_boiler'
  | 'plumb_pipes'
  | 'plumb_drain'
  | 'electro_outlets'
  | 'electro_lighting'
  | 'electro_panel'
  | 'electro_cables';

export interface ActivityDefinition {
  id: ActivityId;
  category: ActivityCategory;
  name: string;
  description: string;
  defaultPrice: number;
  unit: PriceUnit;
  priceOnRequest?: boolean;
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

export interface CostLine {
  id: ActivityId;
  name: string;
  quantity: number;
  unit: PriceUnit;
  unitPrice: number;
  total: number;
  priceOnRequest?: boolean;
}

export interface CalculationResult {
  grossArea: number;
  openingsArea: number;
  netArea: number;
  openingsPerimeter: number;
  linearMeters: number;
  lines: CostLine[];
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

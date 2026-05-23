import { ACTIVITIES } from './constants';
import type {
  ActivityId,
  ActivityPrice,
  CalculationResult,
  DimensionItem,
  OpeningsTreatment,
} from './types';

function parseDim(value: string): number {
  const n = parseFloat(value.replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function areaFromItem(item: DimensionItem): number {
  return parseDim(item.width) * parseDim(item.height);
}

export function sumAreas(items: DimensionItem[]): number {
  return items.reduce((sum, item) => sum + areaFromItem(item), 0);
}

export function perimeterFromWalls(walls: DimensionItem[]): number {
  return walls.reduce((sum, wall) => {
    const w = parseDim(wall.width);
    const h = parseDim(wall.height);
    if (w <= 0 || h <= 0) return sum;
    return sum + 2 * (w + h);
  }, 0);
}

export function perimeterFromOpenings(openings: DimensionItem[]): number {
  return openings.reduce((sum, opening) => {
    const w = parseDim(opening.width);
    const h = parseDim(opening.height);
    if (w <= 0 || h <= 0) return sum;
    return sum + 2 * (w + h);
  }, 0);
}

export function wrapLinearMeters(
  openings: DimensionItem[],
  perimeterLm: string,
  treatment: OpeningsTreatment,
): number {
  if (treatment !== 'subtract_and_linear') return 0;

  const manual = parseDim(perimeterLm);
  if (manual > 0) return manual;

  return perimeterFromOpenings(openings);
}

function quantityForActivity(
  activityId: ActivityId,
  unit: ActivityPrice['unit'],
  walls: DimensionItem[],
  openings: DimensionItem[],
  perimeterLm: string,
  netArea: number,
  treatment: OpeningsTreatment,
  wrapLm: number,
): number {
  if (unit === 'm2') return netArea;

  if (activityId === 'openings_wrap') {
    return wrapLm;
  }

  const manual = parseDim(perimeterLm);
  return manual > 0 ? manual : perimeterFromWalls(walls);
}

export function calculateCosts(
  walls: DimensionItem[],
  openings: DimensionItem[],
  perimeterLm: string,
  openingsTreatment: OpeningsTreatment,
  selectedIds: Set<string>,
  prices: ActivityPrice[],
): CalculationResult {
  const grossArea = sumAreas(walls);
  const openingsArea = sumAreas(openings);
  const openingsPerimeter = perimeterFromOpenings(openings);
  const subtractOpeningsFromArea = openingsTreatment === 'subtract_and_linear';
  const netArea = subtractOpeningsFromArea
    ? Math.max(0, grossArea - openingsArea)
    : grossArea;
  const wrapLm = wrapLinearMeters(openings, perimeterLm, openingsTreatment);

  const lines: CalculationResult['lines'] = [];
  let grandTotal = 0;

  for (const activity of ACTIVITIES) {
    if (!selectedIds.has(activity.id)) continue;

    const priceRow = prices.find((p) => p.id === activity.id);
    if (!priceRow || !priceRow.enabled) continue;

    const onRequest = Boolean(activity.priceOnRequest);

    const quantity = quantityForActivity(
      activity.id,
      priceRow.unit,
      walls,
      openings,
      perimeterLm,
      netArea,
      openingsTreatment,
      wrapLm,
    );

    if (!onRequest && quantity <= 0) continue;

    if (onRequest) {
      lines.push({
        id: activity.id,
        name: activity.name,
        quantity: quantity > 0 ? quantity : 1,
        unit: priceRow.unit,
        unitPrice: 0,
        total: 0,
        priceOnRequest: true,
      });
      continue;
    }

    const total = quantity * priceRow.price;
    grandTotal += total;

    lines.push({
      id: activity.id,
      name: activity.name,
      quantity,
      unit: priceRow.unit,
      unitPrice: priceRow.price,
      total,
    });
  }

  return {
    grossArea,
    openingsArea,
    netArea,
    openingsPerimeter,
    openingsTreatment,
    subtractOpeningsFromArea,
    wrapLinearMeters: wrapLm,
    lines,
    grandTotal,
  };
}

export function openingsTreatmentLabel(treatment: OpeningsTreatment): string {
  return treatment === 'subtract_and_linear'
    ? 'Изваждат се от м²; обръщане на л.м.'
    : 'Включени в площта на стените (м²)';
}

export function formatArea(value: number): string {
  return value.toFixed(2);
}

export function formatMoney(value: number): string {
  return value.toFixed(2);
}

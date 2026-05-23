import { ACTIVITIES } from './constants';
import type { ActivityId, ActivityPrice, CalculationResult, DimensionItem } from './types';

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

function quantityForActivity(
  activityId: ActivityId,
  unit: ActivityPrice['unit'],
  walls: DimensionItem[],
  openings: DimensionItem[],
  perimeterLm: string,
  netArea: number,
): number {
  if (unit === 'm2') return netArea;

  if (activityId === 'openings_wrap') {
    const fromOpenings = perimeterFromOpenings(openings);
    if (fromOpenings > 0) return fromOpenings;
    const manual = parseDim(perimeterLm);
    return manual > 0 ? manual : 0;
  }

  const manual = parseDim(perimeterLm);
  return manual > 0 ? manual : perimeterFromWalls(walls);
}

export function calculateCosts(
  walls: DimensionItem[],
  openings: DimensionItem[],
  perimeterLm: string,
  selectedIds: Set<string>,
  prices: ActivityPrice[],
): CalculationResult {
  const grossArea = sumAreas(walls);
  const openingsArea = sumAreas(openings);
  const netArea = Math.max(0, grossArea - openingsArea);
  const openingsPerimeter = perimeterFromOpenings(openings);

  const parsedPerimeter = parseDim(perimeterLm);
  const linearMeters =
    parsedPerimeter > 0 ? parsedPerimeter : perimeterFromWalls(walls);

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
    linearMeters,
    lines,
    grandTotal,
  };
}

export function formatArea(value: number): string {
  return value.toFixed(2);
}

export function formatMoney(value: number): string {
  return value.toFixed(2);
}

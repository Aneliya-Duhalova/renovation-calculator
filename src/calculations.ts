import { ACTIVITIES } from './constants';
import type { ActivityPrice, CalculationResult, DimensionItem } from './types';

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

  const parsedPerimeter = parseDim(perimeterLm);
  const linearMeters =
    parsedPerimeter > 0 ? parsedPerimeter : perimeterFromWalls(walls);

  const lines: CalculationResult['lines'] = [];
  let grandTotal = 0;

  for (const activity of ACTIVITIES) {
    if (!selectedIds.has(activity.id)) continue;

    const priceRow = prices.find((p) => p.id === activity.id);
    if (!priceRow || !priceRow.enabled) continue;

    const quantity = priceRow.unit === 'lm' ? linearMeters : netArea;
    if (quantity <= 0) continue;

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

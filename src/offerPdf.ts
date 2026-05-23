import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';
import { areaFromItem, formatArea, formatMoney } from './calculations';
import { CURRENCY } from './constants';
import type { DimensionItem, OfferPdfInput, PriceUnit } from './types';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function unitLabel(unit: PriceUnit): string {
  return unit === 'lm' ? 'л.м.' : 'м²';
}

function dimRow(item: DimensionItem): string {
  const w = item.width || '—';
  const h = item.height || '—';
  const area = areaFromItem(item);
  const label = escapeHtml(item.label || '—');
  return `<tr>
    <td>${label}</td>
    <td class="num">${escapeHtml(w)}</td>
    <td class="num">${escapeHtml(h)}</td>
    <td class="num">${area > 0 ? formatArea(area) : '—'}</td>
  </tr>`;
}

function buildDimensionsTable(
  title: string,
  items: DimensionItem[],
  emptyText: string,
): string {
  if (items.length === 0) {
    return `<p class="muted">${escapeHtml(emptyText)}</p>`;
  }

  const rows = items.map(dimRow).join('');
  const total = items.reduce((s, i) => s + areaFromItem(i), 0);

  return `
    <h3>${escapeHtml(title)}</h3>
    <table class="dims">
      <thead>
        <tr>
          <th>Описание</th>
          <th class="num">Ширина (м)</th>
          <th class="num">Височина (м)</th>
          <th class="num">Площ (м²)</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr>
          <td colspan="3"><strong>Общо</strong></td>
          <td class="num"><strong>${formatArea(total)}</strong></td>
        </tr>
      </tfoot>
    </table>`;
}

export function buildOfferHtml(input: OfferPdfInput): string {
  const { profile, offerNumber, offerDate, walls, openings, perimeterLm, result } =
    input;

  const validity = parseInt(profile.validityDays, 10);
  const validityText = Number.isFinite(validity) && validity > 0 ? `${validity}` : '14';

  const companyBlock =
    profile.companyName ||
    profile.companyPhone ||
    profile.companyEmail ||
    profile.companyAddress
      ? `
      <div class="party">
        <div class="party-label">Изпълнител</div>
        ${profile.companyName ? `<div class="party-name">${escapeHtml(profile.companyName)}</div>` : ''}
        ${profile.companyPhone ? `<div>${escapeHtml(profile.companyPhone)}</div>` : ''}
        ${profile.companyEmail ? `<div>${escapeHtml(profile.companyEmail)}</div>` : ''}
        ${profile.companyAddress ? `<div>${escapeHtml(profile.companyAddress)}</div>` : ''}
      </div>`
      : '';

  const clientBlock =
    profile.clientName ||
    profile.clientPhone ||
    profile.projectAddress
      ? `
      <div class="party">
        <div class="party-label">Клиент / обект</div>
        ${profile.clientName ? `<div class="party-name">${escapeHtml(profile.clientName)}</div>` : ''}
        ${profile.clientPhone ? `<div>${escapeHtml(profile.clientPhone)}</div>` : ''}
        ${profile.projectAddress ? `<div>${escapeHtml(profile.projectAddress)}</div>` : ''}
      </div>`
      : '';

  const lineRows = result.lines
    .map(
      (line, index) => `
      <tr>
        <td class="num">${index + 1}</td>
        <td>${escapeHtml(line.name)}</td>
        <td class="num">${formatArea(line.quantity)} ${unitLabel(line.unit)}</td>
        <td class="num">${line.priceOnRequest ? 'По договаряне' : `${formatMoney(line.unitPrice)} ${CURRENCY}`}</td>
        <td class="num">${line.priceOnRequest ? '—' : `${formatMoney(line.total)} ${CURRENCY}`}</td>
      </tr>`,
    )
    .join('');

  const notesBlock = profile.offerNotes.trim()
    ? `<div class="notes"><strong>Бележки:</strong><br/>${escapeHtml(profile.offerNotes).replace(/\n/g, '<br/>')}</div>`
    : '';

  const perimeterNote =
    result.openingsPerimeter > 0
      ? `Периметър на отвори: ${formatArea(result.openingsPerimeter)} л.м.`
      : perimeterLm.trim().length > 0
        ? `Ръчно въведени л.м.: ${escapeHtml(perimeterLm)}`
        : 'Добавете прозорци/врати за обръщане на отвори';

  return `<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="utf-8" />
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 11pt;
      color: #1a1d21;
      margin: 32px;
      line-height: 1.45;
    }
    .header {
      border-bottom: 3px solid #1b6b4a;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .title {
      font-size: 22pt;
      font-weight: 800;
      color: #1b6b4a;
      margin: 0 0 8px 0;
    }
    .meta { color: #5c6570; font-size: 10pt; }
    .meta span { margin-right: 16px; }
    .parties {
      display: flex;
      gap: 24px;
      margin-bottom: 24px;
    }
    .party { flex: 1; background: #f4f6f8; padding: 12px 14px; border-radius: 8px; }
    .party-label {
      font-size: 9pt;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #5c6570;
      margin-bottom: 6px;
    }
    .party-name { font-weight: 700; font-size: 12pt; margin-bottom: 4px; }
    h2 {
      font-size: 13pt;
      color: #1b6b4a;
      margin: 24px 0 10px 0;
      border-bottom: 1px solid #d8dee4;
      padding-bottom: 4px;
    }
    h3 { font-size: 11pt; margin: 12px 0 6px 0; color: #1a1d21; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
    }
    th, td {
      border: 1px solid #d8dee4;
      padding: 8px 10px;
      text-align: left;
    }
    th { background: #e8f5ef; font-size: 9pt; text-transform: uppercase; color: #1b6b4a; }
    tfoot td { background: #f4f6f8; }
    .num { text-align: right; white-space: nowrap; }
    .summary-grid {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }
    .summary-box {
      flex: 1;
      min-width: 140px;
      background: #e8f5ef;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }
    .summary-box .label { font-size: 9pt; color: #5c6570; }
    .summary-box .value { font-size: 16pt; font-weight: 800; color: #1b6b4a; }
    .total-row td {
      background: #1b6b4a;
      color: #fff;
      font-weight: 700;
      font-size: 12pt;
      border-color: #1b6b4a;
    }
    .muted { color: #5c6570; font-size: 10pt; }
    .notes {
      margin-top: 20px;
      padding: 12px;
      background: #fff8f0;
      border-left: 4px solid #c45c26;
      font-size: 10pt;
    }
    .footer {
      margin-top: 32px;
      padding-top: 12px;
      border-top: 1px solid #d8dee4;
      font-size: 9pt;
      color: #5c6570;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="title">Оферта за ремонтни дейности</h1>
    <div class="meta">
      <span><strong>№</strong> ${escapeHtml(offerNumber)}</span>
      <span><strong>Дата:</strong> ${escapeHtml(offerDate)}</span>
      <span><strong>Валидност:</strong> ${validityText} дни</span>
    </div>
  </div>

  ${companyBlock || clientBlock ? `<div class="parties">${companyBlock}${clientBlock}</div>` : ''}

  <h2>Размери и площи</h2>
  ${buildDimensionsTable('Стени', walls, 'Няма въведени стени')}
  ${buildDimensionsTable('Прозорци и врати (изваждат се)', openings, 'Няма въведени отвори')}

  <div class="summary-grid">
    <div class="summary-box">
      <div class="label">Обща площ стени</div>
      <div class="value">${formatArea(result.grossArea)} м²</div>
    </div>
    <div class="summary-box">
      <div class="label">Минус отвори</div>
      <div class="value">− ${formatArea(result.openingsArea)} м²</div>
    </div>
    <div class="summary-box">
      <div class="label">Нетна площ</div>
      <div class="value">${formatArea(result.netArea)} м²</div>
    </div>
    <div class="summary-box">
      <div class="label">Периметър на отвори</div>
      <div class="value">${formatArea(result.openingsPerimeter)} л.м.</div>
    </div>
  </div>
  <p class="muted">Периметър: ${perimeterNote}</p>

  <h2>Дейности и цени</h2>
  <table>
    <thead>
      <tr>
        <th class="num">№</th>
        <th>Дейност</th>
        <th class="num">Количество</th>
        <th class="num">Ед. цена</th>
        <th class="num">Сума</th>
      </tr>
    </thead>
    <tbody>
      ${lineRows}
      <tr class="total-row">
        <td colspan="4">ОБЩО ДЪЛЖИМА СУМА</td>
        <td class="num">${formatMoney(result.grandTotal)} ${CURRENCY}</td>
      </tr>
    </tbody>
  </table>

  ${notesBlock}

  <div class="footer">
    Генерирано с „Ремонт калкулатор“ · ${escapeHtml(offerDate)}
  </div>
</body>
</html>`;
}

export function createOfferNumber(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `ОФ-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
}

export function formatOfferDate(date = new Date()): string {
  return date.toLocaleDateString('bg-BG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export async function exportOfferPdf(input: OfferPdfInput): Promise<void> {
  const html = buildOfferHtml(input);

  if (Platform.OS === 'web') {
    const win = window.open('', '_blank');
    if (!win) {
      Alert.alert('Блокиран прозорец', 'Разрешете изскачащи прозорци за печат на PDF.');
      return;
    }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
    return;
  }

  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    Alert.alert(
      'PDF е готов',
      Platform.OS === 'ios'
        ? 'Файлът е създаден, но споделяне не е налично на това устройство.'
        : `Файлът е запазен: ${uri}`,
    );
    return;
  }

  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: 'Сподели оферта (PDF)',
  });
}

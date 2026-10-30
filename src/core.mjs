export const VERSION = '1.0.0';
export const STORAGE_KEY = 'rota-conta:v1';
export const QUOTE_FRESH_MINUTES = 5;

export const currency = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' });

export function euros(cents) {
  return currency.format(cents / 100);
}

export function parseMoney(value) {
  const input = String(value ?? '').trim();
  if (!/^\d{1,6}(?:[,.]\d{1,2})?$/.test(input)) return null;
  const [whole, decimals = ''] = input.replace(',', '.').split('.');
  const cents = Number(whole) * 100 + Number(decimals.padEnd(2, '0'));
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}

export function moneyInput(cents) {
  return Number.isSafeInteger(cents) ? (cents / 100).toFixed(2).replace('.', ',') : '';
}

export function routeKey(from, to) {
  return [from, to].map(v => String(v ?? '').trim().toLocaleLowerCase('pt-PT').replace(/\s+/g, ' ')).join('→');
}

export function isFresh(quote, now = Date.now()) {
  const time = Date.parse(quote.capturedAt);
  return Number.isFinite(time) && time <= now + 30_000 && now - time <= QUOTE_FRESH_MINUTES * 60_000;
}

export function compareQuotes(quotes, { mode = 'price', now = Date.now() } = {}) {
  const valid = quotes.filter(q => isFresh(q, now) && q.lowCents > 0 && q.highCents >= q.lowCents);
  if (!valid.length) return { selected: null, runnerUp: null, confidence: 'none', rationale: 'Introduz preços recentes para obter uma sugestão.' };

  const canCompareWait = mode === 'time' && valid.some(q => Number.isInteger(q.waitMinutes));
  const candidates = canCompareWait ? valid.filter(q => Number.isInteger(q.waitMinutes)) : valid;
  const sorted = [...candidates].sort((a, b) => {
    if (canCompareWait) return a.waitMinutes - b.waitMinutes || a.highCents - b.highCents || a.lowCents - b.lowCents;
    return a.highCents - b.highCents || a.lowCents - b.lowCents || (a.waitMinutes ?? 999) - (b.waitMinutes ?? 999);
  });
  const [selected, runnerUp] = sorted;
  const distinctProviders = new Set(valid.map(q => q.provider)).size >= 2;
  let confidence = 'single';
  let rationale = distinctProviders ? 'Comparação com as ofertas que registaste.' : 'Ainda só existem ofertas de uma plataforma.';

  if (runnerUp && canCompareWait) {
    confidence = selected.waitMinutes < runnerUp.waitMinutes ? 'clear' : 'tie';
    rationale = selected.waitMinutes < runnerUp.waitMinutes
      ? `Recolha ${runnerUp.waitMinutes - selected.waitMinutes} min mais cedo do que a opção seguinte.`
      : 'Tempo de espera igual. Desempate pelo preço.';
  } else if (runnerUp) {
    confidence = selected.highCents < runnerUp.lowCents ? 'clear' : selected.lowCents === runnerUp.highCents && selected.highCents === runnerUp.lowCents ? 'tie' : 'overlap';
    rationale = confidence === 'clear'
      ? `Até ${euros(runnerUp.lowCents - selected.highCents)} abaixo da oferta seguinte.`
      : confidence === 'tie'
        ? 'Preços empatados. Confirma o tempo de espera nas aplicações.'
        : 'Os intervalos de preço cruzam-se. Esta é a opção com o menor valor máximo registado.';
  }
  return { selected, runnerUp: runnerUp ?? null, confidence, rationale, distinctProviders, compared: valid.length, criterion: canCompareWait ? 'time' : 'price' };
}

export function calculateRouteCost(quote, ridesPerMonth = 1) {
  if (!quote || !Number.isInteger(ridesPerMonth) || ridesPerMonth < 1 || ridesPerMonth > 120) return null;
  return { oneWayMin: quote.lowCents, oneWayMax: quote.highCents, monthMin: quote.lowCents * ridesPerMonth, monthMax: quote.highCents * ridesPerMonth };
}

export function monthReport(trips, month, budgetCents = 0) {
  const paid = trips.filter(t => t.status === 'paid' && t.date?.slice(0, 7) === month && Number.isSafeInteger(t.amountCents));
  const totalCents = paid.reduce((sum, trip) => sum + trip.amountCents, 0);
  const byProvider = { Uber: 0, Bolt: 0 };
  for (const trip of paid) if (trip.provider in byProvider) byProvider[trip.provider] += trip.amountCents;
  return { totalCents, byProvider, count: paid.length, remainingCents: budgetCents - totalCents, percentage: budgetCents > 0 ? Math.round(100 * totalCents / budgetCents) : 0, paid };
}

export function createEmptyState() {
  return { schemaVersion: 1, route: { from: '', to: '', later: '' }, quotes: [], trips: [], favorites: [], budgetCents: 0, mode: 'price' };
}

const cleanText = (value, max = 180) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const validCents = value => Number.isSafeInteger(value) && value >= 0 && value <= 99_999_999;
const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value) && Number.isFinite(Date.parse(value));

export function sanitizeState(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || raw.schemaVersion !== 1) throw new Error('Ficheiro incompatível com esta versão.');
  if (!Array.isArray(raw.quotes) || !Array.isArray(raw.trips) || !Array.isArray(raw.favorites)) throw new Error('Estrutura de dados inválida.');
  if (raw.quotes.length > 2000 || raw.trips.length > 5000 || raw.favorites.length > 50) throw new Error('O ficheiro excede o limite de registos.');
  const route = raw.route && typeof raw.route === 'object' ? raw.route : {};
  const quotes = raw.quotes.map(q => {
    if (!q || !['Uber', 'Bolt'].includes(q.provider) || !validCents(q.lowCents) || q.lowCents < 1 || !validCents(q.highCents) || q.highCents < q.lowCents || !validDate(q.capturedAt)) throw new Error('Uma oferta contém dados inválidos.');
    const minute = value => value === null || value === undefined || value === '' ? null : Number.isInteger(value) && value >= 0 && value <= 999 ? value : null;
    const originalCents = validCents(q.originalCents) && q.originalCents > q.lowCents ? q.originalCents : null;
    const originalMaxCents = originalCents && validCents(q.originalMaxCents) && q.originalMaxCents >= originalCents ? q.originalMaxCents : null;
    return { id: cleanText(q.id, 90), provider: q.provider, category: cleanText(q.category, 60), from: cleanText(q.from), to: cleanText(q.to), lowCents: q.lowCents, highCents: q.highCents, originalCents, originalMaxCents, waitMinutes: minute(q.waitMinutes), rideMinutes: minute(q.rideMinutes), seats: Number.isInteger(q.seats) && q.seats >= 1 && q.seats <= 8 ? q.seats : null, capturedAt: q.capturedAt };
  });
  const trips = raw.trips.map(t => {
    if (!t || !['Uber', 'Bolt'].includes(t.provider) || !['planned', 'paid'].includes(t.status) || !validDate(t.date) || (t.status === 'paid' && (!validCents(t.amountCents) || t.amountCents < 1))) throw new Error('Uma viagem contém dados inválidos.');
    return { id: cleanText(t.id, 90), provider: t.provider, category: cleanText(t.category, 60), from: cleanText(t.from), to: cleanText(t.to), date: t.date, status: t.status, amountCents: t.status === 'paid' ? t.amountCents : null, quotedCents: validCents(t.quotedCents) ? t.quotedCents : null, payment: ['Cartão', 'Dinheiro', 'Outro'].includes(t.payment) ? t.payment : 'Outro', notes: cleanText(t.notes, 240) };
  });
  const favorites = raw.favorites.map(f => ({ id: cleanText(f?.id, 90), label: cleanText(f?.label, 50), address: cleanText(f?.address) })).filter(f => f.label && f.address);
  return { schemaVersion: 1, route: { from: cleanText(route.from), to: cleanText(route.to), later: cleanText(route.later, 30) }, quotes, trips, favorites, budgetCents: validCents(raw.budgetCents) ? raw.budgetCents : 0, mode: raw.mode === 'time' ? 'time' : 'price' };
}

export function escapeCSV(value) {
  let text = String(value ?? '');
  if (/^[\s]*[=+\-@]/.test(text)) text = "'" + text;
  return `"${text.replaceAll('"', '""')}"`;
}

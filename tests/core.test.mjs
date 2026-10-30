import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMoney, euros, compareQuotes, calculateRouteCost, monthReport, sanitizeState, createEmptyState, routeKey, escapeCSV } from '../src/core.mjs';

const now = Date.parse('2026-10-30T06:00:00.000Z');
const quote = (provider, low, high = low, wait = 5) => ({ id: provider, provider, category: 'Standard', lowCents: low, highCents: high, waitMinutes: wait, capturedAt: new Date(now - 60_000).toISOString() });

test('cêntimos sem erros de ponto flutuante', () => {
  assert.equal(parseMoney('3,74'), 374);
  assert.equal(parseMoney('4.5'), 450);
  assert.equal(parseMoney('0,01'), 1);
  for (const input of ['0', '-2', '3,999', '1.000,00', 'abc', '', '3.4.5']) assert.equal(parseMoney(input), null);
  assert.match(euros(374), /3,74/);
});

test('comparação de preços exatos e intervalos sem inventar vencedor', () => {
  let result = compareQuotes([quote('Uber', 374), quote('Bolt', 441)], { now });
  assert.equal(result.selected.provider, 'Uber');
  assert.equal(result.confidence, 'clear');
  result = compareQuotes([quote('Uber', 374), quote('Bolt', 331, 491)], { now });
  assert.equal(result.selected.provider, 'Uber');
  assert.equal(result.confidence, 'overlap');
  result = compareQuotes([quote('Uber', 374), quote('Bolt', 374)], { now });
  assert.equal(result.confidence, 'tie');
});

test('recolha mais rápida e ofertas antigas', () => {
  const fast = compareQuotes([quote('Uber', 500, 500, 2), quote('Bolt', 300, 300, 8)], { now, mode: 'time' });
  assert.equal(fast.selected.provider, 'Uber');
  const stale = quote('Uber', 300); stale.capturedAt = new Date(now - 600_000).toISOString();
  assert.equal(compareQuotes([stale], { now }).selected, null);
});

test('custo mensal é simulação de número de viagens, não preço garantido', () => {
  assert.deepEqual(calculateRouteCost(quote('Bolt', 331, 491), 20), { oneWayMin: 331, oneWayMax: 491, monthMin: 6620, monthMax: 9820 });
  assert.equal(calculateRouteCost(quote('Bolt', 331), 0), null);
});

test('relatório só soma viagens pagas no mês correspondente', () => {
  const trips = [
    { date: '2026-10-21', status: 'paid', provider: 'Uber', amountCents: 374 },
    { date: '2026-10-22', status: 'planned', provider: 'Bolt', amountCents: null },
    { date: '2026-10-22', status: 'paid', provider: 'Bolt', amountCents: 331 },
    { date: '2026-09-21', status: 'paid', provider: 'Uber', amountCents: 600 }
  ];
  assert.deepEqual(monthReport(trips, '2026-10', 1000), { totalCents: 705, byProvider: { Uber: 374, Bolt: 331 }, count: 2, remainingCents: 295, percentage: 71, paid: [trips[0], trips[2]] });
});

test('importação validada e CSV protegido', () => {
  assert.deepEqual(sanitizeState(createEmptyState()), createEmptyState());
  assert.throws(() => sanitizeState({ schemaVersion: 1, quotes: [], trips: [] }));
  assert.equal(routeKey(' Benfica ', ' AV. José Malhoa '), 'benfica→av. josé malhoa');
  assert.equal(escapeCSV('=2+2'), '"\'=2+2"');
  assert.equal(escapeCSV('A"B'), '"A""B"');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { lookupDrivingRoute, RouteLookupError, routeErrorMessage } from '../src/routing.mjs';
import { sanitizeState, createEmptyState } from '../src/core.mjs';

const ok = data => ({ ok: true, json: async () => data });

test('converte duas moradas em percurso rodoviário com distância e duração', async () => {
  const calls = [];
  const fetchImpl = async url => {
    calls.push(url);
    if (url.includes('/v1/forward')) {
      const source = new URL(url).searchParams.get('q').startsWith('Origem 101');
      return ok({ status: 'ok', results: [{ lat: source ? 38.73 : 38.74, lon: source ? -9.15 : -9.16, formatted: source ? 'Rua Origem 101, Lisboa' : 'Rua Destino 202, Lisboa', precision: 'house', confidence: 0.98 }] });
    }
    return ok({ code: 'Ok', routes: [{ distance: 4354.7, duration: 712.5 }] });
  };
  const result = await lookupDrivingRoute('Origem 101, Lisboa', 'Destino 202, Lisboa', { fetchImpl });
  assert.equal(result.distanceMeters, 4355);
  assert.equal(result.durationSeconds, 713);
  assert.equal(result.uncertain, false);
  assert.match(result.toLabel, /Destino/);
  assert.equal(calls.length, 3);
  assert.match(calls[2], /-9\.15,38\.73;-9\.16,38\.74/);
});

test('morada pouco precisa aparece com aviso e não vira tarifa', async () => {
  const fetchImpl = async url => url.includes('/v1/forward')
    ? ok({ status: 'ok', results: [{ lat: 38.72, lon: -9.16, formatted: 'Lisboa', precision: 'city', confidence: 0.45 }] })
    : ok({ code: 'Ok', routes: [{ distance: 1450, duration: 280 }] });
  const result = await lookupDrivingRoute('Praça de A, Lisboa', 'Praça de B, Lisboa', { fetchImpl });
  assert.equal(result.uncertain, true);
  assert.equal('fareCents' in result, false);
});

test('falha quando geocodificador não identifica uma morada', async () => {
  await assert.rejects(() => lookupDrivingRoute('Não existe 123', 'Não existe 987', { fetchImpl: async () => ok({ status: 'ok', results: [] }) }), error => error instanceof RouteLookupError && error.code === 'address');
  assert.match(routeErrorMessage(new RouteLookupError('address')), /moradas/);
});

test('rejeita respostas de rota inválidas e falhas de rede', async () => {
  const geocode = () => ok({ status: 'ok', results: [{ lat: 38.72, lon: -9.15, formatted: 'Lisboa', precision: 'house', confidence: 1 }] });
  await assert.rejects(() => lookupDrivingRoute('Rua Alfa 300', 'Rua Beta 400', { fetchImpl: async url => url.includes('forward') ? geocode() : ok({ code: 'NoRoute' }) }), { code: 'no-route' });
  await assert.rejects(() => lookupDrivingRoute('Rua Gama 123', 'Rua Delta 456', { fetchImpl: async () => { throw new Error('offline'); } }), { code: 'network' });
});

test('backup preserva medida válida e elimina medidas adulteradas', () => {
  const raw = createEmptyState();
  raw.route.measure = { distanceMeters: 4355, durationSeconds: 712, fromLabel: 'A', toLabel: 'B', uncertain: false, at: '2026-10-30T13:14:00Z' };
  assert.equal(sanitizeState(raw).route.measure.distanceMeters, 4355);
  raw.route.measure.distanceMeters = -20;
  assert.equal(sanitizeState(raw).route.measure, null);
});

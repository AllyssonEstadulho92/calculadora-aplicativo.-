// Serviços de demonstração para uso pessoal. Não representam a rota nem as tarifas das plataformas TVDE.
export const GEOCODER_URL = 'https://api.mygeocode.com/v1/forward';
export const ROUTER_URL = 'https://router.project-osrm.org/route/v1/driving/';

const geocodeCache = new Map();
const routeCache = new Map();
const cleanAddress = value => String(value ?? '').trim().replace(/\s+/g, ' ');

export class RouteLookupError extends Error {
  constructor(code) {
    super(code); this.name = 'RouteLookupError'; this.code = code;
  }
}

async function fetchJson(url, fetchImpl, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, { signal: controller.signal, headers: { Accept: 'application/json' }, referrerPolicy: 'strict-origin-when-cross-origin' });
    if (!response.ok) throw new RouteLookupError(response.status === 429 ? 'limit' : 'service');
    return await response.json();
  } catch (error) {
    if (error instanceof RouteLookupError) throw error;
    throw new RouteLookupError(controller.signal.aborted ? 'timeout' : 'network');
  } finally { clearTimeout(timer); }
}

async function geocode(address, fetchImpl, timeoutMs) {
  const query = cleanAddress(address);
  const key = query.toLocaleLowerCase('pt-PT');
  if (geocodeCache.has(key)) return geocodeCache.get(key);
  const url = new URL(GEOCODER_URL);
  url.searchParams.set('q', query);
  url.searchParams.set('limit', '1');
  url.searchParams.set('lang', 'pt');
  const data = await fetchJson(url.toString(), fetchImpl, timeoutMs);
  if (data?.status !== 'ok' || !Array.isArray(data.results)) throw new RouteLookupError('service');
  const found = data.results[0];
  if (!found) throw new RouteLookupError('address');
  const lat = Number(found.lat), lon = Number(found.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) throw new RouteLookupError('service');
  const result = {
    lat, lon,
    label: cleanAddress(found.formatted).slice(0, 180) || query,
    precision: String(found.precision ?? ''),
    uncertain: !['house', 'poi'].includes(found.precision) || Number(found.confidence ?? 0) < 0.7
  };
  geocodeCache.set(key, result);
  return result;
}

export async function lookupDrivingRoute(from, to, { fetchImpl = fetch, timeoutMs = 12_000 } = {}) {
  const origin = cleanAddress(from), destination = cleanAddress(to);
  if (origin.length < 4 || destination.length < 4 || origin.length > 180 || destination.length > 180 || origin.toLocaleLowerCase('pt-PT') === destination.toLocaleLowerCase('pt-PT')) throw new RouteLookupError('input');
  const key = `${origin.toLocaleLowerCase('pt-PT')}→${destination.toLocaleLowerCase('pt-PT')}`;
  if (routeCache.has(key)) return { ...routeCache.get(key) };
  const start = await geocode(origin, fetchImpl, timeoutMs);
  const end = await geocode(destination, fetchImpl, timeoutMs);
  const coordinates = `${start.lon},${start.lat};${end.lon},${end.lat}`;
  const data = await fetchJson(`${ROUTER_URL}${coordinates}?overview=false&steps=false`, fetchImpl, timeoutMs);
  const route = data?.routes?.[0];
  if (data?.code !== 'Ok' || !route || !Number.isFinite(route.distance) || !Number.isFinite(route.duration) || route.distance <= 0 || route.duration <= 0) throw new RouteLookupError('no-route');
  const result = {
    distanceMeters: Math.round(route.distance),
    durationSeconds: Math.round(route.duration),
    fromLabel: start.label,
    toLabel: end.label,
    uncertain: start.uncertain || end.uncertain,
    at: new Date().toISOString()
  };
  routeCache.set(key, result);
  return { ...result };
}

export function routeErrorMessage(error) {
  switch (error?.code) {
    case 'input': return 'Indica duas moradas diferentes, com rua e localidade.';
    case 'address': return 'Não foi possível identificar uma das moradas. Acrescenta número de porta, localidade ou código postal.';
    case 'no-route': return 'Não foi encontrado um percurso de automóvel para estes pontos.';
    case 'limit': return 'O serviço de mapas atingiu o limite temporário. Tenta novamente mais tarde.';
    case 'timeout': return 'O serviço de mapas demorou demasiado. Volta a tentar.';
    default: return 'Não foi possível consultar o percurso. Podes continuar a usar o Google Maps e os preços registados.';
  }
}

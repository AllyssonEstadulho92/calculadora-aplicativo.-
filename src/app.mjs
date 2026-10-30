import { VERSION, STORAGE_KEY, createEmptyState, sanitizeState, parseMoney, moneyInput, euros, routeKey, isFresh, compareQuotes, calculateRouteCost, monthReport, escapeCSV } from './core.mjs';
import { lookupDrivingRoute, routeErrorMessage } from './routing.mjs';

const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const uid = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const finiteOptional = (value, low, high) => value === '' || value === null || value === undefined ? null : /^\d+$/.test(String(value)) && Number(value) >= low && Number(value) <= high ? Number(value) : NaN;
const dateLabel = value => new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value.slice(0, 10)}T12:00:00`));
const clockLabel = value => new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));

let state;
let persistent = true;
let loadFailed = false;
try {
  const json = localStorage.getItem(STORAGE_KEY);
  state = json ? sanitizeState(JSON.parse(json)) : createEmptyState();
} catch (error) {
  state = createEmptyState(); persistent = false; loadFailed = true;
}
let currentView = 'comparar';
let toastTimer;
let imageURL = null;
let activeDialogContext = null;
let measureLoading = false;
let measurePending = false;

function notify(message) {
  const node = $('toast'); node.textContent = message; node.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { node.hidden = true; }, 4400);
}

function persist() {
  if (loadFailed) { notify('Dados anteriores ilegíveis. Recupera um backup antes de alterar o armazenamento.'); return false; }
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); persistent = true; return true; }
  catch { persistent = false; notify('Não foi possível guardar neste dispositivo. Exporta uma cópia e verifica o armazenamento.'); return false; }
}

function changeView(view) {
  if (!['comparar', 'viagens', 'relatorios', 'definicoes'].includes(view)) return;
  currentView = view;
  for (const name of ['comparar', 'viagens', 'relatorios', 'definicoes']) $('screen-' + name).hidden = name !== view;
  document.querySelectorAll('[data-view]').forEach(button => {
    const active = button.dataset.view === view; button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
  });
  render(); window.scrollTo({ top: 0, behavior: 'instant' });
}

function currentQuotes() {
  const key = routeKey(state.route.from, state.route.to);
  return !state.route.from || !state.route.to ? [] : state.quotes.filter(q => routeKey(q.from, q.to) === key).sort((a, b) => Date.parse(b.capturedAt) - Date.parse(a.capturedAt));
}

const isLaterRoute = () => !!state.route.later && Date.parse(state.route.later) > Date.now();
function selectQuote() { return isLaterRoute() ? { selected: null, future: true } : compareQuotes(currentQuotes(), { mode: state.mode }); }

function renderRoute() {
  $('routeFrom').value = state.route.from; $('routeTo').value = state.route.to;
  $('routeLater').value = state.route.later || '';
  $('laterField').hidden = !state.route.later;
  $('laterToggle').setAttribute('aria-expanded', String(!$('laterField').hidden));
  const isReady = state.route.from && state.route.to;
  $('measureRoute').disabled = !isReady || measureLoading;
  $('measureRoute').textContent = measureLoading ? 'A consultar o percurso…' : 'Atualizar distância e tempo ↻';
  const route = $('routeSummary');
  route.innerHTML = isReady ? `<span aria-hidden="true">◉</span><div><strong>${esc(state.route.from)}</strong> <span class="arrow">→</span> <strong>${esc(state.route.to)}</strong>${isLaterRoute() ? `<small> · Viagem futura: ${esc(new Date(state.route.later).toLocaleString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }))}</small>` : ''}</div>` : 'Escolhe primeiro um percurso.';
  const mapLink = $('mapLink');
  mapLink.setAttribute('aria-disabled', String(!isReady));
  if (isReady) {
    const p = new URLSearchParams({ api: '1', origin: state.route.from, destination: state.route.to, travelmode: 'driving' });
    mapLink.href = `https://www.google.com/maps/dir/?${p.toString()}`;
  } else mapLink.href = 'https://www.google.com/maps';
  const measure = state.route.measure;
  $('routeMeasure').innerHTML = !isReady ? 'Confirma as moradas para consultar o percurso.' : !measure ? 'Consulta os quilómetros e a duração estimada para esta rota.' :
    `<div class="distance-metrics"><strong>${(measure.distanceMeters / 1000).toLocaleString('pt-PT', { maximumFractionDigits: 1, minimumFractionDigits: 1 })} km</strong><strong>${Math.max(1, Math.round(measure.durationSeconds / 60))} min</strong></div>
    <div class="distance-locations"><span>Partida encontrada: ${esc(measure.fromLabel)}</span><span>Destino encontrado: ${esc(measure.toLabel)}</span></div>
    ${measure.uncertain ? '<p class="distance-warning">⚠ Uma das moradas foi localizada de forma aproximada. Confirma a rua e o número.</p>' : ''}
    <small>Distância rodoviária estimada, sem trânsito em tempo real. Consulta: ${esc(new Date(measure.at).toLocaleString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }))}.</small>`;
}

function renderOfficialSources() {
  const ready = !!(state.route.from && state.route.to);
  for (const id of ['openUber', 'openBolt', 'openMoovit']) {
    $(id).setAttribute('aria-disabled', String(!ready));
    $(id).tabIndex = ready ? 0 : -1;
  }
  $('copyRoute').disabled = !ready;
  $('officialSourceStatus').textContent = ready
    ? 'As plataformas mostram os seus próprios preços e horários. Esta aplicação não tem acesso às cotações das tuas contas. Consulta a fonte e regista o valor apresentado para o comparar.'
    : 'Confirma as duas moradas para abrir as plataformas.';
}

function renderFavoriteChips() {
  $('favoriteChips').innerHTML = state.favorites.length ? `<span class="field-help">Favoritos como destino:</span>${state.favorites.map(f => `<button type="button" class="favorite-chip" data-use-favorite="${esc(f.id)}">⌁ ${esc(f.label)}</button>`).join('')}` : '';
  $('favoriteList').innerHTML = state.favorites.length ? state.favorites.map(f => `<div class="favorite-row"><span class="provider-mark bolt" aria-hidden="true">⌖</span><div><strong>${esc(f.label)}</strong><small>${esc(f.address)}</small></div><button type="button" data-delete-favorite="${esc(f.id)}" aria-label="Remover ${esc(f.label)}">Remover</button></div>`).join('') : `<p class="field-help">Ainda não tens locais favoritos.</p>`;
}

function quoteMarkup(q, winnerId) {
  const fresh = isFresh(q); const range = q.lowCents !== q.highCents;
  const price = range ? `${euros(q.lowCents)} a ${euros(q.highCents)}` : euros(q.lowCents);
  const discount = q.originalCents && !range && !q.originalMaxCents && q.originalCents > q.highCents ? Math.round((q.originalCents - q.highCents) * 100 / q.originalCents) : null;
  const previous = q.originalCents ? `Antes: ${euros(q.originalCents)}${q.originalMaxCents ? ` a ${euros(q.originalMaxCents)}` : ''}` : '';
  return `<article class="offer-item ${fresh && winnerId === q.id ? 'is-recommended' : ''}">
    <div class="provider-mark ${q.provider.toLowerCase()}" aria-label="${esc(q.provider)}">${q.provider === 'Uber' ? 'U' : 'B'}</div>
    <div><div class="offer-heading">${esc(q.category || q.provider)}</div><div class="offer-sub">${esc(q.provider)} · ${q.waitMinutes === null ? 'Espera não indicada' : `${q.waitMinutes} min de espera`}${q.rideMinutes === null ? '' : ` · ${q.rideMinutes} min de viagem`}${q.seats === null ? '' : ` · ${q.seats} lugares`}</div>
      <div class="offer-tags">${fresh ? '<span class="tiny-pill">Registada agora</span>' : '<span class="tiny-pill stale">Desatualizada</span>'}${discount ? `<span class="tiny-pill">−${discount}% indicado</span>` : ''}${range ? '<span class="tiny-pill">Intervalo</span>' : ''}<span class="tiny-pill">${esc(clockLabel(q.capturedAt))}</span></div></div>
    <div class="offer-price"><strong>${esc(price)}</strong>${previous ? `<span class="previous-price">${esc(previous)}</span>` : ''}</div>
    <div class="offer-actions"><button type="button" data-add-trip="${esc(q.id)}">Registar viagem +</button><button type="button" class="remove" data-delete-quote="${esc(q.id)}">Remover</button></div>
  </article>`;
}

function renderQuotes() {
  const list = currentQuotes(); const suggestion = selectQuote();
  $('offersList').innerHTML = !state.route.from || !state.route.to ? `<div class="empty-state"><div class="empty-graphic" aria-hidden="true">⌁</div><strong>Primeiro, escolhe a tua rota</strong><p>Assim cada oferta fica associada ao percurso certo.</p></div>` : !list.length ? `<div class="empty-state"><div class="empty-graphic" aria-hidden="true">↗</div><strong>O comparador está pronto</strong><p>Adiciona o preço visto na Uber e na Bolt. A sugestão aparecerá aqui ao lado.</p></div>` : list.map(q => quoteMarkup(q, suggestion.selected?.id)).join('');
}

function renderSuggestion() {
  $('preferenceMode').value = state.mode;
  const result = selectQuote(); const region = $('recommendResult');
  $('recommendStatus').textContent = result.selected ? '● PREÇO RECENTE' : result.future ? '○ MAIS TARDE' : '○ SEM PREÇOS';
  if (!result.selected) { region.innerHTML = `<div class="recommend-empty">${result.future ? 'Esta rota está marcada para mais tarde. Os preços atuais não permitem saber o que vais pagar nessa data.' : currentQuotes().length ? 'As ofertas registadas já têm mais de 5 minutos. Consulta novamente os valores nas aplicações.' : 'Adiciona as ofertas que encontraste nas aplicações para receber uma recomendação.'}</div>`; return; }
  const q = result.selected;
  const range = q.lowCents !== q.highCents;
  const price = range ? `${euros(q.lowCents)} a ${euros(q.highCents)}` : euros(q.lowCents);
  const badge = result.confidence === 'clear' ? 'Comparação clara' : result.confidence === 'overlap' ? 'Confirmar na app' : result.confidence === 'tie' ? 'Preço empatado' : 'Oferta registada';
  region.innerHTML = `<div class="recommend-winner"><div class="winner-row"><span class="winner-label">${result.criterion === 'time' ? 'MENOR ESPERA REGISTADA' : 'MENOR CUSTO MÁXIMO'}</span><span class="confidence-chip ${['overlap','single','tie'].includes(result.confidence) ? 'warn' : ''}">${badge}</span></div><div class="winner-price">${esc(price)}</div><strong>${esc(q.provider)} · ${esc(q.category)}</strong><div class="winner-meta">${q.waitMinutes === null ? 'Tempo de espera não indicado' : `Recolha em ${q.waitMinutes} min, conforme indicado`}</div></div><div class="rationale">${esc(result.rationale)}${result.distinctProviders ? '' : ' Ainda não comparaste as duas plataformas.'}</div><button type="button" class="recommend-action" data-add-trip="${esc(q.id)}">Registar esta viagem <span aria-hidden="true">↗</span></button>`;
}

function renderCosts() {
  const count = Number($('ridesCount').value); const selected = selectQuote().selected; const target = $('costResult');
  const values = calculateRouteCost(selected, count);
  if (!selected) { target.innerHTML = isLaterRoute() ? '<span>Sem preço confirmado para a hora futura. Podes registar os preços quando estiveres pronto para viajar.</span>' : '<span>Adiciona uma oferta recente para calcular o custo do percurso.</span>'; return; }
  if (!values) { target.innerHTML = '<span>Introduz um número inteiro entre 1 e 120 viagens.</span>'; return; }
  const range = selected.lowCents !== selected.highCents;
  const distance = state.route.measure?.distanceMeters;
  const perKm = distance ? `<small>Custo equivalente por km neste preço: ${range ? `${euros(Math.round(values.oneWayMin * 1000 / distance))} a ${euros(Math.round(values.oneWayMax * 1000 / distance))}` : euros(Math.round(values.oneWayMin * 1000 / distance))}/km. Não é a tarifa por km da plataforma.</small>` : '';
  target.innerHTML = `<div class="cost-label">${count} ${count === 1 ? 'viagem' : 'viagens'} ao preço indicado</div><strong>${range ? `${euros(values.monthMin)} a ${euros(values.monthMax)}` : euros(values.monthMin)}</strong><small>Uma viagem: ${range ? `${euros(values.oneWayMin)} a ${euros(values.oneWayMax)}` : euros(values.oneWayMin)} · ${esc(selected.provider)}</small>${perKm}`;
}

function renderTrips() {
  const list = [...state.trips].sort((a, b) => b.date.localeCompare(a.date));
  $('tripCount').textContent = `${list.length} ${list.length === 1 ? 'viagem' : 'viagens'}`;
  $('tripsList').innerHTML = list.length ? list.map(t => `<article class="trip-item"><span class="provider-mark ${t.provider.toLowerCase()}" aria-hidden="true">${t.provider === 'Uber' ? 'U' : 'B'}</span><div class="trip-main"><strong>${esc(t.from)} → ${esc(t.to)}</strong><small>${esc(dateLabel(t.date))} · ${esc(t.provider)} ${esc(t.category)} · ${esc(t.payment)}</small></div><span class="trip-status ${t.status === 'planned' ? 'planned' : ''}">${t.status === 'paid' ? 'Paga' : 'Planeada'}</span><div class="trip-amount">${t.status === 'paid' ? euros(t.amountCents) : 'Por pagar'}<small>${t.status === 'paid' ? 'Valor final' : 'Não conta como despesa'}</small></div><div class="trip-actions"><button type="button" data-edit-trip="${esc(t.id)}">Editar</button><button type="button" class="delete" data-delete-trip="${esc(t.id)}">Apagar</button></div></article>`).join('') : '<div class="empty-state"><div class="empty-graphic" aria-hidden="true">▤</div><strong>Histórico sem viagens</strong><p>Na comparação, escolhe “Registar viagem”. Quando pagares, introduz o valor final.</p></div>';
}

function renderReports() {
  const month = $('reportMonth').value || today().slice(0, 7); const report = monthReport(state.trips, month, state.budgetCents);
  $('heroMonthTotal').textContent = euros(monthReport(state.trips, today().slice(0, 7), state.budgetCents).totalCents);
  $('reportTotal').textContent = euros(report.totalCents);
  $('reportCount').textContent = `${report.count} ${report.count === 1 ? 'viagem paga' : 'viagens pagas'}`;
  $('reportRemaining').textContent = state.budgetCents ? euros(report.remainingCents) : '—';
  $('reportBudgetStatus').textContent = state.budgetCents ? report.remainingCents >= 0 ? 'Ainda disponível' : 'Orçamento ultrapassado' : 'Define um orçamento';
  $('reportAverage').textContent = report.count ? euros(Math.round(report.totalCents / report.count)) : euros(0);
  $('budgetInput').value = state.budgetCents ? moneyInput(state.budgetCents) : '';
  $('providerBreakdown').innerHTML = ['Uber', 'Bolt'].map(provider => `<div class="provider-row"><strong>${provider}</strong><progress class="provider-track ${provider.toLowerCase()}" max="100" value="${report.totalCents ? Math.round(report.byProvider[provider] * 100 / report.totalCents) : 0}"></progress><span>${euros(report.byProvider[provider])}</span></div>`).join('');
  $('budgetPercent').textContent = state.budgetCents ? `${report.percentage}%` : 'Sem limite';
  $('budgetProgress').value = Math.min(100, report.percentage);
}

function render() { renderRoute(); renderOfficialSources(); renderFavoriteChips(); renderQuotes(); renderSuggestion(); renderCosts(); renderTrips(); renderReports(); }

function formError(id, text) { const el = $(id); el.textContent = text; el.hidden = !text; }

$('routeForm').addEventListener('submit', event => {
  event.preventDefault();
  const from = $('routeFrom').value.trim(); const to = $('routeTo').value.trim();
  if (!from || !to) { notify('Preenche a partida e o destino.'); return; }
  if (routeKey(from, to) === routeKey(to, from)) { notify('A partida e o destino têm de ser diferentes.'); return; }
  if (!$('laterField').hidden && (!$('routeLater').value || Date.parse($('routeLater').value) <= Date.now())) { notify('Escolhe uma data e hora futuras para “Mais tarde”.'); return; }
  const existingMeasure = routeKey(from, to) === routeKey(state.route.from, state.route.to) ? state.route.measure : null;
  state.route = { from, to, later: $('laterField').hidden ? '' : $('routeLater').value, measure: existingMeasure };
  persist(); render(); notify('Percurso confirmado. A consultar automaticamente a distância e o tempo.');
  void runRouteMeasurement();
});

async function runRouteMeasurement() {
  if (!state.route.from || !state.route.to) return;
  if (measureLoading) { measurePending = true; return; }
  const from = state.route.from, to = state.route.to;
  const key = routeKey(from, to);
  measureLoading = true; renderRoute();
  try {
    const measure = await lookupDrivingRoute(from, to);
    if (key !== routeKey(state.route.from, state.route.to)) { notify('O percurso foi alterado. Volta a calcular para as novas moradas.'); return; }
    state.route.measure = measure;
    persist(); renderCosts();
    notify('Trajeto estimado. Confirma os pontos encontrados e o preço nas aplicações.');
  } catch (error) { notify(routeErrorMessage(error)); }
  finally {
    measureLoading = false; renderRoute();
    if (measurePending) { measurePending = false; void runRouteMeasurement(); }
  }
}

$('measureRoute').addEventListener('click', () => { void runRouteMeasurement(); });

document.querySelectorAll('#providerLinks a').forEach(link => link.addEventListener('click', event => {
  if (!state.route.from || !state.route.to) { event.preventDefault(); notify('Confirma primeiro a partida e o destino.'); }
}));

$('copyRoute').addEventListener('click', async () => {
  if (!state.route.from || !state.route.to) return;
  const routeText = `Partida: ${state.route.from}\nDestino: ${state.route.to}`;
  try {
    if (!navigator.clipboard?.writeText) throw new Error('clipboard-unavailable');
    await navigator.clipboard.writeText(routeText);
    notify('Percurso copiado. Podes colar as moradas na aplicação escolhida.');
  } catch { notify('Não foi possível copiar neste navegador. Usa as moradas apresentadas acima.'); }
});

$('swapRoute').addEventListener('click', () => { const first = $('routeFrom').value; $('routeFrom').value = $('routeTo').value; $('routeTo').value = first; });
$('laterToggle').addEventListener('click', () => { $('laterField').hidden = !$('laterField').hidden; $('laterToggle').setAttribute('aria-expanded', String(!$('laterField').hidden)); if ($('laterField').hidden) $('routeLater').value = ''; });

function closeQuote() { $('quoteForm').hidden = true; $('showQuoteForm').textContent = '+ Adicionar'; $('quoteForm').reset(); formError('quoteError', ''); if (imageURL) URL.revokeObjectURL(imageURL); imageURL = null; $('photoPreview').hidden = true; $('quoteScreenshot').value = ''; }
$('showQuoteForm').addEventListener('click', () => { const hidden = $('quoteForm').hidden; if (hidden && (!state.route.from || !state.route.to)) { notify('Confirma primeiro a partida e o destino.'); $('routeFrom').focus(); return; } if (!hidden) closeQuote(); else { $('quoteForm').hidden = false; $('showQuoteForm').textContent = 'Fechar'; $('quoteCategory').focus(); } });
$('cancelQuote').addEventListener('click', closeQuote);
$('quoteScreenshot').addEventListener('change', event => {
  if (imageURL) URL.revokeObjectURL(imageURL); imageURL = null; $('photoPreview').hidden = true;
  const file = event.target.files[0]; if (!file) return;
  if (!file.type.startsWith('image/') || file.size > 12_000_000) { notify('Escolhe uma imagem até 12 MB.'); event.target.value = ''; return; }
  imageURL = URL.createObjectURL(file); $('photoImage').src = imageURL; $('photoPreview').hidden = false;
});

$('quoteForm').addEventListener('submit', event => {
  event.preventDefault(); formError('quoteError', ''); const form = new FormData(event.currentTarget);
  const low = parseMoney(form.get('low')); const high = String(form.get('high')).trim() ? parseMoney(form.get('high')) : low;
  const original = String(form.get('original')).trim() ? parseMoney(form.get('original')) : null;
  const originalHigh = String(form.get('originalHigh')).trim() ? parseMoney(form.get('originalHigh')) : null;
  const wait = finiteOptional(form.get('wait'), 0, 999); const duration = finiteOptional(form.get('duration'), 0, 999); const seats = finiteOptional(form.get('seats'), 1, 8);
  const category = String(form.get('category')).trim();
  if (!category || !low || !high || high < low) { formError('quoteError', 'Preenche uma categoria e preços válidos. O máximo não pode ser inferior ao mínimo.'); return; }
  if ((original !== null && (!original || original <= low)) || (originalHigh !== null && (!original || !originalHigh || originalHigh < original)) || [wait, duration, seats].some(Number.isNaN)) { formError('quoteError', 'Confirma o preço anterior, os minutos e os lugares. Num intervalo, o preço anterior máximo não pode ser inferior ao mínimo.'); return; }
  if (state.quotes.length >= 2000) { formError('quoteError', 'Limite de ofertas atingido. Apaga ofertas antigas antes de continuar.'); return; }
  state.quotes.push({ id: uid(), provider: form.get('provider'), category, from: state.route.from, to: state.route.to, lowCents: low, highCents: high, originalCents: original, originalMaxCents: originalHigh, waitMinutes: wait, rideMinutes: duration, seats, capturedAt: new Date().toISOString() });
  persist(); closeQuote(); render(); notify('Oferta guardada com a hora do registo.');
});

$('preferenceMode').addEventListener('change', event => { state.mode = event.target.value === 'time' ? 'time' : 'price'; persist(); renderQuotes(); renderSuggestion(); renderCosts(); });
$('lessRides').addEventListener('click', () => { $('ridesCount').value = Math.max(1, Math.min(120, Number($('ridesCount').value) - 1 || 1)); renderCosts(); });
$('moreRides').addEventListener('click', () => { $('ridesCount').value = Math.max(1, Math.min(120, Number($('ridesCount').value) + 1 || 1)); renderCosts(); });
$('ridesCount').addEventListener('input', renderCosts);
$('calculateButton').addEventListener('click', () => { renderCosts(); if (!selectQuote().selected) notify('Introduz uma oferta recente para calcular.'); else if (!calculateRouteCost(selectQuote().selected, Number($('ridesCount').value))) notify('Indica entre 1 e 120 viagens.'); else notify('Cálculo atualizado com os preços que registaste.'); });

function openTripDialog({ quote = null, trip = null } = {}) {
  activeDialogContext = { quote, trip };
  const form = $('tripForm'); form.reset(); form.elements.tripId.value = trip?.id || ''; form.elements.quoteId.value = quote?.id || '';
  form.elements.status.value = trip?.status || 'planned';
  form.elements.date.value = trip?.date || today(); form.elements.amount.value = trip?.amountCents ? moneyInput(trip.amountCents) : '';
  form.elements.payment.value = trip?.payment || 'Cartão'; form.elements.notes.value = trip?.notes || '';
  $('tripDialogTitle').textContent = trip ? 'Editar viagem' : 'Registar viagem';
  $('tripSource').textContent = trip ? `${trip.provider} · ${trip.from} → ${trip.to}` : `${quote.provider} · ${quote.category} · ${quote.from} → ${quote.to}`;
  syncTripStatus(); formError('tripError', ''); $('tripDialog').showModal();
}
function syncTripStatus() { const paid = $('tripStatus').value === 'paid'; $('actualPriceLabel').hidden = !paid; $('tripForm').elements.amount.required = paid; }
$('tripStatus').addEventListener('change', syncTripStatus);
$('closeTripDialog').addEventListener('click', () => $('tripDialog').close());
$('tripDialog').addEventListener('click', event => { if (event.target === $('tripDialog')) $('tripDialog').close(); });
$('tripForm').addEventListener('submit', event => {
  event.preventDefault(); formError('tripError', ''); const form = event.currentTarget; const info = activeDialogContext;
  const status = form.elements.status.value; const amount = status === 'paid' ? parseMoney(form.elements.amount.value) : null;
  const date = form.elements.date.value;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date))) { formError('tripError', 'Escolhe uma data válida.'); return; }
  if (status === 'paid' && !amount) { formError('tripError', 'Para marcar uma viagem como paga, indica o valor final em euros.'); return; }
  const source = info.trip || info.quote;
  const entry = { id: info.trip?.id || uid(), provider: source.provider, category: source.category, from: source.from, to: source.to, date, status, amountCents: amount, quotedCents: info.trip?.quotedCents ?? (info.quote?.lowCents === info.quote?.highCents ? info.quote.lowCents : null), payment: form.elements.payment.value, notes: form.elements.notes.value.trim().slice(0, 240) };
  if (info.trip) state.trips = state.trips.map(t => t.id === info.trip.id ? entry : t);
  else { if (state.trips.length >= 5000) { formError('tripError', 'Limite de viagens atingido. Exporta e limpa registos antigos.'); return; } state.trips.push(entry); }
  persist(); $('tripDialog').close(); render(); notify(status === 'paid' ? 'Valor pago registado nas finanças.' : 'Viagem planeada guardada sem contabilizar despesa.');
});

document.addEventListener('click', event => {
  const nav = event.target.closest('[data-view]'); if (nav) { changeView(nav.dataset.view); return; }
  const button = event.target.closest('button'); if (!button) return;
  if (button.dataset.useFavorite) { const favorite = state.favorites.find(f => f.id === button.dataset.useFavorite); if (favorite) { $('routeTo').value = favorite.address; $('routeTo').focus(); notify('Destino preenchido. Confirma o percurso.'); } }
  if (button.dataset.deleteFavorite) { const favorite = state.favorites.find(f => f.id === button.dataset.deleteFavorite); if (favorite && confirm(`Remover o favorito “${favorite.label}”?`)) { state.favorites = state.favorites.filter(f => f.id !== favorite.id); persist(); renderFavoriteChips(); } }
  if (button.dataset.deleteQuote) { const quote = state.quotes.find(q => q.id === button.dataset.deleteQuote); if (quote && confirm('Remover esta oferta registada?')) { state.quotes = state.quotes.filter(q => q.id !== quote.id); persist(); renderQuotes(); renderSuggestion(); renderCosts(); } }
  if (button.dataset.addTrip) { const quote = state.quotes.find(q => q.id === button.dataset.addTrip); if (quote) openTripDialog({ quote }); }
  if (button.dataset.editTrip) { const trip = state.trips.find(t => t.id === button.dataset.editTrip); if (trip) openTripDialog({ trip }); }
  if (button.dataset.deleteTrip) { const trip = state.trips.find(t => t.id === button.dataset.deleteTrip); if (trip && confirm('Apagar definitivamente este registo de viagem?')) { state.trips = state.trips.filter(t => t.id !== trip.id); persist(); render(); notify('Registo removido.'); } }
});
document.querySelector('.brand').addEventListener('click', event => { event.preventDefault(); changeView('comparar'); });

$('reportMonth').value = today().slice(0, 7);
$('reportMonth').addEventListener('change', renderReports);
$('budgetForm').addEventListener('submit', event => {
  event.preventDefault(); const raw = $('budgetInput').value.trim(); const cents = raw ? parseMoney(raw) : 0;
  if (cents === null) { notify('Introduz um orçamento válido em euros.'); return; }
  state.budgetCents = cents; persist(); renderReports(); notify('Orçamento mensal guardado.');
});

$('favoriteForm').addEventListener('submit', event => {
  event.preventDefault(); const form = event.currentTarget; const data = new FormData(form);
  const label = String(data.get('label')).trim(); const address = String(data.get('address')).trim();
  if (!label || !address) { notify('Preenche o nome e o local.'); return; }
  if (state.favorites.length >= 50) { notify('Limite de 50 favoritos atingido.'); return; }
  state.favorites.push({ id: uid(), label, address }); persist(); form.reset(); renderFavoriteChips(); notify('Favorito guardado apenas neste dispositivo.');
});

function download(name, type, body) {
  const blob = new Blob([body], { type }); const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; document.body.appendChild(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
$('exportJson').addEventListener('click', () => { download(`rota-conta-backup-${today()}.json`, 'application/json;charset=utf-8', JSON.stringify({ ...state, exportedAt: new Date().toISOString(), appVersion: VERSION }, null, 2)); notify('Backup preparado. Guarda-o num local seguro.'); });
$('exportCsv').addEventListener('click', () => {
  const report = monthReport(state.trips, $('reportMonth').value, state.budgetCents);
  const header = ['Data', 'Plataforma', 'Categoria', 'Partida', 'Destino', 'Valor pago EUR', 'Pagamento', 'Observações'];
  const lines = [header, ...report.paid.map(t => [t.date, t.provider, t.category, t.from, t.to, moneyInput(t.amountCents), t.payment, t.notes])];
  download(`rota-conta-despesas-${$('reportMonth').value}.csv`, 'text/csv;charset=utf-8', '\ufeff' + lines.map(row => row.map(escapeCSV).join(';')).join('\r\n')); notify('Relatório CSV preparado.');
});

$('importJson').addEventListener('change', async event => {
  const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
  if (file.size > 2_500_000) { notify('O backup excede 2,5 MB.'); return; }
  try {
    const parsed = sanitizeState(JSON.parse(await file.text()));
    if (!confirm(`Importar ${parsed.trips.length} viagens e ${parsed.quotes.length} ofertas? Isto substitui os registos atuais deste dispositivo.`)) return;
    state = parsed; loadFailed = false; if (persist()) { $('reportMonth').value = today().slice(0, 7); closeQuote(); render(); notify('Backup importado e validado.'); }
  } catch (error) { notify(`Não foi possível importar: ${error.message}`); }
});
$('clearData').addEventListener('click', () => {
  if (!confirm('Queres apagar todas as rotas, ofertas, viagens e favoritos guardados neste navegador? Esta ação não pode ser anulada sem backup.')) return;
  if (!confirm('Última confirmação: já guardaste uma cópia de segurança?')) return;
  state = createEmptyState(); loadFailed = false; localStorage.removeItem(STORAGE_KEY); $('reportMonth').value = today().slice(0, 7); closeQuote(); render(); notify('Os registos locais foram apagados.');
});

if (!persistent) notify('Não foi possível carregar os dados locais. Exporta os dados antigos antes de guardar alterações.');
render();
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('./sw.js').catch(() => {});
setInterval(() => { if (currentView === 'comparar') { renderQuotes(); renderSuggestion(); renderCosts(); } }, 30_000);

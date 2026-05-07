const DEFAULT_MARKETS = {
  futures: [
    { sym: 'DJIA', name: 'DOW FUT', val: 38247, chg: 152, pct: 0.40 },
    { sym: 'NDX', name: 'NASDAQ FUT', val: 17891, chg: -42, pct: -0.23 },
    { sym: 'SPX', name: 'S&P FUT', val: 5072.5, chg: 8.25, pct: 0.16 }
  ],
  commodities: [
    { sym: 'CL', name: 'CRUDE OIL', val: 82.47, chg: 1.12, unit: 'USD/BBL' },
    { sym: 'GC', name: 'GOLD', val: 2041.30, chg: -8.40, unit: 'USD/OZ' },
    { sym: 'NG', name: 'NAT GAS', val: 2.87, chg: 0.05, unit: 'USD/MMBTU' },
    { sym: 'ZW', name: 'WHEAT', val: 6.12, chg: -0.08, unit: 'USD/BU' },
    { sym: 'HG', name: 'COPPER', val: 3.84, chg: 0.02, unit: 'USD/LB' },
    { sym: 'SI', name: 'SILVER', val: 22.91, chg: 0.18, unit: 'USD/OZ' }
  ]
};

export async function onRequestGet({ env }) {
  const name = env.BRIEFING_NAME || 'Ron';
  const location = env.BRIEFING_LOCATION_NAME || 'The Colony, Texas';
  const lat = env.BRIEFING_LAT || '33.0890';
  const lon = env.BRIEFING_LON || '-96.8864';

  const [weather, markets] = await Promise.all([
    getWeather(lat, lon, location),
    getMarkets(env).catch(() => DEFAULT_MARKETS)
  ]);

  const fallbackLines = buildFallbackLines(name, weather, markets);
  const lines = env.OPENAI_API_KEY
    ? await getAiLines(env.OPENAI_API_KEY, name, location, weather, markets).catch(() => fallbackLines)
    : fallbackLines;

  return json({ lines, weather, markets, source: env.OPENAI_API_KEY ? 'live-ai-or-fallback' : 'live-fallback' });
}

function json(data) {
  return new Response(JSON.stringify(data, null, 2), { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
}

async function getWeather(lat, lon, location) {
  try {
    const point = await fetch(`https://api.weather.gov/points/${lat},${lon}`, { headers: { 'user-agent': 'jarvis-morning-briefing/1.0 contact@example.com' } }).then(r => r.json());
    const forecast = await fetch(point.properties.forecast, { headers: { 'user-agent': 'jarvis-morning-briefing/1.0 contact@example.com' } }).then(r => r.json());
    const hourly = await fetch(point.properties.forecastHourly, { headers: { 'user-agent': 'jarvis-morning-briefing/1.0 contact@example.com' } }).then(r => r.json());
    const period = forecast.properties.periods?.[0] || {};
    const hour = hourly.properties.periods?.[0] || {};
    return {
      location,
      currentTempF: hour.temperature ?? period.temperature ?? null,
      shortForecast: hour.shortForecast || period.shortForecast || 'Forecast unavailable',
      detailedForecast: period.detailedForecast || '',
      wind: hour.windSpeed && hour.windDirection ? `${hour.windDirection} ${hour.windSpeed}` : period.windSpeed || '--',
      updated: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      nationalHeadline: 'National map panel is synthetic in this starter build.'
    };
  } catch {
    return { location, currentTempF: 72, shortForecast: 'Weather fallback active', detailedForecast: 'Live weather failed; using fallback conditions.', wind: '--', updated: 'fallback', nationalHeadline: 'National weather fallback active.' };
  }
}

async function getMarkets(env) {
  if (!env.TWELVEDATA_API_KEY) return DEFAULT_MARKETS;
  const key = env.TWELVEDATA_API_KEY;  
  const symbols = [
  ['DJIA', 'DOW ETF', 'DIA'],
  ['NDX', 'NASDAQ ETF', 'QQQ'],
  ['SPX', 'S&P ETF', 'SPY'],
  ['CL', 'CRUDE OIL ETF', 'USO'],
  ['GC', 'GOLD ETF', 'GLD'],
  ['SI', 'SILVER ETF', 'SLV'],
  ['NG', 'NAT GAS ETF', 'UNG'],
  ['HG', 'COPPER ETF', 'CPER']
];
  const quotes = await Promise.all(symbols.map(async ([sym, name, apiSym]) => {
    const q = await fetch(
  `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(apiSym)}&apikey=${key}`
).then((r) => r.json());

const val = Number(q.close || q.price || 0);
const chg = Number(q.change || 0);
const pct = Number(q.percent_change || 0);
return { sym, name, val, chg, pct };  }));
  const usable = quotes.filter(q => q.val > 0);
  if (usable.length < 3) return DEFAULT_MARKETS;
  return {
    futures: usable.slice(0, 3),
    commodities: usable.slice(3).map((x) => ({ ...x, unit: x.sym === 'CL' ? 'USD/BBL' : x.sym === 'HG' ? 'USD/LB' : 'USD' }))
  };
}

function buildFallbackLines(name, weather, markets) {
  const dow = markets.futures?.[0];
  const nasdaq = markets.futures?.[1];
  const sp = markets.futures?.[2];
  const crude = markets.commodities?.[0];
  const gold = markets.commodities?.[1];
  return [
    `Good morning, ${name}. Your JARVIS morning briefing is online.`,
    `Locally, conditions in ${weather.location} are ${weather.shortForecast}, with a current reading of ${weather.currentTempF ?? 'unknown'} degrees. Wind is ${weather.wind}.`,
    weather.detailedForecast ? `The local forecast summary is as follows: ${weather.detailedForecast}` : 'The detailed local forecast is not available at the moment.',
    `Equity futures snapshot: ${dow?.name} at ${dow?.val}, ${nasdaq?.name} at ${nasdaq?.val}, and ${sp?.name} at ${sp?.val}.`,
    `Commodities snapshot: ${crude?.name} at ${crude?.val}, and ${gold?.name} at ${gold?.val}.`,
    'CNN and Bloomberg video panels are standing by. Add authorized embed endpoints when available.',
    'That concludes the morning briefing. Standing by.'
  ];
}

async function getAiLines(apiKey, name, location, weather, markets) {
  const prompt = `Write a concise spoken JARVIS-style morning briefing for ${name} in ${location}. Use these facts only. Weather: ${JSON.stringify(weather)}. Markets: ${JSON.stringify(markets)}. Return JSON only: {"lines":["line 1", "line 2"]}. Keep 5-8 lines, natural for text-to-speech, no markdown.`;
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'gpt-4.1-mini', messages: [{ role: 'user', content: prompt }], temperature: 0.5 })
  });
  if (!res.ok) throw new Error('OpenAI briefing generation failed');
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '{}';
  const parsed = JSON.parse(text);
  return Array.isArray(parsed.lines) && parsed.lines.length ? parsed.lines : buildFallbackLines(name, weather, markets);
}

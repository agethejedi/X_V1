import { useEffect, useMemo, useRef, useState } from 'react';

const MODE_LABELS = { idle: 'STANDBY', listening: 'LISTENING', thinking: 'PROCESSING', speaking: 'RESPONDING' };
const MOCK_LINES = [
  'Good morning. I am online and ready to generate your briefing.',
  'Live weather and market feeds will populate when the Cloudflare backend responds.',
  'Video panels are configured as placeholders pending authorized embed endpoints.',
  'Standing by.'
];

function AudioRing({ active, intensity = 1, bars = 64, color = '#7DD3FC' }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf;
    const loop = () => { setTick((t) => t + 1); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active]);
  const radius = 110;
  return <g>{Array.from({ length: bars }, (_, i) => {
    const angle = (i / bars) * Math.PI * 2;
    const seed = i * 0.7;
    const wave = Math.sin(tick * 0.06 + seed) * 0.5 + Math.sin(tick * 0.13 + seed * 2.1) * 0.3 + Math.sin(tick * 0.21 + seed * 0.5) * 0.2;
    const amp = active ? (0.5 + wave * 0.5) * intensity : 0.15;
    const len = 4 + amp * 22;
    return <line key={i} x1={Math.cos(angle) * radius} y1={Math.sin(angle) * radius} x2={Math.cos(angle) * (radius + len)} y2={Math.sin(angle) * (radius + len)} stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={0.4 + amp * 0.6} />;
  })}</g>;
}

function RotatingArc({ radius, duration, reverse = false, segments = [[0, 60], [120, 30], [200, 80], [310, 20]], strokeWidth = 1.5, color = '#7DD3FC', opacity = 0.8 }) {
  return <g style={{ transformOrigin: 'center', animation: `${reverse ? 'spinReverse' : 'spin'} ${duration}s linear infinite` }}>{segments.map(([start, length], i) => {
    const circumference = 2 * Math.PI * radius;
    const dash = (length / 360) * circumference;
    const gap = circumference - dash;
    const offset = -((start / 360) * circumference);
    return <circle key={i} cx="0" cy="0" r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={`${dash} ${gap}`} strokeDashoffset={offset} opacity={opacity} strokeLinecap="round" />;
  })}</g>;
}

function TickRing({ radius, count, length = 4, color = '#7DD3FC', opacity = 0.5 }) {
  return <g>{Array.from({ length: count }, (_, i) => <line key={i} x1="0" y1={-radius} x2="0" y2={-radius - length} stroke={color} strokeWidth="1" opacity={opacity} transform={`rotate(${(i / count) * 360})`} />)}</g>;
}

function CornerBrackets({ size = 180, color = '#7DD3FC', opacity = 0.6 }) {
  const len = 18;
  const corners = [{ x: -size, y: -size, dx: 1, dy: 1 }, { x: size, y: -size, dx: -1, dy: 1 }, { x: -size, y: size, dx: 1, dy: -1 }, { x: size, y: size, dx: -1, dy: -1 }];
  return <g opacity={opacity}>{corners.map((c, i) => <g key={i}><line x1={c.x} y1={c.y} x2={c.x + c.dx * len} y2={c.y} stroke={color} strokeWidth="1.5" /><line x1={c.x} y1={c.y} x2={c.x} y2={c.y + c.dy * len} stroke={color} strokeWidth="1.5" /></g>)}</g>;
}

function OrbitingParticles({ active, color = '#7DD3FC' }) {
  if (!active) return null;
  const particles = [{ r: 95, dur: 4, size: 2, delay: 0 }, { r: 95, dur: 4, size: 1.5, delay: -1.3 }, { r: 95, dur: 4, size: 2.5, delay: -2.6 }, { r: 130, dur: 6, size: 1.5, delay: 0 }, { r: 130, dur: 6, size: 2, delay: -3 }, { r: 75, dur: 3, size: 1.5, delay: 0 }, { r: 75, dur: 3, size: 1, delay: -1.5 }];
  return <>{particles.map((p, i) => <g key={i} style={{ transformOrigin: 'center', animation: `spin ${p.dur}s linear infinite`, animationDelay: `${p.delay}s` }}><circle cx={p.r} cy="0" r={p.size} fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }} /></g>)}</>;
}

function JarvisCore({ mode }) {
  const color = { idle: '#94A3B8', listening: '#7DD3FC', thinking: '#A78BFA', speaking: '#67E8F9' }[mode];
  return <div className="jarvis-shell"><div className="core-radial" style={{ background: `radial-gradient(circle at center, ${color}22 0%, transparent 55%)` }} />{(mode === 'thinking' || mode === 'listening') && <div className="scanline" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)`, filter: `drop-shadow(0 0 6px ${color})` }} />}
    <svg viewBox="-200 -200 400 400" className="jarvis-svg">
      <defs><radialGradient id="coreGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor={color} stopOpacity="0.35" /><stop offset="60%" stopColor={color} stopOpacity="0.05" /><stop offset="100%" stopColor={color} stopOpacity="0" /></radialGradient><radialGradient id="innerCore" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#020617" /><stop offset="80%" stopColor="#020617" /><stop offset="100%" stopColor={color} stopOpacity="0.3" /></radialGradient></defs>
      <CornerBrackets size={170} color={color} opacity={0.4} /><CornerBrackets size={150} color={color} opacity={0.25} />
      <g style={{ transformOrigin: 'center', animation: mode === 'thinking' ? 'spin 30s linear infinite' : mode === 'speaking' ? 'spin 60s linear infinite' : 'none' }}><TickRing radius={140} count={48} length={6} color={color} opacity={0.4} /></g>
      <circle cx="0" cy="0" r="120" fill="url(#coreGlow)" />
      <RotatingArc radius={155} duration={mode === 'thinking' ? 8 : 24} color={color} opacity={0.5} segments={[[0, 40], [180, 40]]} />
      <RotatingArc radius={140} duration={mode === 'thinking' ? 6 : 18} reverse color={color} opacity={0.35} segments={[[20, 25], [120, 15], [220, 35], [320, 20]]} strokeWidth={1} />
      {(mode === 'listening' || mode === 'speaking') && <AudioRing active intensity={mode === 'speaking' ? 1.2 : 0.85} color={color} />}
      <circle cx="0" cy="0" r="100" fill="none" stroke={color} strokeWidth="2.5" opacity="0.9" style={{ filter: `drop-shadow(0 0 8px ${color})`, animation: mode === 'idle' ? 'corePulse 3s ease-in-out infinite' : 'none' }} />
      <RotatingArc radius={90} duration={mode === 'thinking' ? 2 : mode === 'idle' ? 30 : 12} color={color} opacity={0.7} segments={mode === 'thinking' ? [[0, 80], [120, 60], [240, 70]] : [[0, 30], [180, 30]]} strokeWidth={1.5} />
      <OrbitingParticles active={mode === 'thinking'} color={color} />
      <circle cx="0" cy="0" r="78" fill="url(#innerCore)" /><circle cx="0" cy="0" r="78" fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
      <text x="0" y="6" textAnchor="middle" fill={color} fontSize="22" fontFamily="ui-monospace, SFMono-Regular, monospace" fontWeight="300" letterSpacing="6" style={{ filter: `drop-shadow(0 0 4px ${color})`, animation: mode === 'thinking' ? 'thinkingPulse 1.2s ease-in-out infinite' : 'none' }}>JARVIS</text>
      <circle cx="0" cy="-22" r="1.5" fill={color} opacity="0.8" />
    </svg></div>;
}

function Panel({ title, code, children, accent = '#7DD3FC' }) {
  return <div className="panel" style={{ borderColor: `${accent}33` }}><i className="c tl" style={{ borderColor: accent }} /><i className="c tr" style={{ borderColor: accent }} /><i className="c bl" style={{ borderColor: accent }} /><i className="c br" style={{ borderColor: accent }} /><div className="panel-head" style={{ borderColor: `${accent}22`, background: `${accent}08` }}><span style={{ color: accent }}>● {title}</span><em style={{ color: accent }}>{code}</em></div><div className="panel-body">{children}</div></div>;
}

function LocalWeather({ weather }) {
  const accent = '#7DD3FC';
  const temp = weather?.currentTempF ?? '--';
  return <Panel title="LOCAL WEATHER" code="WX.01" accent={accent}><div className="weather-top"><div><div className="temp" style={{ color: accent }}>{temp}°</div><div className="tiny">{weather?.shortForecast ?? 'AWAITING TELEMETRY'}</div></div><div className="metrics"><div>WIND · {weather?.wind ?? '--'}</div><div>LOCATION · {weather?.location ?? '--'}</div><div>UPDATED · {weather?.updated ?? '--'}</div></div></div><RadarBox accent={accent} label="LOCAL RADAR · SYNTHETIC" /></Panel>;
}

function RadarBox({ accent, label }) {
  return <div className="radar"><svg viewBox="0 0 300 170"><path d="M20 120 Q80 75 140 95 T280 72 L280 170 L20 170Z" fill={accent} opacity="0.05" />{[30, 60, 90, 120, 150].map((y) => <line key={y} x1="0" y1={y} x2="300" y2={y} stroke={accent} opacity="0.12" />)}{[50, 100, 150, 200, 250].map((x) => <line key={x} x1={x} y1="0" x2={x} y2="170" stroke={accent} opacity="0.12" />)}<ellipse cx="130" cy="72" rx="46" ry="22" fill="#22D3EE" opacity="0.35" /><ellipse cx="145" cy="74" rx="25" ry="12" fill="#A78BFA" opacity="0.42" /><ellipse cx="185" cy="110" rx="35" ry="16" fill="#34D399" opacity="0.22" /><g style={{ transformOrigin: '150px 85px', animation: 'spin 7s linear infinite' }}><line x1="150" y1="85" x2="150" y2="18" stroke={accent} opacity="0.8" /><path d="M150 85 L150 18 A68 68 0 0 1 198 38Z" fill={accent} opacity="0.08" /></g><circle cx="150" cy="85" r="2" fill={accent} /></svg><span>{label}</span></div>;
}

function NationalWeather({ weather }) { return <Panel title="NATIONAL WEATHER" code="WX.02"><RadarBox accent="#7DD3FC" label={weather?.nationalHeadline || 'NATIONAL COMPOSITE · SYNTHETIC'} /></Panel>; }

function MiniSparkline({ up, color }) {
  const pts = useMemo(() => {
    let y = 50;
    return Array.from({ length: 21 }, (_, i) => { y += (Math.random() - 0.5) * 8 + (up ? -0.4 : 0.4); y = Math.max(15, Math.min(85, y)); return `${i * 5},${y}`; });
  }, [up]);
  return <svg viewBox="0 0 100 100" className="spark" preserveAspectRatio="none"><polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="1.5" opacity="0.9" /><polyline points={`${pts.join(' ')} 100,100 0,100`} fill={color} opacity="0.1" /></svg>;
}

function FuturesPanel({ markets }) {
  const items = markets?.futures ?? [];
  return <Panel title="INDEX FUTURES" code="MKT.01" accent="#67E8F9"><div className="market-list">{items.map((f) => <MarketRow key={f.sym} item={f} />)}</div></Panel>;
}
function CommoditiesPanel({ markets }) { const items = markets?.commodities ?? []; return <Panel title="COMMODITIES" code="MKT.02" accent="#67E8F9"><div className="commodity-grid">{items.map((c) => <Commodity key={c.sym} item={c} />)}</div></Panel>; }
function MarketRow({ item }) { const up = Number(item.chg) >= 0; const color = up ? '#34D399' : '#FB7185'; return <div className="market-row"><div className="m-name"><b>{item.name}</b><span>{item.sym}</span></div><MiniSparkline up={up} color={color} /><div className="m-price"><b>{Number(item.val).toLocaleString()}</b><span style={{ color }}>{up ? '▲' : '▼'} {Math.abs(Number(item.chg)).toFixed(2)} {item.pct ? `(${item.pct > 0 ? '+' : ''}${item.pct}%)` : ''}</span></div></div>; }
function Commodity({ item }) { const up = Number(item.chg) >= 0; const color = up ? '#34D399' : '#FB7185'; return <div className="commodity"><div><b>{item.name}</b><span>{item.sym}</span></div><div><strong>{Number(item.val).toFixed(2)}</strong><em style={{ color }}>{up ? '+' : ''}{Number(item.chg).toFixed(2)}</em></div><small>{item.unit}</small></div>; }

function VideoFeed({ network, code }) { return <Panel title={network} code={code} accent="#A78BFA"><div className="video"><div><h2>{network}</h2><p>FEED PLACEHOLDER</p><small>AUTHORIZED EMBED ENDPOINT REQUIRED</small></div><span className="live">● LIVE</span></div></Panel>; }

function TranscriptPanel({ lines, activeLine, isPlaying }) { return <Panel title="BRIEFING TRANSCRIPT" code="VOX.01" accent="#A78BFA"><div className="transcript">{lines.map((line, i) => <div key={i} className={isPlaying && i === activeLine ? 'active' : isPlaying && i < activeLine ? 'past' : ''}><span>{String(i + 1).padStart(2, '0')}</span><p>{line}</p></div>)}</div></Panel>; }

export default function App() {
  const [mode, setMode] = useState('idle');
  const [activeLine, setActiveLine] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [now, setNow] = useState(new Date());
  const [data, setData] = useState({ lines: MOCK_LINES, weather: null, markets: { futures: [], commodities: [] }, source: 'boot' });
  const utteranceRef = useRef(null);

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  async function loadBriefing() {
    setMode('thinking');
    const res = await fetch('/api/briefing');
    if (!res.ok) throw new Error('Briefing API failed');
    const payload = await res.json();
    setData(payload);
    return payload.lines?.length ? payload.lines : MOCK_LINES;
  }

  const startBriefing = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setActiveLine(-1);
    let lines = data.lines || MOCK_LINES;
    try { lines = await loadBriefing(); } catch (e) { console.warn(e); }
    setTimeout(() => { setMode('speaking'); speakLine(lines, 0); }, 700);
  };

  const speakLine = (lines, i) => {
    if (i >= lines.length) return finishBriefing();
    setActiveLine(i);
    if (window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance(lines[i]);
      u.rate = 0.95; u.pitch = 0.9;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find((v) => /daniel|alex|google uk english male|microsoft david/i.test(v.name)) || voices.find((v) => v.lang?.startsWith('en'));
      if (preferred) u.voice = preferred;
      u.onend = () => speakLine(lines, i + 1);
      u.onerror = () => speakLine(lines, i + 1);
      utteranceRef.current = u;
      window.speechSynthesis.speak(u);
    } else setTimeout(() => speakLine(lines, i + 1), 3000);
  };

  const finishBriefing = () => { setIsPlaying(false); setActiveLine(-1); setMode('idle'); };
  const stopBriefing = () => { if (window.speechSynthesis) window.speechSynthesis.cancel(); finishBriefing(); };

  const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();

  return <main><div className="grid-bg" /><div className="noise" /><header><div><span className="brand">● JARVIS // MORNING BRIEFING</span><span>v1.0.0-alpha</span></div><div><span>{dateStr}</span><b>{timeStr}</b><span>SYS.{MODE_LABELS[mode]}</span></div></header><section className="layout"><aside><LocalWeather weather={data.weather} /><NationalWeather weather={data.weather} /></aside><center><div className="hero"><JarvisCore mode={mode} /><button onClick={isPlaying ? stopBriefing : startBriefing}>{isPlaying ? '■ Halt Briefing' : '▶ Run Morning Briefing'}</button></div><TranscriptPanel lines={data.lines || MOCK_LINES} activeLine={activeLine} isPlaying={isPlaying} /><div className="videos"><VideoFeed network="CNN" code="VID.01" /><VideoFeed network="BLOOMBERG" code="VID.02" /></div></center><aside><FuturesPanel markets={data.markets} /><CommoditiesPanel markets={data.markets} /></aside></section><footer><span>DATA · {String(data.source || 'BOOT').toUpperCase()}</span><span>FEEDS: WX · MKT · VID</span><span>0x4A.7F2C</span></footer></main>;
}

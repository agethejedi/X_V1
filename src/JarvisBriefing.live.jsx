import { useState, useEffect, useRef } from "react";

// ============================================================
// VISUALIZER
// ============================================================

const MODE_LABELS = {
  idle: "STANDBY",
  listening: "LISTENING",
  thinking: "PROCESSING",
  speaking: "RESPONDING",
};

function AudioRing({ active, intensity = 1, bars = 64, color = "#7DD3FC" }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf;
    const loop = () => {
      setTick((t) => t + 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  const radius = 110;
  const items = [];
  for (let i = 0; i < bars; i++) {
    const angle = (i / bars) * Math.PI * 2;
    const seed = i * 0.7;
    const wave =
      Math.sin(tick * 0.06 + seed) * 0.5 +
      Math.sin(tick * 0.13 + seed * 2.1) * 0.3 +
      Math.sin(tick * 0.21 + seed * 0.5) * 0.2;
    const amp = active ? (0.5 + wave * 0.5) * intensity : 0.15;
    const len = 4 + amp * 22;
    const x1 = Math.cos(angle) * radius;
    const y1 = Math.sin(angle) * radius;
    const x2 = Math.cos(angle) * (radius + len);
    const y2 = Math.sin(angle) * (radius + len);
    items.push(
      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={0.4 + amp * 0.6} />
    );
  }
  return <g>{items}</g>;
}

function RotatingArc({ radius, duration, reverse = false, segments = [[0, 60], [120, 30], [200, 80], [310, 20]], strokeWidth = 1.5, color = "#7DD3FC", opacity = 0.8 }) {
  return (
    <g style={{ transformOrigin: "center", animation: `${reverse ? "spinReverse" : "spin"} ${duration}s linear infinite` }}>
      {segments.map(([start, length], i) => {
        const circumference = 2 * Math.PI * radius;
        const dash = (length / 360) * circumference;
        const gap = circumference - dash;
        const offset = -((start / 360) * circumference);
        return <circle key={i} cx="0" cy="0" r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={`${dash} ${gap}`} strokeDashoffset={offset} opacity={opacity} strokeLinecap="round" />;
      })}
    </g>
  );
}

function TickRing({ radius, count, length = 4, color = "#7DD3FC", opacity = 0.5 }) {
  const ticks = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 360;
    ticks.push(<line key={i} x1="0" y1={-radius} x2="0" y2={-radius - length} stroke={color} strokeWidth="1" opacity={opacity} transform={`rotate(${angle})`} />);
  }
  return <g>{ticks}</g>;
}

function CornerBrackets({ size = 180, color = "#7DD3FC", opacity = 0.6 }) {
  const s = size;
  const len = 18;
  const corners = [
    { x: -s, y: -s, dx: 1, dy: 1 },
    { x: s, y: -s, dx: -1, dy: 1 },
    { x: -s, y: s, dx: 1, dy: -1 },
    { x: s, y: s, dx: -1, dy: -1 },
  ];
  return (
    <g opacity={opacity}>
      {corners.map((c, i) => (
        <g key={i}>
          <line x1={c.x} y1={c.y} x2={c.x + c.dx * len} y2={c.y} stroke={color} strokeWidth="1.5" />
          <line x1={c.x} y1={c.y} x2={c.x} y2={c.y + c.dy * len} stroke={color} strokeWidth="1.5" />
        </g>
      ))}
    </g>
  );
}

function OrbitingParticles({ active, color = "#7DD3FC" }) {
  if (!active) return null;
  const particles = [
    { r: 95, dur: 4, size: 2, delay: 0 },
    { r: 95, dur: 4, size: 1.5, delay: -1.3 },
    { r: 95, dur: 4, size: 2.5, delay: -2.6 },
    { r: 130, dur: 6, size: 1.5, delay: 0 },
    { r: 130, dur: 6, size: 2, delay: -3 },
    { r: 75, dur: 3, size: 1.5, delay: 0 },
    { r: 75, dur: 3, size: 1, delay: -1.5 },
  ];
  return (
    <>
      {particles.map((p, i) => (
        <g key={i} style={{ transformOrigin: "center", animation: `spin ${p.dur}s linear infinite`, animationDelay: `${p.delay}s` }}>
          <circle cx={p.r} cy="0" r={p.size} fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
        </g>
      ))}
    </>
  );
}

function JarvisCore({ mode }) {
  const colors = { idle: "#94A3B8", listening: "#7DD3FC", thinking: "#A78BFA", speaking: "#67E8F9" };
  const color = colors[mode];

  return (
    <div className="relative w-full aspect-square">
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at center, ${color}22 0%, transparent 55%)`, transition: "background 600ms ease" }} />
      {(mode === "thinking" || mode === "listening") && (
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 w-72 h-[2px] pointer-events-none" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)`, animation: "scanline 3s linear infinite", filter: `drop-shadow(0 0 6px ${color})` }} />
      )}
      <svg viewBox="-200 -200 400 400" className="absolute inset-0 w-full h-full" style={{ animation: "flicker 4s ease-in-out infinite" }}>
        <defs>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="60%" stopColor={color} stopOpacity="0.05" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="innerCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#020617" />
            <stop offset="80%" stopColor="#020617" />
            <stop offset="100%" stopColor={color} stopOpacity="0.3" />
          </radialGradient>
        </defs>
        <CornerBrackets size={170} color={color} opacity={0.4} />
        <CornerBrackets size={150} color={color} opacity={0.25} />
        <g style={{ transformOrigin: "center", animation: mode === "thinking" ? "spin 30s linear infinite" : mode === "speaking" ? "spin 60s linear infinite" : "none" }}>
          <TickRing radius={140} count={48} length={6} color={color} opacity={0.4} />
        </g>
        <circle cx="0" cy="0" r="120" fill="url(#coreGlow)" />
        <RotatingArc radius={155} duration={mode === "thinking" ? 8 : 24} color={color} opacity={0.5} segments={[[0, 40], [180, 40]]} />
        <RotatingArc radius={140} duration={mode === "thinking" ? 6 : 18} reverse color={color} opacity={0.35} segments={[[20, 25], [120, 15], [220, 35], [320, 20]]} strokeWidth={1} />
        {(mode === "listening" || mode === "speaking") && <AudioRing active intensity={mode === "speaking" ? 1.2 : 0.85} color={color} />}
        <circle cx="0" cy="0" r="100" fill="none" stroke={color} strokeWidth="2.5" opacity="0.9" style={{ filter: `drop-shadow(0 0 8px ${color})`, animation: mode === "idle" ? "corePulse 3s ease-in-out infinite" : "none" }} />
        <RotatingArc radius={90} duration={mode === "thinking" ? 2 : mode === "idle" ? 30 : 12} color={color} opacity={0.7} segments={mode === "thinking" ? [[0, 80], [120, 60], [240, 70]] : [[0, 30], [180, 30]]} strokeWidth={1.5} />
        <OrbitingParticles active={mode === "thinking"} color={color} />
        <circle cx="0" cy="0" r="78" fill="url(#innerCore)" />
        <circle cx="0" cy="0" r="78" fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
        <text x="0" y="6" textAnchor="middle" fill={color} fontSize="22" fontFamily="ui-monospace, 'SF Mono', monospace" fontWeight="300" letterSpacing="6" style={{ filter: `drop-shadow(0 0 4px ${color})`, animation: mode === "thinking" ? "thinkingPulse 1.2s ease-in-out infinite" : "none" }}>JARVIS</text>
        <circle cx="0" cy="-22" r="1.5" fill={color} opacity="0.8" />
      </svg>
    </div>
  );
}

// ============================================================
// PANEL CHROME
// ============================================================

function Panel({ title, code, children, accent = "#7DD3FC" }) {
  return (
    <div className="relative bg-slate-950/40 backdrop-blur-sm" style={{ border: `1px solid ${accent}33` }}>
      <div className="absolute -top-px -left-px w-3 h-3 border-t border-l" style={{ borderColor: accent }} />
      <div className="absolute -top-px -right-px w-3 h-3 border-t border-r" style={{ borderColor: accent }} />
      <div className="absolute -bottom-px -left-px w-3 h-3 border-b border-l" style={{ borderColor: accent }} />
      <div className="absolute -bottom-px -right-px w-3 h-3 border-b border-r" style={{ borderColor: accent }} />
      <div className="flex items-center justify-between px-3 py-1.5 border-b" style={{ borderColor: `${accent}22`, background: `${accent}08` }}>
        <div className="flex items-center gap-2">
          <span className="inline-block w-1 h-1 rounded-full" style={{ background: accent, boxShadow: `0 0 6px ${accent}` }} />
          <span className="text-[10px] tracking-[0.25em] uppercase" style={{ color: accent }}>{title}</span>
        </div>
        <span className="text-[9px] tracking-[0.2em] opacity-50" style={{ color: accent }}>{code}</span>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

// ============================================================
// DEFAULT FALLBACKS
// ============================================================

const BRIEFING_LINES = [
  "Good morning. Live briefing data is loading.",
  "Weather, markets, and commodities will populate from your Cloudflare backend.",
  "Standing by.",
];

const FUTURES = [
  { sym: "DJIA", name: "DOW", val: 0, chg: 0, pct: 0 },
  { sym: "NDX", name: "NASDAQ", val: 0, chg: 0, pct: 0 },
  { sym: "SPX", name: "S&P", val: 0, chg: 0, pct: 0 },
];

const COMMODITIES = [
  { sym: "CL", name: "CRUDE OIL", val: 0, chg: 0, unit: "USD" },
  { sym: "GC", name: "GOLD", val: 0, chg: 0, unit: "USD" },
  { sym: "NG", name: "NAT GAS", val: 0, chg: 0, unit: "USD" },
];

function formatNum(value, digits = 2) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "--";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: n % 1 === 0 ? 0 : digits,
    maximumFractionDigits: digits,
  });
}

// ============================================================
// WEATHER PANELS
// ============================================================

function LocalWeather({ data }) {
  const accent = "#7DD3FC";
  const temp = data?.currentTempF ?? "--";
  const forecast = data?.shortForecast ?? "LOADING LIVE WEATHER";
  const detailed = data?.detailedForecast ?? "";
  const wind = data?.wind ?? "--";
  const location = data?.location ?? "LOCAL";
  const updated = data?.updated ? new Date(data.updated).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "--";

  return (
    <Panel title={`LOCAL // ${location}`} code="WX.01" accent={accent}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-4xl font-light tracking-tight" style={{ color: accent }}>{temp}°</div>
          <div className="text-[10px] tracking-[0.2em] opacity-60 mt-1">{forecast}</div>
        </div>
        <div className="text-right text-[10px] tracking-[0.15em] opacity-70 space-y-0.5">
          <div>WIND · {wind}</div>
          <div>UPDATED · {updated}</div>
          <div>NWS · LIVE</div>
        </div>
      </div>

      <div className="relative h-32 overflow-hidden" style={{ background: "#020617", border: `1px solid ${accent}22` }}>
        <svg viewBox="0 0 200 130" className="w-full h-full">
          {[20, 40, 60, 80, 100].map((y) => <line key={`h${y}`} x1="0" y1={y} x2="200" y2={y} stroke={accent} strokeWidth="0.3" opacity="0.15" />)}
          {[40, 80, 120, 160].map((x) => <line key={`v${x}`} x1={x} y1="0" x2={x} y2="130" stroke={accent} strokeWidth="0.3" opacity="0.15" />)}
          <path d="M 20 90 Q 60 70, 100 80 T 180 70 L 180 130 L 20 130 Z" fill={accent} opacity="0.05" />
          <ellipse cx="80" cy="55" rx="35" ry="18" fill="#22D3EE" opacity="0.25" />
          <ellipse cx="85" cy="55" rx="22" ry="10" fill="#A78BFA" opacity="0.3" />
          <g style={{ transformOrigin: "100px 65px", animation: "spin 6s linear infinite" }}>
            <line x1="100" y1="65" x2="100" y2="10" stroke={accent} strokeWidth="0.5" opacity="0.6" />
            <path d="M 100 65 L 100 10 A 55 55 0 0 1 138 25 Z" fill={accent} opacity="0.08" />
          </g>
          <circle cx="100" cy="65" r="2" fill={accent} />
          <text x="103" y="75" fill={accent} fontSize="5" opacity="0.7" fontFamily="monospace">YOU</text>
        </svg>
        <div className="absolute top-1 left-2 text-[8px] tracking-[0.2em]" style={{ color: accent, opacity: 0.7 }}>RADAR · LIVE PANEL</div>
        <div className="absolute bottom-1 right-2 text-[8px] tracking-[0.2em]" style={{ color: accent, opacity: 0.5 }}>NWS</div>
      </div>

      <div className="mt-2 text-[10px] leading-relaxed opacity-70">{detailed}</div>
    </Panel>
  );
}

function NationalWeather({ headline }) {
  const accent = "#7DD3FC";
  return (
    <Panel title="NATIONAL // CONUS" code="WX.02" accent={accent}>
      <div className="relative h-44" style={{ background: "#020617", border: `1px solid ${accent}22` }}>
        <svg viewBox="0 0 300 180" className="w-full h-full">
          {[30, 60, 90, 120, 150].map((y) => <line key={`h${y}`} x1="0" y1={y} x2="300" y2={y} stroke={accent} strokeWidth="0.3" opacity="0.12" />)}
          {[40, 80, 120, 160, 200, 240, 280].map((x) => <line key={`v${x}`} x1={x} y1="0" x2={x} y2="180" stroke={accent} strokeWidth="0.3" opacity="0.12" />)}
          <path d="M 30 60 L 80 50 L 130 45 L 180 48 L 230 55 L 270 70 L 275 100 L 250 130 L 200 145 L 150 150 L 100 145 L 60 130 L 35 110 Z" fill={accent} opacity="0.04" stroke={accent} strokeWidth="0.5" strokeOpacity="0.3" />
          <ellipse cx="55" cy="90" rx="20" ry="35" fill="#22D3EE" opacity="0.35" />
          <ellipse cx="160" cy="85" rx="35" ry="22" fill="#F472B6" opacity="0.3" />
          <ellipse cx="240" cy="70" rx="22" ry="14" fill="#E0E7FF" opacity="0.4" />
          <ellipse cx="180" cy="135" rx="28" ry="10" fill="#34D399" opacity="0.3" />
          <path d="M 80 60 Q 130 80 200 75" fill="none" stroke="#FB7185" strokeWidth="1" strokeDasharray="4 2" opacity="0.6" />
          <path d="M 100 120 Q 160 110 220 125" fill="none" stroke="#22D3EE" strokeWidth="1" strokeDasharray="4 2" opacity="0.6" />
        </svg>
        <div className="absolute top-1 left-2 text-[8px] tracking-[0.2em]" style={{ color: accent, opacity: 0.7 }}>NATIONAL WX OVERVIEW</div>
        <div className="absolute bottom-2 left-2 right-2 text-[9px] leading-relaxed opacity-60" style={{ color: accent }}>{headline || "National map panel is synthetic in this starter build."}</div>
      </div>
    </Panel>
  );
}

// ============================================================
// MARKET PANELS
// ============================================================

function MiniSparkline({ up, color }) {
  const pts = [];
  let y = 50;
  for (let x = 0; x <= 100; x += 5) {
    y += (Math.random() - 0.5) * 8 + (up ? -0.4 : 0.4);
    y = Math.max(15, Math.min(85, y));
    pts.push(`${x},${y}`);
  }
  return (
    <svg viewBox="0 0 100 100" className="w-full h-8" preserveAspectRatio="none">
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.5" opacity="0.9" />
      <polyline points={`${pts.join(" ")} 100,100 0,100`} fill={color} opacity="0.1" />
    </svg>
  );
}

function FuturesPanel({ data = FUTURES }) {
  const accent = "#67E8F9";
  return (
    <Panel title="INDEX FUTURES / PROXIES" code="MKT.01" accent={accent}>
      <div className="space-y-2">
        {data.map((f) => {
          const up = Number(f.chg) >= 0;
          const color = up ? "#34D399" : "#FB7185";
          const pct = Number(f.pct ?? f.percent ?? 0);
          return (
            <div key={f.sym} className="flex items-center gap-3 py-1.5 border-b last:border-b-0" style={{ borderColor: `${accent}15` }}>
              <div className="w-20">
                <div className="text-[10px] tracking-[0.2em] opacity-70">{f.name}</div>
                <div className="text-[8px] tracking-[0.15em] opacity-40">{f.sym}</div>
              </div>
              <div className="flex-1"><MiniSparkline up={up} color={color} /></div>
              <div className="text-right">
                <div className="text-sm font-light tabular-nums" style={{ color: accent }}>{formatNum(f.val)}</div>
                <div className="text-[10px] tabular-nums" style={{ color }}>{up ? "▲" : "▼"} {formatNum(Math.abs(Number(f.chg || 0)))} ({up ? "+" : ""}{formatNum(pct)}%)</div>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function CommoditiesPanel({ data = COMMODITIES }) {
  const accent = "#67E8F9";
  return (
    <Panel title="COMMODITIES / PROXIES" code="MKT.02" accent={accent}>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
        {data.map((c) => {
          const up = Number(c.chg) >= 0;
          const color = up ? "#34D399" : "#FB7185";
          return (
            <div key={c.sym} className="py-1 border-b" style={{ borderColor: `${accent}10` }}>
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] tracking-[0.2em] opacity-70">{c.name}</span>
                <span className="text-[8px] opacity-40 tracking-[0.1em]">{c.sym}</span>
              </div>
              <div className="flex justify-between items-baseline mt-0.5">
                <span className="text-sm font-light tabular-nums" style={{ color: accent }}>{formatNum(c.val)}</span>
                <span className="text-[10px] tabular-nums" style={{ color }}>{up ? "+" : ""}{formatNum(Number(c.chg || 0))}</span>
              </div>
              <div className="text-[8px] opacity-30 tracking-[0.1em] mt-0.5">{c.unit || "USD"}</div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

// ============================================================
// VIDEO + TRANSCRIPT
// ============================================================

function VideoFeed({ network, code, status = "LIVE" }) {
  const accent = "#A78BFA";
  return (
    <Panel title={network} code={code} accent={accent}>
      <div className="relative aspect-video overflow-hidden" style={{ background: "#020617", border: `1px solid ${accent}22` }}>
        <div className="absolute inset-0 pointer-events-none opacity-30" style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${accent}08 2px, ${accent}08 3px)` }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl tracking-[0.3em] font-light mb-2" style={{ color: accent, filter: `drop-shadow(0 0 8px ${accent})` }}>{network}</div>
          <div className="text-[9px] tracking-[0.3em] opacity-60" style={{ color: accent }}>FEED PLACEHOLDER</div>
          <div className="text-[8px] tracking-[0.2em] opacity-40 mt-1" style={{ color: accent }}>AUTHORIZED EMBED REQUIRED</div>
        </div>
        <div className="absolute top-2 left-2 flex items-center gap-1.5 px-1.5 py-0.5" style={{ background: "#FB718533", border: "1px solid #FB7185" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" style={{ animation: "corePulse 1.2s ease-in-out infinite" }} />
          <span className="text-[8px] tracking-[0.2em] text-rose-300">{status}</span>
        </div>
      </div>
    </Panel>
  );
}

function TranscriptPanel({ activeLine, isPlaying, lines = BRIEFING_LINES }) {
  const accent = "#A78BFA";
  return (
    <Panel title="BRIEFING TRANSCRIPT" code="VOX.01" accent={accent}>
      <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
        {lines.map((line, i) => {
          const isActive = isPlaying && i === activeLine;
          const isPast = isPlaying && i < activeLine;
          return (
            <div key={i} className="flex gap-2 text-[11px] leading-relaxed" style={{ color: isActive ? "#E0E7FF" : isPast ? "#94A3B8" : "#64748B", transition: "color 300ms" }}>
              <span className="text-[9px] tabular-nums opacity-50 flex-shrink-0 mt-0.5" style={{ color: accent }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ textShadow: isActive ? `0 0 8px ${accent}66` : "none" }}>{line}</span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

// ============================================================
// MAIN
// ============================================================

export default function JarvisBriefing() {
  const [mode, setMode] = useState("idle");
  const [activeLine, setActiveLine] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [now, setNow] = useState(new Date());
  const [briefingData, setBriefingData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState("");
  const utteranceRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    async function loadBriefing() {
      try {
        setLoadingData(true);
        setDataError("");
        const res = await fetch("/api/briefing", { cache: "no-store" });
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const data = await res.json();
        setBriefingData(data);
      } catch (err) {
        console.error("Failed to load briefing data", err);
        setDataError("LIVE DATA OFFLINE");
      } finally {
        setLoadingData(false);
      }
    }

    loadBriefing();
    const refresh = setInterval(loadBriefing, 5 * 60 * 1000);
    return () => clearInterval(refresh);
  }, []);

  const liveBriefingLines = briefingData?.lines?.length ? briefingData.lines : BRIEFING_LINES;
  const liveWeather = briefingData?.weather;
  const liveFutures = briefingData?.markets?.futures?.length ? briefingData.markets.futures : FUTURES;
  const liveCommodities = briefingData?.markets?.commodities?.length ? briefingData.markets.commodities : COMMODITIES;

  const startBriefing = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setMode("thinking");

    setTimeout(() => {
      setMode("speaking");
      speakLine(0);
    }, 1400);
  };

  const speakLine = (i) => {
    if (i >= liveBriefingLines.length) {
      finishBriefing();
      return;
    }
    setActiveLine(i);

    if (typeof window !== "undefined" && window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance(liveBriefingLines[i]);
      u.rate = 0.95;
      u.pitch = 0.9;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find((v) => /daniel|alex|google uk english male|microsoft david/i.test(v.name)) || voices.find((v) => v.lang?.startsWith("en"));
      if (preferred) u.voice = preferred;
      u.onend = () => speakLine(i + 1);
      u.onerror = () => speakLine(i + 1);
      utteranceRef.current = u;
      window.speechSynthesis.speak(u);
    } else {
      setTimeout(() => speakLine(i + 1), 3000);
    }
  };

  const finishBriefing = () => {
    setIsPlaying(false);
    setActiveLine(-1);
    setMode("idle");
  };

  const stopBriefing = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    finishBriefing();
  };

  const timeStr = now.toLocaleTimeString("en-US", { hour12: false });
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).toUpperCase();

  return (
    <div className="min-h-screen w-full text-slate-200 font-mono relative overflow-hidden" style={{ background: "radial-gradient(ellipse at center, #0B1626 0%, #060B14 60%, #03070D 100%)" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(rgba(125, 211, 252, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(125, 211, 252, 0.05) 1px, transparent 1px)`, backgroundSize: "32px 32px", maskImage: "radial-gradient(ellipse at center, black 30%, transparent 95%)", WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 95%)" }} />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spinReverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes corePulse { 0%, 100% { opacity: 0.85; } 50% { opacity: 1; } }
        @keyframes thinkingPulse { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.1); opacity: 1; } }
        @keyframes scanline { 0% { transform: translateY(-160px); opacity: 0; } 10% { opacity: 0.6; } 90% { opacity: 0.6; } 100% { transform: translateY(160px); opacity: 0; } }
        @keyframes flicker { 0%, 100% { opacity: 1; } 50% { opacity: 0.93; } }
        @keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
      `}</style>

      <div className="relative z-10 flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: "#7DD3FC22" }}>
        <div className="flex items-center gap-4">
          <span className="text-[10px] tracking-[0.3em]" style={{ color: "#7DD3FC" }}>● JARVIS // MORNING BRIEFING</span>
          <span className="text-[10px] tracking-[0.2em] opacity-50">{loadingData ? "SYNCING LIVE DATA" : dataError || "LIVE DATA ONLINE"}</span>
        </div>
        <div className="flex items-center gap-6 text-[10px] tracking-[0.25em]">
          <span className="opacity-60">{dateStr}</span>
          <span style={{ color: "#7DD3FC" }} className="tabular-nums">{timeStr}<span style={{ animation: "blink 1s steps(1) infinite" }}>:</span></span>
          <span className="opacity-50">SYS.{MODE_LABELS[mode]}</span>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-12 gap-3 p-3">
        <div className="col-span-12 lg:col-span-3 space-y-3">
          <LocalWeather data={liveWeather} />
          <NationalWeather headline={liveWeather?.nationalHeadline} />
        </div>

        <div className="col-span-12 lg:col-span-6 space-y-3">
          <div className="relative" style={{ background: "linear-gradient(180deg, #0B162600 0%, #0B162640 100%)", border: "1px solid #7DD3FC22" }}>
            <div className="absolute -top-px -left-px w-3 h-3 border-t border-l" style={{ borderColor: "#7DD3FC" }} />
            <div className="absolute -top-px -right-px w-3 h-3 border-t border-r" style={{ borderColor: "#7DD3FC" }} />
            <div className="absolute -bottom-px -left-px w-3 h-3 border-b border-l" style={{ borderColor: "#7DD3FC" }} />
            <div className="absolute -bottom-px -right-px w-3 h-3 border-b border-r" style={{ borderColor: "#7DD3FC" }} />

            <div className="px-4 pt-4 pb-2 max-w-md mx-auto">
              <JarvisCore mode={mode} />
            </div>

            <div className="flex flex-wrap gap-2 justify-center pb-5 px-4">
              <button onClick={isPlaying ? stopBriefing : startBriefing} className="px-6 py-2.5 text-xs tracking-[0.25em] uppercase border transition-all duration-300" style={{ borderColor: isPlaying ? "#FB7185" : "#7DD3FC", color: isPlaying ? "#FB7185" : "#7DD3FC", background: isPlaying ? "#FB718515" : "#7DD3FC15", boxShadow: `0 0 20px ${isPlaying ? "#FB7185" : "#7DD3FC"}40` }}>
                {isPlaying ? "■ Halt Briefing" : "▶ Run Morning Briefing"}
              </button>
            </div>
          </div>

          <TranscriptPanel activeLine={activeLine} isPlaying={isPlaying} lines={liveBriefingLines} />

          <div className="grid grid-cols-2 gap-3">
            <VideoFeed network="CNN" code="VID.01" />
            <VideoFeed network="BLOOMBERG" code="VID.02" />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-3 space-y-3">
          <FuturesPanel data={liveFutures} />
          <CommoditiesPanel data={liveCommodities} />
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between px-6 py-2 border-t text-[9px] tracking-[0.25em] opacity-50" style={{ borderColor: "#7DD3FC22" }}>
        <span>DATA · LIVE API // CLOUDFLARE</span>
        <span>FEEDS: NWS · TWELVE DATA · AI BRIEFING</span>
        <span>0x4A.7F2C</span>
      </div>
    </div>
  );
}

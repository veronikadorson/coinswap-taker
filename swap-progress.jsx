// swap-progress.jsx
// Coinswap "swap in progress" animation through 3 makers.

const PALETTE = {
  bg: '#08080a',
  bg2: '#0d0d12',
  surface1: '#101014',
  surface2: '#16161a',
  surface3: '#1c1c22',
  surface4: '#1f1f25',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.14)',
  text: '#f5f5f7',
  text2: '#a7a7ad',
  text3: '#6c6c72',
  blue: '#5b8def',
  blueHover: '#7da3f5',
  green: '#2fbf71',
  amber: '#ffb547',
  red: '#ff4d5a',
};

const FONT_MONO = 'ui-monospace, "SF Mono", Menlo, Monaco, Consolas, monospace';
const FONT_SANS = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Helvetica, Arial, sans-serif';

const NODES = [
  { id: 'you',  label: 'Your wallet',   sub: 'bcrt1q…x9p2',       type: 'wallet', x: 220 },
  { id: 'm1',   label: 'Maker 01',      sub: 'vdd56f…n2eh',       type: 'maker',  x: 600 },
  { id: 'm2',   label: 'Maker 02',      sub: 'kp8a3r…m6xr',       type: 'maker',  x: 960 },
  { id: 'm3',   label: 'Maker 03',      sub: 'bn4qrx…yh8n',       type: 'maker',  x: 1320 },
  { id: 'dest', label: 'Receiving',     sub: 'bcrt1p…k7a3',       type: 'wallet', x: 1700 },
];
const NODE_W = 220;
const NODE_H = 200;
const NODE_Y = 440;
const CONNECT_Y = NODE_Y + NODE_H / 2;

const TOTAL = 18;

const PHASES = [
  { name: 'Initiating',                 start: 0,  end: 3,   idx: 1 },
  { name: 'Establishing Tor circuits',  start: 3,  end: 6,   idx: 2 },
  { name: 'Funding HTLC contracts',     start: 6,  end: 9.5, idx: 3 },
  { name: 'Routing atomic swap',        start: 9.5,end: 14,  idx: 4 },
  { name: 'Finalizing',                 start: 14, end: 18,  idx: 5 },
];

function currentPhase(t) {
  for (const p of PHASES) {
    if (t >= p.start && t < p.end) return p;
  }
  return PHASES[PHASES.length - 1];
}

// ===== Background =====
function Background() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `
        radial-gradient(ellipse 80% 60% at 50% 30%, rgba(91,141,239,0.10) 0%, transparent 60%),
        radial-gradient(ellipse 60% 40% at 50% 100%, rgba(91,141,239,0.06) 0%, transparent 60%),
        ${PALETTE.bg}
      `,
    }}>
      {/* Subtle grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 100%)',
      }} />
    </div>
  );
}

// ===== Top bar (eyebrow + phase title + progress) =====
function TopBar() {
  const t = useTime();
  const phase = currentPhase(t);
  const sinceStart = t - phase.start;
  const fadeIn = clamp(sinceStart / 0.4, 0, 1);
  const ty = (1 - Easing.easeOutCubic(fadeIn)) * 14;

  return (
    <div style={{ position: 'absolute', top: 80, left: 0, right: 0, textAlign: 'center' }}>
      <div style={{
        fontFamily: FONT_MONO,
        fontSize: 13,
        color: PALETTE.text3,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        marginBottom: 14,
      }}>
        Step <span style={{ color: PALETTE.blue }}>{phase.idx}</span> of 5 · Swap in progress
      </div>
      <div style={{
        fontFamily: FONT_SANS,
        fontSize: 52,
        fontWeight: 700,
        color: PALETTE.text,
        letterSpacing: '-0.03em',
        opacity: fadeIn,
        transform: `translateY(${ty}px)`,
        lineHeight: 1,
        marginBottom: 8,
      }}>
        {phase.name}<span style={{ color: PALETTE.blue }}>.</span>
      </div>
      <div style={{
        fontFamily: FONT_MONO,
        fontSize: 12,
        color: PALETTE.text3,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginTop: 18,
      }}>
        <ProgressBar />
      </div>
    </div>
  );
}

function ProgressBar() {
  const t = useTime();
  const pct = clamp(t / TOTAL, 0, 1) * 100;
  return (
    <div style={{
      width: 420, height: 4, margin: '0 auto',
      background: 'rgba(255,255,255,0.06)',
      borderRadius: 999, overflow: 'hidden', position: 'relative',
    }}>
      <div style={{
        width: `${pct}%`, height: '100%',
        background: `linear-gradient(90deg, ${PALETTE.blue} 0%, ${PALETTE.blueHover} 100%)`,
        borderRadius: 999,
        boxShadow: `0 0 12px ${PALETTE.blue}`,
        transition: 'width 80ms linear',
      }} />
    </div>
  );
}

// ===== Node =====
const WalletIcon = ({ color }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="6" width="18" height="13" rx="2"/>
    <path d="M16 13h2"/>
    <path d="M3 9h15"/>
  </svg>
);
const OnionIcon = ({ color }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="13" rx="7" ry="8"/>
    <ellipse cx="12" cy="13" rx="4" ry="5"/>
    <circle cx="12" cy="13" r="1.2" fill={color}/>
    <path d="M12 2v3"/>
  </svg>
);

function NodeStatus({ nodeId, t }) {
  let label = '—', tone = 'dim', lock = false, check = false;

  if (t < 3) {
    label = 'Awaiting'; tone = 'dim';
  } else if (t < 6) {
    const order = { you: 3.1, m1: 3.6, m2: 4.1, m3: 4.6, dest: 5.1 };
    if (t >= order[nodeId]) { label = 'Connected'; tone = 'green'; }
    else if (t >= order[nodeId] - 0.4) { label = 'Connecting…'; tone = 'amber'; }
    else { label = 'Awaiting'; tone = 'dim'; }
  } else if (t < 9.5) {
    if (nodeId === 'you') { label = 'Funding'; tone = 'blue'; }
    else if (nodeId === 'dest') { label = 'Waiting'; tone = 'dim'; }
    else {
      const lockAt = { m1: 7.0, m2: 8.0, m3: 9.0 }[nodeId];
      if (t >= lockAt) { label = 'HTLC locked'; tone = 'amber'; lock = true; }
      else if (t >= lockAt - 0.8) { label = 'Receiving'; tone = 'blue'; }
      else { label = 'Connected'; tone = 'green'; }
    }
  } else if (t < 14) {
    if (nodeId === 'you') { label = 'Sent'; tone = 'green'; check = true; }
    else if (nodeId === 'dest') {
      if (t >= 13.6) { label = 'Received'; tone = 'green'; check = true; }
      else if (t >= 12.8) { label = 'Receiving'; tone = 'blue'; }
      else { label = 'Waiting'; tone = 'dim'; }
    } else {
      const arrive = { m1: 10.8, m2: 11.8, m3: 12.8 }[nodeId];
      const forward = arrive + 0.8;
      if (t >= forward) { label = 'Forwarded'; tone = 'green'; check = true; }
      else if (t >= arrive) { label = 'Forwarding'; tone = 'blue'; lock = true; }
      else { label = 'HTLC locked'; tone = 'amber'; lock = true; }
    }
  } else {
    if (nodeId === 'you') { label = 'Complete'; tone = 'green'; check = true; }
    else if (nodeId === 'dest') { label = 'Received'; tone = 'green'; check = true; }
    else { label = 'Settled'; tone = 'green'; check = true; }
  }

  return { label, tone, lock, check };
}

const TONE_COLOR = {
  dim:   { fg: PALETTE.text3, bg: 'rgba(255,255,255,0.04)',   bd: PALETTE.border },
  green: { fg: PALETTE.green, bg: 'rgba(47,191,113,0.10)',    bd: 'rgba(47,191,113,0.28)' },
  blue:  { fg: PALETTE.blue,  bg: 'rgba(91,141,239,0.12)',    bd: 'rgba(91,141,239,0.30)' },
  amber: { fg: PALETTE.amber, bg: 'rgba(255,181,71,0.10)',    bd: 'rgba(255,181,71,0.28)' },
  red:   { fg: PALETTE.red,   bg: 'rgba(255,77,90,0.10)',     bd: 'rgba(255,77,90,0.28)' },
};

function StatusPill({ tone, children, withDot = true }) {
  const c = TONE_COLOR[tone] || TONE_COLOR.dim;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 9px',
      borderRadius: 6,
      background: c.bg,
      border: `1px solid ${c.bd}`,
      color: c.fg,
      fontFamily: FONT_MONO,
      fontSize: 10.5,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>
      {withDot && (
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: c.fg, boxShadow: `0 0 6px ${c.fg}`,
        }} />
      )}
      {children}
    </div>
  );
}

function Node({ node, index }) {
  const t = useTime();
  const appearStart = 0.4 + index * 0.18;
  const appearEnd = appearStart + 0.6;
  const p = clamp((t - appearStart) / (appearEnd - appearStart), 0, 1);
  if (p <= 0) return null;
  const eased = Easing.easeOutBack(p);
  const status = NodeStatus({ nodeId: node.id, t });
  const c = TONE_COLOR[status.tone];

  // Pulse rim when "active" (blue tone)
  const activePulse = status.tone === 'blue'
    ? 0.5 + 0.5 * Math.sin((t - appearStart) * 6)
    : 0;
  const ringColor = c.fg;
  const ringStrength = status.tone === 'blue' ? activePulse : (status.tone === 'green' ? 0.6 : status.tone === 'amber' ? 0.5 : 0);

  // Coin-arrival flash (brief on each label change for funding/routing)
  return (
    <div style={{
      position: 'absolute',
      left: node.x - NODE_W / 2,
      top: NODE_Y,
      width: NODE_W,
      height: NODE_H,
      background: PALETTE.surface2,
      border: `1px solid ${PALETTE.border}`,
      borderRadius: 16,
      padding: '20px 18px',
      opacity: p,
      transform: `translateY(${(1 - eased) * 24}px) scale(${0.92 + 0.08 * eased})`,
      boxShadow: ringStrength > 0
        ? `0 0 0 1px ${c.bd}, 0 0 40px ${ringColor}${ringStrength > 0.5 ? '55' : '33'}`
        : 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      transition: 'box-shadow 200ms ease',
      overflow: 'hidden',
    }}>
      {/* Top: icon + type chip */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: status.tone === 'dim' ? PALETTE.surface3 : c.bg,
          border: `1px solid ${status.tone === 'dim' ? PALETTE.border : c.bd}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 200ms, border-color 200ms',
        }}>
          {node.type === 'wallet'
            ? <WalletIcon color={status.tone === 'dim' ? PALETTE.text3 : c.fg} />
            : <OnionIcon  color={status.tone === 'dim' ? PALETTE.text3 : c.fg} />}
        </div>
        <div style={{
          fontFamily: FONT_MONO,
          fontSize: 10,
          letterSpacing: '0.12em',
          color: PALETTE.text3,
          textTransform: 'uppercase',
        }}>
          {node.type === 'wallet' ? (node.id === 'you' ? 'Taker' : 'Output') : 'Maker'}
        </div>
      </div>

      {/* Label */}
      <div style={{
        fontFamily: FONT_SANS,
        fontSize: 16,
        fontWeight: 600,
        color: PALETTE.text,
        letterSpacing: '-0.01em',
      }}>{node.label}</div>

      {/* Tor / address */}
      <div style={{
        fontFamily: FONT_MONO,
        fontSize: 11.5,
        color: PALETTE.text2,
        letterSpacing: '-0.005em',
        marginTop: -4,
      }}>{node.sub}</div>

      {/* Status pill */}
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <StatusPill tone={status.tone}>{status.label}</StatusPill>
        {status.check && (
          <span style={{
            width: 22, height: 22, borderRadius: '50%',
            background: TONE_COLOR.green.bg,
            border: `1px solid ${TONE_COLOR.green.bd}`,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: PALETTE.green,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </span>
        )}
        {!status.check && status.lock && (
          <span style={{
            width: 22, height: 22, borderRadius: '50%',
            background: TONE_COLOR.amber.bg,
            border: `1px solid ${TONE_COLOR.amber.bd}`,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: PALETTE.amber,
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="11" width="14" height="10" rx="2"/>
              <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
            </svg>
          </span>
        )}
      </div>
    </div>
  );
}

// ===== Connectors =====
function Connector({ fromIdx, toIdx, startAt, endAt }) {
  const t = useTime();
  const from = NODES[fromIdx];
  const to = NODES[toIdx];
  const x1 = from.x + NODE_W / 2;
  const x2 = to.x - NODE_W / 2;
  const y = CONNECT_Y;

  const fillP = clamp((t - startAt) / Math.max(endAt - startAt, 0.001), 0, 1);
  const eased = Easing.easeInOutCubic(fillP);
  const fillX = x1 + (x2 - x1) * eased;

  const opacity = t >= startAt - 1 ? 1 : 0;

  return (
    <>
      {/* base line */}
      <div style={{
        position: 'absolute',
        left: x1, top: y - 0.5,
        width: x2 - x1, height: 1,
        background: PALETTE.border,
        opacity,
      }} />
      {/* filled portion */}
      {fillP > 0 && (
        <div style={{
          position: 'absolute',
          left: x1, top: y - 1,
          width: fillX - x1, height: 2,
          background: PALETTE.blue,
          boxShadow: `0 0 8px ${PALETTE.blue}`,
        }} />
      )}
      {/* arrow head when complete */}
      {fillP >= 1 && (
        <div style={{
          position: 'absolute',
          left: x2 - 10, top: y - 6,
          width: 12, height: 12,
          borderRight: `2px solid ${PALETTE.blue}`,
          borderTop: `2px solid ${PALETTE.blue}`,
          transform: 'rotate(45deg)',
          opacity: 0.9,
        }} />
      )}
    </>
  );
}

// ===== Tor circuit overlay (curved arcs from You to each Maker, briefly) =====
function TorCircuits() {
  const t = useTime();
  if (t < 3 || t > 6.3) return null;
  const you = NODES[0];
  const makers = [NODES[1], NODES[2], NODES[3]];
  const startX = you.x + NODE_W / 2;
  const startY = NODE_Y + 20;
  return (
    <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {makers.map((m, i) => {
        const phase = 3.1 + i * 0.5;
        const localP = clamp((t - phase) / 0.9, 0, 1);
        if (localP <= 0) return null;
        const endX = m.x;
        const endY = NODE_Y + 20;
        const midX = (startX + endX) / 2;
        const midY = startY - 120 - i * 30;
        const path = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;
        const totalLen = Math.hypot(endX - startX, endY - startY) + 60;
        return (
          <g key={m.id}>
            <path d={path} stroke={PALETTE.blue} strokeWidth="1.5" fill="none"
              strokeDasharray="4 6" opacity={0.55 * localP}
              style={{ filter: `drop-shadow(0 0 4px ${PALETTE.blue})` }}
            />
            {/* travelling dot */}
            <circle cx="0" cy="0" r="4" fill={PALETTE.blueHover}>
              <animateMotion dur="1.2s" repeatCount="indefinite" path={path} />
            </circle>
          </g>
        );
      })}
    </svg>
  );
}

// ===== Coin packets =====
function CoinPacket({ from, to, start, end, label }) {
  const t = useTime();
  if (t < start || t > end + 0.5) return null;
  const p = clamp((t - start) / (end - start), 0, 1);
  const eased = Easing.easeInOutCubic(p);
  const x = from.x + (to.x - from.x) * eased;
  const y = from.y + (to.y - from.y) * eased - Math.sin(p * Math.PI) * 16;
  const fadeOut = t > end ? 1 - (t - end) / 0.5 : 1;

  return (
    <>
      {/* trail */}
      {p > 0.05 && (
        <div style={{
          position: 'absolute',
          left: from.x, top: from.y - 2,
          width: x - from.x, height: 4,
          background: `linear-gradient(90deg, transparent 0%, ${PALETTE.blue}88 60%, ${PALETTE.blueHover} 100%)`,
          borderRadius: 999,
          opacity: 0.45 * fadeOut,
          transformOrigin: 'left center',
        }} />
      )}
      {/* dot */}
      <div style={{
        position: 'absolute',
        left: x - 9, top: y - 9,
        width: 18, height: 18,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${PALETTE.blueHover} 0%, ${PALETTE.blue} 70%, transparent 100%)`,
        boxShadow: `0 0 16px ${PALETTE.blue}, 0 0 32px ${PALETTE.blue}88`,
        opacity: fadeOut,
      }} />
      {label && (
        <div style={{
          position: 'absolute',
          left: x + 14, top: y - 28,
          fontFamily: FONT_MONO,
          fontSize: 10.5,
          color: PALETTE.text,
          letterSpacing: '0.04em',
          background: 'rgba(91,141,239,0.18)',
          border: `1px solid ${PALETTE.blue}`,
          padding: '3px 7px',
          borderRadius: 5,
          opacity: fadeOut,
          whiteSpace: 'nowrap',
        }}>{label}</div>
      )}
    </>
  );
}

function CoinPackets() {
  // funding: from You to each Maker (parallel, staggered)
  const fundPts = [];
  for (let i = 0; i < 3; i++) {
    const targetNode = NODES[1 + i];
    fundPts.push({
      from: { x: NODES[0].x, y: CONNECT_Y },
      to:   { x: targetNode.x, y: CONNECT_Y },
      start: 6.2 + i * 0.6,
      end:   7.0 + i * 0.6,
      label: '0.0500 BTC',
    });
  }
  // routing: hop-by-hop through chain
  const hops = [];
  for (let i = 0; i < 4; i++) {
    const a = NODES[i];
    const b = NODES[i + 1];
    hops.push({
      from: { x: a.x, y: CONNECT_Y },
      to:   { x: b.x, y: CONNECT_Y },
      start: 10.2 + i * 0.85,
      end:   10.95 + i * 0.85,
      label: ['0.0500', '0.04985', '0.04970', '0.04955'][i] + ' BTC',
    });
  }

  return (
    <>
      {fundPts.map((p, i) => <CoinPacket key={'f' + i} {...p} />)}
      {hops.map((p, i) => <CoinPacket key={'h' + i} {...p} />)}
    </>
  );
}

// ===== Activity log =====
const LOG_LINES = [
  { at: 0.4,  tag: 'init',     text: 'new swap session — id 7fa2e1c8' },
  { at: 1.0,  tag: 'wallet',   text: 'selected 3 UTXOs · 0.0500 BTC' },
  { at: 1.9,  tag: 'market',   text: 'querying 8 candidate makers' },
  { at: 3.1,  tag: 'tor',      text: 'circuit → maker-01' },
  { at: 3.6,  tag: 'tor',      text: 'circuit → maker-02' },
  { at: 4.1,  tag: 'tor',      text: 'circuit → maker-03' },
  { at: 5.0,  tag: 'handshake',text: 'makers acknowledged · 3/3' },
  { at: 6.4,  tag: 'tx',       text: 'funding tx → maker-01 (htlc-locked)' },
  { at: 7.0,  tag: 'tx',       text: 'funding tx → maker-02 (htlc-locked)' },
  { at: 7.6,  tag: 'tx',       text: 'funding tx → maker-03 (htlc-locked)' },
  { at: 9.6,  tag: 'hop',      text: 'you → maker-01 · 0.0500 BTC' },
  { at: 10.5, tag: 'hop',      text: 'maker-01 → maker-02 · 0.04985 BTC' },
  { at: 11.4, tag: 'hop',      text: 'maker-02 → maker-03 · 0.04970 BTC' },
  { at: 12.3, tag: 'hop',      text: 'maker-03 → receiving · 0.04955 BTC' },
  { at: 13.6, tag: 'preimage', text: 'preimage revealed · contracts unwound' },
  { at: 15.0, tag: 'complete', text: 'received 0.04955 BTC at bcrt1p…k7a3' },
];

const TAG_COLOR = {
  init: PALETTE.text3, wallet: PALETTE.text3, market: PALETTE.text3,
  tor: PALETTE.blue, handshake: PALETTE.blue,
  tx: PALETTE.amber,
  hop: PALETTE.blue,
  preimage: PALETTE.green,
  complete: PALETTE.green,
};

function ActivityLog() {
  const t = useTime();
  const visible = LOG_LINES.filter(l => t >= l.at).slice(-6);

  return (
    <div style={{
      position: 'absolute',
      left: 200, right: 200,
      bottom: 180,
      height: 170,
      background: 'rgba(16,16,20,0.6)',
      border: `1px solid ${PALETTE.border}`,
      borderRadius: 12,
      padding: '14px 20px',
      display: 'flex', flexDirection: 'column-reverse',
      gap: 4,
      overflow: 'hidden',
      backdropFilter: 'blur(8px)',
    }}>
      {visible.slice().reverse().map((l, idx) => {
        const age = t - l.at;
        const fade = clamp(age / 0.35, 0, 1);
        const ty = (1 - Easing.easeOutCubic(fade)) * 8;
        return (
          <div key={l.at} style={{
            fontFamily: FONT_MONO,
            fontSize: 13,
            color: PALETTE.text2,
            display: 'flex',
            gap: 14,
            opacity: idx === 0 ? fade : 1,
            transform: `translateY(${idx === 0 ? ty : 0}px)`,
            letterSpacing: '-0.005em',
          }}>
            <span style={{
              color: PALETTE.text3,
              fontSize: 11.5,
              letterSpacing: '0.04em',
              width: 56,
            }}>
              {fmtClock(l.at)}
            </span>
            <span style={{
              color: TAG_COLOR[l.tag] || PALETTE.text3,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontSize: 11,
              width: 90,
            }}>
              [{l.tag}]
            </span>
            <span style={{ color: idx === 0 ? PALETTE.text : PALETTE.text2 }}>{l.text}</span>
          </div>
        );
      })}
    </div>
  );
}

function fmtClock(t) {
  const s = Math.floor(t);
  const cs = Math.floor((t - s) * 100);
  return `${String(s).padStart(2,'0')}.${String(cs).padStart(2,'0')}`;
}

// ===== Bottom strip (amount / hops / fee / receive / ETA) =====
function BottomStrip() {
  const t = useTime();
  const phase = currentPhase(t);
  const etaTotalSec = 180; // 3 minutes total ETA
  const elapsed = clamp(t / TOTAL, 0, 1) * etaTotalSec;
  const remaining = Math.max(0, etaTotalSec - elapsed);
  const mm = Math.floor(remaining / 60);
  const ss = Math.floor(remaining % 60);

  const stats = [
    { l: 'Amount',     v: '0.05000000', u: 'BTC' },
    { l: 'Hops',       v: '3' },
    { l: 'Fee',        v: '0.00045',   u: 'BTC' },
    { l: 'You receive',v: t > 14 ? '0.04955' : '—', u: 'BTC', accent: true },
    { l: 'ETA',        v: `${mm}m ${String(ss).padStart(2,'0')}s` },
  ];
  return (
    <div style={{
      position: 'absolute',
      left: 0, right: 0, bottom: 60,
      display: 'flex', justifyContent: 'center',
    }}>
      <div style={{
        display: 'flex', gap: 0,
        background: PALETTE.surface2,
        border: `1px solid ${PALETTE.border}`,
        borderRadius: 14,
        overflow: 'hidden',
      }}>
        {stats.map((s, i) => (
          <div key={s.l} style={{
            padding: '14px 32px',
            borderRight: i < stats.length - 1 ? `1px solid ${PALETTE.border}` : 'none',
            minWidth: 160,
          }}>
            <div style={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              letterSpacing: '0.12em',
              color: PALETTE.text3,
              textTransform: 'uppercase',
              marginBottom: 6,
            }}>{s.l}</div>
            <div style={{
              fontFamily: FONT_MONO,
              fontSize: 20,
              fontWeight: 600,
              color: s.accent ? PALETTE.green : PALETTE.text,
              letterSpacing: '-0.02em',
            }}>
              {s.v}
              {s.u && <span style={{ fontSize: 11, color: PALETTE.text3, letterSpacing: '0.06em', marginLeft: 5, textTransform: 'uppercase' }}>{s.u}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== Success burst overlay =====
function SuccessBurst() {
  const t = useTime();
  if (t < 15) return null;
  const p = clamp((t - 15) / 1.0, 0, 1);
  const eased = Easing.easeOutBack(p);

  // ripple rings
  const rippleCount = 3;
  const ripples = [];
  for (let i = 0; i < rippleCount; i++) {
    const rT = clamp((t - 15 - i * 0.2) / 1.2, 0, 1);
    if (rT > 0 && rT < 1) {
      const size = 40 + rT * 220;
      ripples.push(
        <div key={i} style={{
          position: 'absolute',
          left: NODES[4].x - size / 2,
          top:  CONNECT_Y - size / 2,
          width: size, height: size,
          borderRadius: '50%',
          border: `2px solid ${PALETTE.green}`,
          opacity: 1 - rT,
          pointerEvents: 'none',
        }} />
      );
    }
  }

  return (
    <>
      {ripples}
      <div style={{
        position: 'absolute',
        left: NODES[4].x - 130, top: NODE_Y - 76,
        width: 260,
        textAlign: 'center',
        opacity: p,
        transform: `translateY(${(1 - eased) * 10}px) scale(${0.85 + 0.15 * eased})`,
        transformOrigin: 'center',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: TONE_COLOR.green.bg,
          border: `1px solid ${TONE_COLOR.green.bd}`,
          borderRadius: 999,
          padding: '8px 16px',
          fontFamily: FONT_MONO,
          fontSize: 12,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: PALETTE.green,
          boxShadow: `0 0 20px rgba(47,191,113,0.4)`,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Swap complete
        </div>
      </div>
    </>
  );
}

// ===== Header chrome (top-left brand, top-right close) =====
function Chrome() {
  return (
    <>
      <div style={{
        position: 'absolute', top: 36, left: 48,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 9,
          background: PALETTE.blue,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: FONT_MONO, fontWeight: 700, fontSize: 15, color: '#fff',
        }}>C</div>
        <div>
          <div style={{ fontFamily: FONT_MONO, color: PALETTE.blue, fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>Coinswap</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 9.5, color: PALETTE.text3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Taker app</div>
        </div>
      </div>

      <div style={{
        position: 'absolute', top: 38, right: 48,
        display: 'flex', alignItems: 'center', gap: 10,
        fontFamily: FONT_MONO, fontSize: 11, color: PALETTE.text3,
        letterSpacing: '0.1em', textTransform: 'uppercase',
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: PALETTE.green, boxShadow: `0 0 8px ${PALETTE.green}`,
        }} />
        Mainnet · v0.4.2
      </div>
    </>
  );
}

// ===== Scene root =====
function Scene() {
  return (
    <>
      <Background />
      <Chrome />
      <TopBar />

      {/* connectors (between adjacent nodes) */}
      <Connector fromIdx={0} toIdx={1} startAt={3.1} endAt={3.9} />
      <Connector fromIdx={1} toIdx={2} startAt={3.6} endAt={4.4} />
      <Connector fromIdx={2} toIdx={3} startAt={4.1} endAt={4.9} />
      <Connector fromIdx={3} toIdx={4} startAt={4.6} endAt={5.4} />

      <TorCircuits />
      <CoinPackets />

      {NODES.map((n, i) => <Node key={n.id} node={n} index={i} />)}

      <ActivityLog />
      <BottomStrip />
      <SuccessBurst />
    </>
  );
}

function App() {
  return (
    <Stage width={1920} height={1080} duration={TOTAL} background={PALETTE.bg} loop={false} autoplay={true} persistKey="swap-progress">
      <Scene />
    </Stage>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

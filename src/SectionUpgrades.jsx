import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import MagicBento from './react-bits/MagicBento/MagicBento.jsx';
import PixelCard from './react-bits/PixelCard/PixelCard.jsx';
import ScrollStack, { ScrollStackItem } from './react-bits/ScrollStack/ScrollStack.jsx';
import './section-upgrades.css';

const labs = [
  { id: 'security', label: 'Cryptography', number: '01', title: 'A small change. An entirely new fingerprint.', description: 'Type a sample message and inspect its SHA-256 digest. Computed locally in your browser.', launch: 'Open security lab', action: () => window.openCryptoModal() },
  { id: 'network', label: 'Networks', number: '02', title: 'Before the conversation, a handshake.', description: 'Step through a modeled TCP connection. Three packets establish the connection; this preview sends no network traffic.', launch: 'Open TCP / TLS lab', action: () => window.openNetworkModal() },
  { id: 'terminal', label: 'Terminal', number: '03', title: 'A different way into the sanctuary.', description: 'Explore a small command preview, then launch the full portfolio terminal. Its system effects are simulated.', launch: 'Launch cyber terminal', action: () => window.toggleCyberTerminal() }
];
const packets = [
  { name: 'SYN', direction: 'right', note: 'Client requests a connection.' },
  { name: 'SYN + ACK', direction: 'left', note: 'Server acknowledges and replies.' },
  { name: 'ACK', direction: 'right', note: 'Client acknowledges. Connection established.' }
];

function SkillDiagram({ index }) {
  return <svg className={`skill-diagram skill-diagram-${index}`} viewBox="0 0 220 110" fill="none" aria-hidden="true">
    {index === 0 && <><path d="m110 8 39 15v30c0 23-17 39-39 49-22-10-39-26-39-49V23z"/><path className="diagram-accent" d="m92 54 12 12 25-27"/><path d="M5 55h48m114 0h48M23 34h30m114 42h30"/><circle cx="12" cy="34" r="3"/><circle cx="207" cy="76" r="3"/></>}
    {index === 1 && <><rect x="9" y="16" width="86" height="69" rx="2"/><path d="M9 31h86m-73-7h4m6 0h4m6 0h4M29 47l-8 9 8 9m44-18 8 9-8 9M58 42 45 71"/><rect x="139" y="27" width="70" height="61" rx="2"/><path className="diagram-accent" d="M95 51h44m-8-6 8 6-8 6M139 70H95m8-6-8 6 8 6"/><path d="M154 43h39m-39 12h39m-39 12h23"/></>}
    {index === 2 && <><rect x="8" y="27" width="50" height="42" rx="2"/><rect x="162" y="27" width="50" height="42" rx="2"/><path d="M19 79h28m126 0h28M33 69v10m154-10v10M79 32h62m-62 16h62m-62 16h62"/><path className="diagram-accent" d="m130 26 11 6-11 6m-40 4-11 6 11 6m40 4 11 6-11 6"/><circle cx="110" cy="90" r="3"/></>}
    {index === 3 && <><path d="M27 54h43m40 0h43m-43 0V22m0 32v32"/><circle cx="110" cy="54" r="20"/><rect x="8" y="39" width="26" height="29" rx="2"/><rect x="153" y="39" width="54" height="29" rx="2"/><circle cx="110" cy="13" r="8"/><circle cx="110" cy="96" r="8"/><path className="diagram-accent" d="m102 54 6 6 11-13M165 50h28m-28 8h16"/></>}
  </svg>;
}

function Arsenal({ records, reduced }) {
  const items = records.map((record, index) => ({
    id: record.number, colSpan: index === 0 || index === 3 ? 4 : 2,
    content: <article className="arsenal-panel">
      <div className="instrument-meta"><span>DISCIPLINE / {record.number}</span><span className="discipline-mark" aria-hidden="true">{['守', '作', '網', '具'][index]}</span></div>
      <div className="arsenal-panel-heading"><h3>{record.title}</h3><SkillDiagram index={index} /></div>
      <p className="arsenal-panel-subtitle">{record.subtitle}</p>
      <ul className="tool-tags" aria-label="Technologies">{record.tools.map(tool => <li key={tool}>{tool}</li>)}</ul>
      <details className="discipline-context"><summary>Engineering context <span aria-hidden="true">+</span></summary><p>{record.description}</p></details>
      <div className="arsenal-panel-foot"><span>{record.level}</span><div>{record.links.map(link => <a key={link.href} href={link.href}>{link.label}</a>)}</div></div>
    </article>
  }));
  return <div className="arsenal-exhibition"><MagicBento items={items} columns={6} rowHeight={320} radius={3} gap={16} glowColor="#c4a16c" spotlightRadius={340} textAutoHide={false} enableTilt={false} enableMagnetism={false} enableStars={false} clickEffect={false} intro={!reduced} disableAnimations={reduced} className="arsenal-bento" style={{ gridAutoRows: 'minmax(320px,auto)', '--mb-surface': 'linear-gradient(145deg,#18201f,#0c1112)', '--mb-ink': '#e8e7e0', '--mb-muted': '#aab4ad', '--mb-edge': 'rgba(232,231,224,.17)', '--mb-shadow': 'none', '--mb-pad': 'clamp(22px,2.5vw,38px)' }} /></div>;
}

function HashInstrument() {
  const [sample, setSample] = useState('curiosity');
  const [hash, setHash] = useState('');
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let current = true;
    setHash(''); setFailed(false);
    if (!window.crypto?.subtle) { setFailed(true); return; }
    window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(sample)).then(buffer => {
      if (current) setHash(Array.from(new Uint8Array(buffer), byte => byte.toString(16).padStart(2, '0')).join(''));
    }).catch(() => { if (current) setFailed(true); });
    return () => { current = false; };
  }, [sample]);
  return <div className="hash-instrument">
    <label htmlFor="workshop-sample">01 / SAMPLE MESSAGE</label>
    <input id="workshop-sample" value={sample} maxLength={180} onChange={event => setSample(event.target.value)} autoComplete="off" spellCheck={false} />
    <div className="instrument-transform" aria-hidden="true"><span />SHA-256<span /></div>
    <div className="digest-grid" role="group" aria-label="SHA-256 digest" aria-busy={!hash && !failed}>{Array.from({ length: 32 }, (_, i) => <span key={i}>{hash.slice(i * 2, i * 2 + 2) || '··'}</span>)}</div>
    <p className="instrument-note" role="status">{failed ? 'This browser cannot run the digest preview. You can still open the security lab.' : '32 BYTES / 256 BITS / COMPUTED LOCALLY'}</p>
  </div>;
}

function NetworkInstrument() {
  const [step, setStep] = useState(0);
  return <div className="network-instrument">
    <div className="network-peers"><span>CLIENT<i>Initiator</i></span><span>SERVER<i>Listener</i></span></div>
    <ol className="packet-sequence">{packets.map((packet, index) => <li key={packet.name} data-arrived={index < step}><span>{String(index + 1).padStart(2, '0')}</span><div className={`packet-wire ${packet.direction}`}><i /><b>{packet.name}</b><em aria-hidden="true">{packet.direction === 'right' ? '→' : '←'}</em></div></li>)}</ol>
    <div className="packet-controls"><button type="button" onClick={() => setStep(value => value === 3 ? 0 : value + 1)}>{step === 3 ? 'Reset sequence ↺' : 'Send next packet →'}</button><span aria-live="polite">{step === 0 ? 'Ready to connect.' : packets[step - 1].note}</span></div>
    <p className="instrument-note">TCP MODEL / NO PACKETS LEAVE YOUR BROWSER</p>
  </div>;
}

function TerminalInstrument() {
  const [command, setCommand] = useState('help');
  const outputs = { help: ['Available in this preview:', 'projects   whoami   help'], projects: ['AEGIS-X / Tri-Shield / InboxIQ', 'TCP/IP Simulator / DrainSentinel / LibraryLens'], whoami: ['Debayan Lahiry', 'Cybersecurity student / software developer'] };
  return <div className="terminal-instrument"><div className="terminal-title"><span aria-hidden="true">● ● ●</span>DEBX / PORTFOLIO SHELL</div><div className="terminal-screen"><p><span>visitor@debx:~</span> $ {command}</p><output>{outputs[command].map(line => <span key={line}>{line}</span>)}</output><p className="terminal-prompt" aria-hidden="true"><span>visitor@debx:~</span> $ <i>▌</i></p></div><div className="terminal-commands" role="group" aria-label="Try a preview command">{Object.keys(outputs).map(value => <button type="button" key={value} aria-pressed={value === command} onClick={() => setCommand(value)}>{value}</button>)}</div><p className="instrument-note">PORTFOLIO PREVIEW / SIMULATED SHELL</p></div>;
}

function Workshop({ reduced }) {
  const [selected, setSelected] = useState(0);
  const buttons = useRef([]);
  const lab = labs[selected];
  const onKey = event => {
    let next;
    if (event.key === 'ArrowRight') next = (selected + 1) % labs.length;
    if (event.key === 'ArrowLeft') next = (selected + labs.length - 1) % labs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = labs.length - 1;
    if (next === undefined) return;
    event.preventDefault(); setSelected(next); buttons.current[next]?.focus();
  };
  return <div className="workshop-console">
    <div className="console-toolbar"><span className="editorial-label">DEBX / BROWSER INSTRUMENTS</span><span className="console-live"><i />INTERACTIVE</span></div>
    <div className="lab-tabs" role="tablist" aria-label="Choose a workshop instrument" onKeyDown={onKey}>{labs.map((item, index) => <button type="button" role="tab" id={`tab-${item.id}`} aria-selected={index === selected} aria-controls={`panel-${item.id}`} tabIndex={index === selected ? 0 : -1} ref={node => { buttons.current[index] = node; }} onClick={() => setSelected(index)} key={item.id}><small>{item.number}</small>{item.label}<span aria-hidden="true">↗</span></button>)}</div>
    {labs.map((item, index) => <div key={item.id} id={`panel-${item.id}`} role="tabpanel" aria-labelledby={`tab-${item.id}`} hidden={index !== selected} tabIndex={0} className="lab-panel">{index === selected && <>
      <div className="lab-panel-copy"><span className="editorial-label">INSTRUMENT / {lab.number}</span><h3>{lab.title}</h3><p>{lab.description}</p><button className="instrument-launch" type="button" onClick={lab.action}>{lab.launch}<span aria-hidden="true">↗</span></button><span className="lab-disclaimer">Educational experiments. Use sample data.</span></div>
      <PixelCard className="lab-pixel-panel" colors="#756247,#b79560,#ccaea0" glowColor="#b79560" gap={12} pixelSize={1.5} speed={reduced ? 0 : 15} opacity={0.28} glow={0.12} spotlight={0.1} intro={false} clickPulse={false} noFocus radius={2}><div className="instrument-surface">{selected === 0 ? <HashInstrument /> : selected === 1 ? <NetworkInstrument /> : <TerminalInstrument />}</div></PixelCard>
    </>}</div>)}
  </div>;
}

function Archive({ records }) {
  const [plain, setPlain] = useState(() => window.matchMedia('(max-width: 767px), (prefers-reduced-motion: reduce)').matches);
  const [reading, setReading] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px), (prefers-reduced-motion: reduce)');
    const sync = () => setPlain(media.matches);
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);
  const entries = records.map((record, index) => <ScrollStackItem key={record.date} itemClassName={`archive-folio folio-${index}`}><article><div className="folio-header"><span>RECORD / {String(index + 1).padStart(2, '0')}</span><span aria-hidden="true">記録</span></div><div className="folio-date">{record.date}</div><div className="folio-content" dangerouslySetInnerHTML={{ __html: record.html }} /><div className="folio-foot"><span>DEBAYAN LAHIRY / PERSONAL ARCHIVE</span><span>{String(index + 1).padStart(2, '0')} / 05</span></div></article></ScrollStackItem>);
  return <div onToggleCapture={event => {
    if (event.target.matches('details')) setReading(Boolean(event.currentTarget.querySelector('details[open]')));
  }}>{plain ? <div className="archive-folios archive-folios-plain">{entries}</div> : <ScrollStack className={`archive-folios ${reading ? 'archive-reading' : ''}`} useWindowScroll smoothScroll={false} snap={false} stackPosition="110px" itemDistance={75} itemStackDistance={14} itemScale={0.025} baseScale={0.94} dimAmount={0.1} blurAmount={0} tiltAmount={0} rotationAmount={0} holdDistance={100}>{entries}</ScrollStack>}</div>;
}

export default function SectionUpgrades({ kind, records, onReady, reduced }) {
  useLayoutEffect(() => { onReady(); }, [onReady]);
  return kind === 'arsenal' ? <Arsenal records={records} reduced={reduced} /> : kind === 'workshop' ? <Workshop reduced={reduced} /> : <Archive records={records} />;
}

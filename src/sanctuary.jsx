import React, { Component, Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import FlexCarousel from './react-bits/FlexCarousel/FlexCarousel.jsx';
import StaggeredMenu from './react-bits/StaggeredMenu/StaggeredMenu.jsx';
import SpotlightCard from './react-bits/SpotlightCard/SpotlightCard.jsx';
import Stepper, { Step } from './react-bits/Stepper/Stepper.jsx';
import BellToggle from './react-bits/BellToggle/BellToggle.jsx';
import Magnet from './react-bits/Magnet/Magnet/Magnet.jsx';
import DecryptedText from './react-bits/DecryptedText/DecryptedText/DecryptedText.jsx';
import RubberSegment from './react-bits/RubberSegment/RubberSegment.jsx';
import ScrollExpand from './react-bits/ScrollExpand/ScrollExpand.jsx';
import projects from '../data/projects.json';
import './sanctuary.css';

const IdentityPass = lazy(() => import('./IdentityPass.jsx'));
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = window.matchMedia('(pointer: coarse)').matches;
const items = projects.map(p => ({ src: p.preview, title: p.name, subtitle: p.category, alt: `${p.name}: actual application landing page` }));
const cards = [...document.querySelectorAll('.project-card')];
const grid = document.querySelector('.featured-grid');
const themeItems = [{value:'sanctuary',label:'Sanctuary'},{value:'matrix',label:'Matrix'},{value:'violet',label:'Violet'},{value:'gold',label:'Ember'}];
const menuItems = [
  { label: 'Projects', link: '#pathways' }, { label: 'About', link: '#gate' },
  { label: 'Skills', link: '#lessons' }, { label: 'Playground', link: '#playground' },
  { label: 'CV', link: 'Debayan_Lahiry_Cybersecurity_CV.pdf' }, { label: 'Contact', link: '#eternity' }
];

class IslandBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError?.(); }
  render() { return this.state.failed ? this.props.fallback || null : this.props.children; }
}

function Collection() {
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [all, setAll] = useState(false);
  const [autoplay, setAutoplay] = useState(!reduce);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [obscured, setObscured] = useState(false);
  const [command, setCommand] = useState({ index: 0, token: 0 });
  const available = ready && !failed;
  const change = useCallback(index => setActive(index), []);
  const select = useCallback(index => {
    setActive(index);
    setCommand(previous => ({ index, token: previous.token + 1 }));
  }, []);
  const open = useCallback(index => window.openPortfolioCase(`case-${projects[index].id}`, document.querySelector('.flex-carousel')), []);
  useEffect(() => {
    const sync = () => setObscured(document.body.classList.contains('modal-open') || Boolean(document.querySelector('.shoji-navigation[data-open]')));
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    const menu = document.querySelector('.shoji-navigation');
    if (menu) observer.observe(menu, { attributes: true, attributeFilter: ['data-open'] });
    sync();
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    grid.classList.toggle('collection-details', available && !all);
    cards.forEach((card, index) => {
      card.hidden = available && !all && index !== active;
      if (available) { card.style.opacity = '1'; card.style.transform = 'none'; }
    });
    window.dispatchEvent(new Event('resize'));
    return () => { grid.classList.remove('collection-details'); cards.forEach(card => { card.hidden = false; }); };
  }, [active, available, all]);
  useEffect(() => {
    if (!available) return;
    const onAnchor = event => {
      const anchor = event.target.closest('a[href^="#project-"]');
      if (!anchor) return;
      const index = projects.findIndex(p => anchor.getAttribute('href') === `#project-${p.id}`);
      if (index < 0) return;
      event.preventDefault(); event.stopImmediatePropagation();
      select(index);
      document.querySelector('#projectCollection').scrollIntoView({ behavior: reduce ? 'instant' : 'smooth', block: 'start' });
    };
    document.addEventListener('click', onAnchor, true);
    const hash = projects.findIndex(p => location.hash === `#project-${p.id}`);
    if (hash >= 0) select(hash);
    return () => document.removeEventListener('click', onAnchor, true);
  }, [available, select]);
  return <div className={`project-collection ${available ? 'is-ready' : ''}`}
    onPointerEnter={event => { if (event.pointerType === 'mouse') setHovered(true); }}
    onPointerLeave={event => { if (event.pointerType === 'mouse') setHovered(false); }}
    onFocusCapture={event => setFocused(!event.target.closest('.collection-play'))}
    onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    {!failed && <IslandBoundary onError={() => setFailed(true)}>
      <div className="collection-stage">
        <div className="collection-caption"><span>SELECTED WORK / APPLICATION PREVIEWS</span><span>DRAG TO EXPLORE</span></div>
        <FlexCarousel items={items} preset="ribbon" intro="fade" fit="natural" cardHeight={0.76} gap={26} radius={0}
          bend={0.16} reach={0.28} dispersion={0.05} squeeze={0.03} lensWidth={0.89} lensHeight={1.08}
          captureWheel={false} focusOnClick={false} captions={false} interval={5}
          autoplay={autoplay && !hovered && !focused && !obscured && !all}
          onChange={change} onSelect={open} selectedIndex={command.index} selectionToken={command.token}
          onReady={() => setReady(true)} onUnavailable={() => setFailed(true)} />
      </div>
    </IslandBoundary>}
    {available && <>
      <div className="collection-controls"><div className="collection-arrows">
        <button type="button" aria-label="Previous project" onClick={() => select((active + projects.length - 1) % projects.length)}>←</button>
        <span aria-live={autoplay ? 'off' : 'polite'}>0{active + 1}<i> / 06</i></span>
        <button type="button" aria-label="Next project" onClick={() => select((active + 1) % projects.length)}>→</button>
        {!reduce && <button type="button" className="collection-play" aria-label={autoplay ? 'Pause automatic project rotation' : 'Start automatic project rotation'} aria-pressed={!autoplay} title={autoplay ? 'Pause automatic rotation' : 'Start automatic rotation'} onClick={() => setAutoplay(value => !value)}>{autoplay ? 'Ⅱ' : '▶'}</button>}
      </div><span className="collection-hint">{reduce ? 'Manual browsing · Reduced motion' : 'Auto-advances every 5 seconds · Pauses while you explore'}</span>
      <button className="collection-view" type="button" aria-expanded={all} onClick={() => setAll(value => !value)}>{all ? 'Show selected project' : 'Show all six projects'} <span>↗</span></button></div>
      <div className="collection-index" role="group" aria-label="Choose a project">{projects.map((p,index) => <button key={p.id} type="button" aria-pressed={active === index} onClick={() => select(index)}><small>0{index+1}</small>{p.name}</button>)}</div>
    </>}
  </div>;
}

function SoundBell() {
  const [playing, setPlaying] = useState(Boolean(window.isAudioPlaying));
  useEffect(() => {
    const sync = () => setPlaying(Boolean(window.isAudioPlaying));
    document.addEventListener('portfolio:audio', sync);
    return () => document.removeEventListener('portfolio:audio', sync);
  }, []);
  return <BellToggle pressed={playing} onChange={() => window.toggleAmbientAudio()} label={playing ? 'Sanctuary sound on. Turn sound off' : 'Sound off. Turn sanctuary sound on'} offLabel="Sound off" onLabel="Sanctuary sound" color="#c4aa75" background="#111b1c" onColor="#e5ddc8" onBackground="#453324" size="sm" radius={3} badge={false} clapper waves={!reduce} ringAmplitude={12} />;
}

function Navigation() {
  const [theme, setTheme] = useState(document.getElementById('themeSelect')?.value || 'sanctuary');
  const navigate = useCallback((item, event) => {
    event.preventDefault();
    // Wait for the menu to release background inertness before opening a modal.
    requestAnimationFrame(() => {
      if (item.label === 'CV') { window.openResumeModal(); return; }
      const section = document.querySelector(item.link);
      if (section) window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY - 95, behavior: reduce ? 'instant' : 'smooth' });
    });
  }, []);
  return <StaggeredMenu isFixed logoUrl={null} className="shoji-navigation" colors={['#452c25','#1b2826','#10191a']} items={menuItems}
    socialItems={[{label:'GitHub',link:'https://github.com/Debayan-CyberX'}]} menuButtonColor="#e4e4d6" openMenuButtonColor="#e4e4d6" accentColor="var(--vermilion)" onItemClick={navigate}
    footer={<div className="shoji-settings"><p>THE SANCTUARY / CHOOSE YOUR LIGHT</p><RubberSegment items={themeItems} value={theme} onChange={value => { setTheme(value); window.setPortfolioTheme(value); }} trackColor="#080f10" thumbColor="#bba578" textColor="#a7b1a8" activeTextColor="#10191a" size="lg" radius={2} stretch={45} aria-label="Sanctuary palette" /><div className="menu-sound"><span>Kyoto soundscape</span><SoundBell /></div></div>} />;
}

function CaseWalkthrough({project}) {
  const [step, setStep] = useState(1);
  const [opened, setOpened] = useState(false);
  const host = useRef(null);
  useEffect(() => {
    const dialog = document.getElementById(`case-${project.id}`);
    const onCase = event => {
      if (event.detail.id !== dialog.id) return;
      if (event.detail.open) { setOpened(true); setStep(1); }
    };
    document.addEventListener('portfolio:case', onCase);
    return () => document.removeEventListener('portfolio:case', onCase);
  }, [project.id]);
  useEffect(() => {
    if (opened) host.current.closest('.case-walkthrough').classList.add('has-stepper');
  }, [opened]);
  return <div ref={host}>{opened && <Stepper step={step} onStepChange={setStep} showFooter={false} frame={false} width="100%" radius={2} accentColor="#bf9e68" className="case-stepper" transition={reduce ? 'none' : 'fade'}>
    {project.walkthrough.map((explanation,index) => <Step key={index} title={project.path[index]}>
      <div className="workflow-progress" aria-hidden="true">{project.path.map((label,i) => <React.Fragment key={label}><span className={i===index?'active':''}>{String(i+1).padStart(2,'0')}<small>{label}</small></span>{i<3&&<i>→</i>}</React.Fragment>)}</div>
      <p className="workflow-explanation">{explanation}</p>
      <a className="workflow-evidence" href={`https://github.com/Debayan-CyberX/${project.repo}/${project.validation_path}`} target="_blank" rel="noopener noreferrer">Explore implementation &amp; validation ↗</a>
    </Step>)}
  </Stepper>}{opened && <div className="workflow-buttons"><button type="button" disabled={step===1} onClick={() => setStep(s=>s-1)}>← Previous</button><span>STEP {step} OF 4</span><button type="button" onClick={() => setStep(s=>s===4?1:s+1)}>{step===4?'Restart ↺':'Next →'}</button></div>}</div>;
}

function Preview({pid}) {
  return <ScrollExpand src={`image/${pid}-live-preview.png`} alt={`Actual ${pid==='inbox'?'InboxIQ':'TCP/IP Simulator'} application interface`} className="case-scroll-preview" startWidth={coarse?94:82} startHeight={94} startRadius={2} endRadius={0} mediaZoom={1} scrollDistance={reduce?0:0.32} holdDistance={0} overlayScrim={0} enabled={!reduce} />;
}

function OriginalNode({node}) {
  const ref = useRef(null);
  useEffect(() => { ref.current.appendChild(node); }, [node]);
  return <span ref={ref} className="magnet-node" />;
}

function DeferredPass() {
  const host = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if(entry.isIntersecting){ setVisible(true); observer.disconnect(); } }, {rootMargin:'150px'});
    observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={host} className="identity-pass-slot"><IslandBoundary fallback={<img className="identity-fallback" src="image/project-plates/identity-front.svg" alt="Debayan Lahiry, cybersecurity and software engineering" />}>
    {visible ? <Suspense fallback={<img className="identity-fallback" src="image/project-plates/identity-front.svg" alt="Debayan Lahiry, cybersecurity and software engineering" />}><IdentityPass /></Suspense> : <img className="identity-fallback" src="image/project-plates/identity-front.svg" alt="Debayan Lahiry, cybersecurity and software engineering" />}
  </IslandBoundary></div>;
}

const portals = [];
function portal(id, child) { const host = document.getElementById(id); if(host) portals.push(createPortal(<IslandBoundary>{child}</IslandBoundary>,host,id)); }
portal('projectCollection',<Collection />);
portal('shojiMenu',<Navigation />);
portal('sanctuaryBell',<SoundBell />);
portal('identityPass',<DeferredPass />);
document.querySelectorAll('[data-case-stepper]').forEach(host => {
  const project=projects.find(p=>p.id===host.dataset.caseStepper);
  portals.push(createPortal(<IslandBoundary><CaseWalkthrough project={project} /></IslandBoundary>,host,project.id));
});
document.querySelectorAll('[data-expand-preview]').forEach(host => {
  host.replaceChildren();
  portals.push(createPortal(<IslandBoundary fallback={<img src={`image/${host.dataset.expandPreview}-live-preview.png`} alt="Actual application interface" />}><Preview pid={host.dataset.expandPreview} /></IslandBoundary>,host,`preview-${host.dataset.expandPreview}`));
});
document.querySelectorAll('.les, .playground-item').forEach((card,index) => {
  const host=document.createElement('div'); host.className='lantern-host'; card.appendChild(host);
  portals.push(createPortal(<SpotlightCard className="lantern-card" spotlightColor="#d4a66b" intensity={0.10} borderGlow={0.35} spotlightSize={260} proximity={55} flare={false} smoothing={0.15} />,host,`lantern-${index}`));
});
document.querySelectorAll('.hero-actions a, .project-actions [data-open-case], .gate-copy .cta-secondary').forEach((node,index) => {
  const host=document.createElement('span'); host.className='magnet-host'; node.before(host);
  portals.push(createPortal(<Magnet disabled={coarse || reduce} padding={12} magnetStrength={14} maxOffset={3} wrapperClassName="sanctuary-magnet"><OriginalNode node={node}/></Magnet>,host,`magnet-${index}`));
});
document.querySelectorAll('.project-category').forEach((node,index) => {
  const text=node.textContent;
  node.replaceChildren();
  portals.push(createPortal(<DecryptedText text={text} animateOn="view" speed={28} maxIterations={3} characters="0123456789ABCDEF" />,node,`decode-${index}`));
});
createRoot(document.getElementById('sanctuaryInteractions')).render(<>{portals}</>);
document.body.classList.add('interactions-ready');

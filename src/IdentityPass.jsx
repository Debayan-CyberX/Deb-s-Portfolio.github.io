import Lanyard from './react-bits/Lanyard/Lanyard.jsx';
import { useState } from 'react';

export default function IdentityPass() {
  const [flips, setFlips] = useState(0);
  const [failed, setFailed] = useState(false);
  if (failed) return <img className="identity-fallback" src="image/project-plates/identity-front.svg" alt="Debayan Lahiry, cybersecurity and software engineering" />;
  return <>
    <Lanyard frontImage="image/project-plates/identity-front.svg" backImage="image/project-plates/identity-back.svg" flipToken={flips} onUnavailable={() => setFailed(true)} imageFit="cover" cardColor="#10191a" strapColor="#832d24" metal="gold" finish="matte" cornerRadius={0.08} size={0.58} strapLength={0.3} strapWidth={0.5} breeze={0} damping={0.8} elasticity={0.25} intro={false} />
    <button type="button" className="pass-flip" onClick={() => setFlips(value=>value+1)}>Turn pass ↻</button>
    <span className="pass-hint">DRAG TO MOVE · TAP TO TURN</span>
  </>;
}

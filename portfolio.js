'use strict';

// Native dialogs keep the new case studies keyboard-accessible without dependencies.
document.querySelectorAll('[data-open-case]').forEach(button => {
  button.addEventListener('click', () => {
    const dialog = document.getElementById(button.dataset.openCase);
    if (!dialog) return;
    dialog.showModal();
    document.body.classList.add('modal-open');
    dialog.scrollTop = 0;
  });
});
document.querySelectorAll('.case-dialog').forEach(dialog => {
  dialog.querySelector('[data-close-case]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
});

// The existing playground and CV overlays share focus, Escape, and scroll behavior.
const overlayDefinitions = [
  ['resumeModal', 'closeResumeModal', 'Resume / CV'],
  ['cryptoModal', 'closeCryptoModal', 'Cryptography and password security lab'],
  ['tttModal', 'closeTicTacToe', 'Tic Tac Toe'],
  ['calcModal', 'closeCalcModal', 'Calculator'],
  ['networkModal', 'closeNetworkModal', 'TCP / TLS handshake'],
  ['viewer3dModal', 'close3DViewer', 'Sanctuary spatial inspector'],
  ['cyberTermModal', 'toggleCyberTerminal', 'Cyber terminal']
];
const focusable = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex="0"]';
let activeOverlay = null;
let lastOverlayTrigger = null;
document.addEventListener('click', event => {
  if (!activeOverlay) lastOverlayTrigger = event.target.closest('button, a');
}, true);
const observers = [];
overlayDefinitions.forEach(([id, closeName, label]) => {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', label);
  overlay.setAttribute('tabindex', '-1');
  let opener = null;
  const observer = new MutationObserver(() => {
    const isOpen = overlay.classList.contains('open') || overlay.classList.contains('active');
    if (isOpen && activeOverlay?.element !== overlay) {
      opener = overlay.contains(document.activeElement) ? lastOverlayTrigger : document.activeElement;
      activeOverlay = { element: overlay, closeName };
      document.body.classList.add('modal-open');
      (overlay.querySelector(focusable) || overlay).focus();
    } else if (!isOpen && activeOverlay?.element === overlay) {
      activeOverlay = null;
      document.body.classList.remove('modal-open');
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    }
  });
  observer.observe(overlay, { attributes: true, attributeFilter: ['class'] });
  observers.push(observer);
});
document.addEventListener('keydown', event => {
  if (!activeOverlay) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    const close = window[activeOverlay.closeName];
    if (typeof close === 'function') close();
  } else if (event.key === 'Tab') {
    const nodes = [...activeOverlay.element.querySelectorAll(focusable)].filter(node => node.getClientRects().length);
    if (!nodes.length) { event.preventDefault(); activeOverlay.element.focus(); return; }
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (event.shiftKey && (document.activeElement === first || !activeOverlay.element.contains(document.activeElement))) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !activeOverlay.element.contains(document.activeElement))) {
      event.preventDefault(); first.focus();
    }
  }
});

// A case study can change chapter height, so refresh the scene's scroll anchors.
document.querySelectorAll('details').forEach(details => {
  details.addEventListener('toggle', () => window.dispatchEvent(new Event('resize')));
});

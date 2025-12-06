// src/ui/modal/modal.js

export function createModal({ title, content, buttons = [] }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const box = document.createElement('div');
  box.className = 'modal-box';

  const header = document.createElement('div');
  header.className = 'modal-header';
  header.textContent = title;

  const body = document.createElement('div');
  body.className = 'modal-body';
  body.appendChild(content);

  const footer = document.createElement('div');
  footer.className = 'modal-footer';

  buttons.forEach((btnConfig) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = btnConfig.label;
    btn.className = `btn ${btnConfig.className || ''}`;
    btn.addEventListener('click', () => {
      if (btnConfig.onClick) btnConfig.onClick(overlay);
    });
    footer.appendChild(btn);
  });

  box.appendChild(header);
  box.appendChild(body);
  box.appendChild(footer);
  overlay.appendChild(box);

  return overlay;
}

export function showModal(modal) {
  document.body.appendChild(modal);
}

export function closeModal(modal) {
  document.body.removeChild(modal);
}

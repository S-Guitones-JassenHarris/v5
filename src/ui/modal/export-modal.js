// src/ui/modal/export-modal.js

import { createModal, showModal, closeModal } from './modal.js';

export function openExportModal(jsonText) {
  const textarea = document.createElement('textarea');
  textarea.value = jsonText;
  textarea.readOnly = true;
  textarea.className = 'modal-textarea';

  const modal = createModal({
    title: 'Exported JSON Code',
    content: textarea,
    buttons: [
      {
        label: 'Copy',
        className: 'btn--primary',
        onClick: () => {
          textarea.select();
          document.execCommand('copy');
          alert('Copied to clipboard!');
        },
      },
      {
        label: 'Close',
        className: 'btn--ghost',
        onClick: (overlay) => {
          closeModal(overlay);
        },
      },
    ],
  });

  showModal(modal);
}

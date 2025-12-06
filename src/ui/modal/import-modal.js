// src/ui/modal/import-modal.js

import { createModal, showModal, closeModal } from './modal.js';

export function openImportModal(onImportConfirmed) {
  const textarea = document.createElement('textarea');
  textarea.placeholder = 'Paste JSON code here...';
  textarea.className = 'modal-textarea';

  const modal = createModal({
    title: 'Import JSON Code',
    content: textarea,
    buttons: [
      {
        label: 'Import',
        className: 'btn--primary',
        onClick: () => {
          const text = textarea.value.trim();
          if (!text) {
            alert('Please paste a JSON code first.');
            return;
          }
          onImportConfirmed(text);
          closeModal(modal);
        },
      },
      {
        label: 'Cancel',
        className: 'btn--ghost',
        onClick: (overlay) => closeModal(overlay),
      },
    ],
  });

  showModal(modal);
}

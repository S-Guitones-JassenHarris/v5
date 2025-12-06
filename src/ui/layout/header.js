// src/ui/layout/header.js

export function createHeader({
  onClearAll,
  onExport,
  onImport,
  onPdfClick,
  onDocumentation,
  onChangelog,
} = {}) {
  const header = document.createElement('header');
  header.className = 'app-header';

  const left = document.createElement('div');
  left.className = 'app-header-left';

  const title = document.createElement('div');
  title.className = 'app-title';
  title.textContent = 'V5 Quotation Tool';

  left.appendChild(title);

  const right = document.createElement('div');
  right.className = 'app-header-right';

  // Documentation button
  const docBtn = document.createElement('button');
  docBtn.type = 'button';
  docBtn.className = 'btn btn--small btn--ghost';
  docBtn.textContent = 'Documentation';
  docBtn.title = 'Open documentation';
  docBtn.addEventListener('click', () => {
    if (typeof onDocumentation === 'function') {
      onDocumentation();
    }
  });
  right.appendChild(docBtn);

  // Changelog button
  const changelogBtn = document.createElement('button');
  changelogBtn.type = 'button';
  changelogBtn.className = 'btn btn--small btn--ghost';
  changelogBtn.textContent = 'Changelog';
  changelogBtn.title = 'Open changelog';
  changelogBtn.addEventListener('click', () => {
    if (typeof onChangelog === 'function') {
      onChangelog();
    }
  });
  right.appendChild(changelogBtn);

  
  const pdfBtn = document.createElement('button');
  pdfBtn.type = 'button';
  pdfBtn.className = 'btn btn--small btn--ghost';
  pdfBtn.textContent = 'PDF';
  pdfBtn.title = 'Generate a PDF summary'; // hover text
  pdfBtn.addEventListener('click', (e) => {
    if (typeof onPdfClick === 'function') {
      onPdfClick();
    } else {
      alert('PDF generation is not wired up yet.');
    }
  });
  right.appendChild(pdfBtn);



  // Export button (JSON code export)
  const exportBtn = document.createElement('button');
  exportBtn.type = 'button';
  exportBtn.className = 'btn btn--small';
  exportBtn.textContent = 'Export';
  exportBtn.title = 'Export current quotes as JSON code';
  exportBtn.addEventListener('click', () => {
    if (typeof onExport === 'function') {
      onExport();
    }
  });
  right.appendChild(exportBtn);

  // Import button (JSON code import)
  const importBtn = document.createElement('button');
  importBtn.type = 'button';
  importBtn.className = 'btn btn--small btn--ghost';
  importBtn.textContent = 'Import';
  importBtn.title = 'Import quotes from JSON code';
  importBtn.addEventListener('click', () => {
    if (typeof onImport === 'function') {
      onImport();
    }
  });
  right.appendChild(importBtn);

  // Clear all quotes button
  const clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.className = 'btn btn--small btn--danger';
  clearBtn.textContent = 'Clear all quotes';
  clearBtn.title = 'Remove all quotes and start fresh';
  clearBtn.addEventListener('click', () => {
    if (typeof onClearAll === 'function') {
      const confirmed = window.confirm(
        'This will clear all quotes and reset to a single empty quote. Continue?'
      );
      if (confirmed) {
        onClearAll();
      }
    }
  });
  right.appendChild(clearBtn);

  header.appendChild(left);
  header.appendChild(right);

  return header;
}

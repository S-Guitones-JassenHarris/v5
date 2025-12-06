// src/pdf/pdf-service.js

import { loadImageAsBase64 } from './image-loader.js';

// ------ App-level config (you can tweak these) ------

export const DEFAULT_APP_INFO = {
  companyName: 'Your Company Name',
  companyAddress: 'Your Address Line 1\nCity, Country',
  companyContact: 'Phone: +63-000-000-0000\nEmail: info@example.com',
  quoteTitle: 'TECHNICAL QUOTATION',
  appVersion: 'V5.0.0',
  preparedBy: 'Prepared by: Quotation System',
  footerNote: 'Thank you for your business.',
};

// Get jsPDF constructor from global UMD build
function getJsPdfConstructor() {
  // jsPDF UMD exposes window.jspdf.jsPDF
  if (typeof window !== 'undefined' && window.jspdf && window.jspdf.jsPDF) {
    return window.jspdf.jsPDF;
  }
  // Some older builds expose window.jsPDF directly
  if (typeof window !== 'undefined' && typeof window.jsPDF !== 'undefined') {
    return window.jsPDF;
  }
  throw new Error(
    'jsPDF is not loaded. Make sure jspdf.umd.min.js is included in index.html.'
  );
}

/**
 * generateQuotesPdf
 *
 * @param {Object} params
 * @param {Array}  params.quotes
 * @param {Object} params.appInfo
 */
export async function generateQuotesPdf({ quotes, appInfo = {} } = {}) {
  if (!Array.isArray(quotes) || quotes.length === 0) {
    alert('No quotes available to generate PDF.');
    return;
  }

  const JsPDF = getJsPdfConstructor();
  const doc = new JsPDF({ unit: 'mm', format: 'a4' });

  const cfg = { ...DEFAULT_APP_INFO, ...appInfo };
  const now = new Date();
  const creationDateStr = formatDate(now);

  // 🔹 Load logo jh.png as Base64 (same folder)
  // Use 'jh.png' or './jh.png' depending on how your app serves files.
  let jhLogoDataUrl = null;
  try {
    jhLogoDataUrl = await loadImageAsBase64('jh.png');
  } catch (err) {
    console.warn('Could not load jh.png, using placeholder frame instead.', err);
  }

  // Page 1: TECHNICAL QUOTATION layout
  drawSummaryPage(doc, quotes, cfg, creationDateStr, jhLogoDataUrl);

  // Per-quote pages (each on its own page)
  quotes.forEach((quote) => {
    doc.addPage();
    drawQuoteDetailPage(doc, quote, cfg, creationDateStr);
  });

  doc.save(buildPdfFileName(creationDateStr));
}

// -------------------------
// Drawing helpers
// -------------------------

function drawSummaryPage(doc, quotes, cfg, creationDateStr, jhLogoDataUrl) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;

  // --------------------
  // Top blue banner: TECHNICAL QUOTATION
  // --------------------
  const bannerHeight = 12;
  const bannerY = 10;

  doc.setFillColor(0, 102, 204); // blue
  doc.rect(0, bannerY, pageWidth, bannerHeight, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(
    cfg.quoteTitle || 'TECHNICAL QUOTATION',
    pageWidth / 2,
    bannerY + 8,
    { align: 'center' }
  );

  // Reset text color to black
  doc.setTextColor(0, 0, 0);

  // Column layout used for everything below
  const columnWidth = (pageWidth - margin * 3) / 2;
  const leftX = margin;
  const rightX = margin * 2 + columnWidth;

  // --------------------
  // Header row: left image + right header box
  // --------------------
  const headerBoxHeight = 28;
  const headerBoxY = bannerY + bannerHeight + 4;

  // Left: LOGO (same width as blocks below, same height as header box)
  const logoX = leftX;
  const logoY = headerBoxY;
  const logoWidth = columnWidth;
  const logoHeight = headerBoxHeight;

  if (jhLogoDataUrl) {
    // ✅ Draw actual image
    doc.addImage(jhLogoDataUrl, 'PNG', logoX, logoY, logoWidth, logoHeight);
  } else {
    // Fallback placeholder frame
    doc.setDrawColor(0);
    doc.rect(logoX, logoY, logoWidth, logoHeight);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.text('IMAGE', logoX + logoWidth / 2, logoY + logoHeight / 2, {
      align: 'center',
    });
  }

  // Right: header info box (same width as column blocks)
  const headerBoxWidth = columnWidth;
  const headerBoxX = rightX;

  doc.setDrawColor(0);
  doc.rect(headerBoxX, headerBoxY, headerBoxWidth, headerBoxHeight);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  const addrLines = (cfg.companyAddress || '').split('\n');
  const contactLines = (cfg.companyContact || '').split('\n');

  let textY = headerBoxY + 5;
  const textXLeft = headerBoxX + 2;

  if (addrLines[0]) {
    doc.setFont('helvetica', 'bold');
    doc.text('ADDRESS', textXLeft, textY);
    doc.setFont('helvetica', 'normal');
    doc.text(addrLines[0], textXLeft + 35, textY);
    textY += 5;
  }

  if (contactLines[0]) {
    doc.setFont('helvetica', 'bold');
    doc.text('Phone number', textXLeft, textY);
    doc.setFont('helvetica', 'normal');
    doc.text(contactLines[0].replace(/^Phone:\s*/i, ''), textXLeft + 35, textY);
    textY += 5;
  }

  if (contactLines[1]) {
    doc.setFont('helvetica', 'bold');
    doc.text('email', textXLeft, textY);
    doc.setFont('helvetica', 'normal');
    doc.text(contactLines[1].replace(/^Email:\s*/i, ''), textXLeft + 35, textY);
    textY += 5;
  }

  doc.setFont('helvetica', 'bold');
  doc.text('Quote Generation Date:', textXLeft, textY);
  doc.setFont('helvetica', 'normal');
  doc.text(creationDateStr, textXLeft + 35, textY);

  // --------------------
  // Left & right information blocks
  // --------------------
  const blocksTopY = headerBoxY + headerBoxHeight + 8;

  function drawLabeledBlock(x, y, width, height, title, lines) {
    const headerHeight = 6;
    const bodyHeight = height - headerHeight;

    // Header bar
    doc.setFillColor(0, 102, 204);
    doc.rect(x, y, width, headerHeight, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(title, x + 2, y + 4);

    // Body
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(0);
    doc.rect(x, y + headerHeight, width, bodyHeight);

    if (lines && lines.length) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      let yy = y + headerHeight + 5;
      lines.forEach((ln) => {
        doc.text(ln, x + 2, yy);
        yy += 4;
      });
    }

    return y + headerHeight + bodyHeight;
  }

  // CUSTOMER DETAILS (left top)
  const customerBlockHeight = 32;
  const customerLines = [
    'Name/Company Name',
    'Customer Contact Number',
    'Date and Time Requested',
    'Shipping Address',
    'Pinned Shipping Location',
  ];
  const afterCustomerY = drawLabeledBlock(
    leftX,
    blocksTopY,
    columnWidth,
    customerBlockHeight,
    'CUSTOMER DETAILS',
    customerLines
  );

  // QUOTATION DETAILS (left bottom)
  const quotationBlockHeight = 22;
  const quotationLines = [
    'Quotation Prepared By:',
    'Contact Person',
    'Contact Details',
  ];
  const afterQuotationY = drawLabeledBlock(
    leftX,
    afterCustomerY + 4,
    columnWidth,
    quotationBlockHeight,
    'Quotation Details',
    quotationLines
  );

  // DESCRIPTION OF WORK (right top)
  const descriptionBlockHeight = 32;
  const afterDescriptionY = drawLabeledBlock(
    rightX,
    blocksTopY,
    columnWidth,
    descriptionBlockHeight,
    'Description of Work',
    []
  );

  // REMARKS (right middle)
  const remarksBlockHeight = 20;
  const afterRemarksY = drawLabeledBlock(
    rightX,
    afterDescriptionY + 4,
    columnWidth,
    remarksBlockHeight,
    'Remarks',
    []
  );

  // COMPLETION TIME (right bottom)
  const completionBlockHeight = 14;
  const afterCompletionY = drawLabeledBlock(
    rightX,
    afterRemarksY + 4,
    columnWidth,
    completionBlockHeight,
    'Completion Time',
    []
  );

  const blocksBottomY = Math.max(afterQuotationY, afterCompletionY);

  // --------------------
  // ITEMIZED COST SUMMARY section
  // --------------------
  const itemizedTopY = blocksBottomY + 8;
  const tableWidth = pageWidth - margin * 2;

  // Blue bar title
  doc.setFillColor(0, 102, 204);
  doc.rect(margin, itemizedTopY, tableWidth, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(
    'ITEMIZED COST SUMMARY',
    margin + tableWidth / 2,
    itemizedTopY + 5,
    { align: 'center' }
  );

  // Table header row
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);

  const headerY = itemizedTopY + 12;
  const colX = {
    name: margin + 2,
    service: margin + 50,
    rush: margin + 90,
    price: margin + 110,
    completion: margin + 140,
    delivery: margin + 170,
  };

  doc.text('Quote name', colX.name, headerY);
  doc.text('Service', colX.service, headerY);
  doc.text('Rush', colX.rush, headerY);
  doc.text('Selling price', colX.price, headerY);
  doc.text('Completion time', colX.completion, headerY);
  doc.text('Est. Delivery Date', colX.delivery, headerY);

  doc.setLineWidth(0.2);
  doc.line(margin, headerY + 1.5, margin + tableWidth, headerY + 1.5);

  // Table rows
  doc.setFont('helvetica', 'normal');

  let rowY = headerY + 6;

  quotes.forEach((q) => {
    if (rowY > 270) {
      // New page for continued summary table
      doc.addPage();

      const newTopY = 20;
      doc.setFillColor(0, 102, 204);
      doc.rect(margin, newTopY, tableWidth, 7, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(
        'ITEMIZED COST SUMMARY (cont.)',
        margin + tableWidth / 2,
        newTopY + 5,
        { align: 'center' }
      );

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);

      const newHeaderY = newTopY + 12;
      doc.text('Quote name', colX.name, newHeaderY);
      doc.text('Service', colX.service, newHeaderY);
      doc.text('Rush', colX.rush, newHeaderY);
      doc.text('Selling price', colX.price, newHeaderY);
      doc.text('Completion time', colX.completion, newHeaderY);
      doc.text('Est. Delivery Date', colX.delivery, newHeaderY);

      doc.setLineWidth(0.2);
      doc.line(
        margin,
        newHeaderY + 1.5,
        margin + tableWidth,
        newHeaderY + 1.5
      );

      doc.setFont('helvetica', 'normal');
      rowY = newHeaderY + 6;
    }

    const dateInfo = computeQuoteDateInfo(q);

    let completionStr = 'N/A';
    let deliveryStr = 'N/A';
    if (dateInfo.days != null && dateInfo.date) {
      completionStr = `${Math.round(dateInfo.days)} days`;
      deliveryStr = formatDate(dateInfo.date);
    }

    doc.text(truncate(q.name || '(unnamed)', 25), colX.name, rowY);
    doc.text(truncate(q.serviceTypeLabel || '', 25), colX.service, rowY);
    doc.text(q.isRush ? 'Yes' : 'No', colX.rush, rowY);
    doc.text(formatMoney(q.sellingPrice || 0), colX.price, rowY);
    doc.text(completionStr, colX.completion, rowY);
    doc.text(deliveryStr, colX.delivery, rowY);

    rowY += 5;
  });

  // Footer note (first summary page)
  if (cfg.footerNote) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(cfg.footerNote, margin, 285);
  }
}

function drawQuoteDetailPage(doc, quote, cfg, creationDateStr) {
  const marginLeft = 15;
  let y = 20;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Quote Details', marginLeft, y);

  doc.setFontSize(10);
  y += 6;
  doc.setFont('helvetica', 'normal');

  doc.text(`Quote name: ${quote.name || '(unnamed)'}`, marginLeft, y);
  y += 4;
  doc.text(`Service type: ${quote.serviceTypeLabel || ''}`, marginLeft, y);
  y += 4;
  doc.text(`Rush: ${quote.isRush ? 'Yes' : 'No'}`, marginLeft, y);
  y += 4;

  const dateInfo = computeQuoteDateInfo(quote);
  doc.text(`Estimated completion/delivery: ${dateInfo.label}`, marginLeft, y);
  y += 4;

  doc.text(
    `Selling price (summary): ${formatMoney(quote.sellingPrice || 0)}`,
    marginLeft,
    y
  );

  y += 8;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text(
    `PDF created: ${creationDateStr} | App version: ${cfg.appVersion}`,
    marginLeft,
    y
  );

  // Inputs
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Inputs', marginLeft, y);

  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  const inputs = quote.inputs || {};
  const inputKeys = Object.keys(inputs).sort();

  inputKeys.forEach((key) => {
    const line = `${key}: ${stringifyValue(inputs[key])}`;

    const lines = doc.splitTextToSize(line, 180 - marginLeft);
    lines.forEach((ln) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(ln, marginLeft, y);
      y += 4;
    });
  });

  // Cost breakdown
  y += 6;
  if (y > 270) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Cost breakdown', marginLeft, y);

  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  const lineItems = quote.lineItems || [];
  lineItems.forEach((item) => {
    let valueStr;

    if (item.id === 'completionTime' || item.id === 'deliveryTime') {
      const completionInfo = computeQuoteDateInfo(quote);
      valueStr = completionInfo.label;
    } else {
      valueStr = formatMoneyMaybe(item.amount);
    }

    const line = `${item.label}: ${valueStr}`;
    const lines = doc.splitTextToSize(line, 180 - marginLeft);

    lines.forEach((ln) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(ln, marginLeft, y);
      y += 4;
    });
  });
}

// -------------------------
// Date / money helpers
// -------------------------

function computeQuoteDateInfo(quote) {
  const days =
    typeof quote.deliveryDays === 'number'
      ? quote.deliveryDays
      : typeof quote.completionDays === 'number'
      ? quote.completionDays
      : null;

  if (days == null || days <= 0) {
    return { days: null, date: null, label: 'N/A' };
  }

  const base = new Date();
  const delivery = new Date(base.getTime());
  delivery.setDate(base.getDate() + Math.round(days));

  const dateStr = formatDate(delivery);
  return {
    days,
    date: delivery,
    label: `${dateStr} (in ~${Math.round(days)} days)`,
  };
}

function formatDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function buildPdfFileName(dateStr) {
  return `quotation-${dateStr}.pdf`;
}

function formatMoney(amount) {
  const n = Number(amount) || 0;
  return `PHP ${n.toFixed(2)}`;
}

function formatMoneyMaybe(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) {
    return String(amount ?? '');
  }
  return `PHP ${n.toFixed(2)}`;
}

function truncate(str, maxLen) {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + '…';
}

function stringifyValue(v) {
  if (v == null) return '';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'string') return v;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

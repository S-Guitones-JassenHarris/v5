// src/service-types/index.js

// Real service: FDM Single Color
import { fdmSingleColorFields } from './fdm-single-color/fields.js';
import { calculateFdmSingleColorQuote } from './fdm-single-color/calculator.js';

import {resinPrintingFields } from './resin-printing/fields.js';
import {calculateResinPrintingQuote } from './resin-printing/calculator.js';

import {fgfPrintingFields } from './fgf-printing/fields.js';
import {calculateFgfPrintingQuote } from './fgf-printing/calculator.js';

import {Design3dFields } from './design-3d/fields.js';
import {calculate3dDesignQuote } from './design-3d/calculator.js';

import {washCureFields } from './wash-cure/fields.js'
import {calculateWashCureQuote } from './wash-cure/calculator.js'

import {postProcessingFields } from './post-processing/fields.js'
import {calculatePostProcessingQuote } from './post-processing/calculator.js'

import {fdmMultiColorFields } from './fdm-multicolor/fields.js'
import {calculateFdmMultiColorQuote } from './fdm-multicolor/calculator.js'

import {Scan3dFields } from './scan-3d/fields.js'
import {calculate3dScanQuote } from './scan-3d/calculator.js'

// Placeholder helpers for other services
function makePlaceholderFields(label) {
  return [
    {
      id: 'placeholderInfo',
      label: `${label} inputs are not configured yet`,
      inputType: 'section',
    },
  ];
}

// Central registry of all service types
const SERVICE_TYPES = [
  {
    id: 'fdm-single-color',
    label: 'FDM Single Color',
    fields: fdmSingleColorFields,
    calculator: calculateFdmSingleColorQuote,
  },
  {
    id: 'fdm-multicolor',
    label: 'FDM Multicolor',
    fields: fdmMultiColorFields,
    calculator: calculateFdmMultiColorQuote,
  },
  {
    id: 'resin-printing',
    label: 'Resin Printing',
    fields: resinPrintingFields,
    calculator: calculateResinPrintingQuote,
  },
  {
    id: '3d-scan',
    label: '3D Scan',
    fields: Scan3dFields,
    calculator: calculate3dScanQuote,
  },
  {
    id: 'post-processing',
    label: 'Post Processing',
    fields: postProcessingFields,
    calculator: calculatePostProcessingQuote,
  },
  {
    id: '3d-design',
    label: '3D Design',
    fields: Design3dFields,
    calculator: calculate3dDesignQuote,
  },
  {
    id: 'wash-cure',
    label: 'Wash & Cure',
    fields: washCureFields,
    calculator: calculateWashCureQuote,
  },
  {
    id: 'fgf-printing',
    label: 'FGF Printing',
    fields: fgfPrintingFields,
    calculator: calculateFgfPrintingQuote,
  },
];

/**
 * Return all service type definitions (for dropdowns, etc.)
 */
export function getAllServiceTypes() {
  return SERVICE_TYPES;
}

/**
 * Look up a single service type definition by id.
 */
export function getServiceTypeById(id) {
  return SERVICE_TYPES.find((svc) => svc.id === id) || null;
}

/**
 * Get the fields configuration for a given service type id.
 */
export function getFieldsForService(serviceTypeId) {
  const svc = getServiceTypeById(serviceTypeId);
  if (!svc || !Array.isArray(svc.fields)) return [];
  return svc.fields;
}

/**
 * Calculate quote result for a given service type.
 * If no calculator is defined, returns an empty/no-op result.
 */
export function calculateQuoteForService(serviceTypeId, inputs, catalogs) {
  const svc = getServiceTypeById(serviceTypeId);
  if (!svc || typeof svc.calculator !== 'function') {
    return {
      lineItems: [],
      subtotal: 0,
      adjustments: 0,
      total: 0,
      meta: {},
    };
  }

  return svc.calculator(inputs || {}, catalogs || {});
}

// src/service-types/three-d-design/calculator.js

// Calculator for 3D Design service

// ------------------------------
// Defaults & constants
// ------------------------------

const ASSUMED_LAPTOP_WATTS = 1000;          // W
const PER_DAY_HOURS = 8;                    // normal
const PER_DAY_RUSH_HOURS = 10;              // rush

const DEFAULT_ELECTRICAL_COST_PER_KWH = 12.5;   // PHP/kWh
const DEFAULT_BASIC_SERVICE_COST_PER_HOUR = 500; // PHP/hr

// Complexity mapping: UI stores strings, calculator uses numeric [1..5]
const COMPLEXITY_MAP = {
  easy: 1,
  novice: 2,
  standard: 3,
  hard: 4,
  expert: 5,
};

export function calculate3dDesignQuote(inputs = {}, _catalogs = {}) {
  // --- Inputs ---

  const estimatedDesignHours = toNumber(inputs.estimatedDesignHours, 0);

  const complexityKey = (inputs.designComplexity || 'standard').toLowerCase();
  const complexityLevel =
    COMPLEXITY_MAP[complexityKey] ?? COMPLEXITY_MAP.standard;

  const profitMarginPercent = toNumber(inputs.profitMarginPercent, 0);
  const profitMarginDecimal = clamp(profitMarginPercent / 100, 0, 0.99);

  const allowRush = !!inputs.allowRush;

  const electricalCostPerKwh = toNumber(
    inputs.electricalCostPerKwh,
    DEFAULT_ELECTRICAL_COST_PER_KWH
  );
  const basicServiceCostPerHour = toNumber(
    inputs.basicServiceCostPerHour,
    DEFAULT_BASIC_SERVICE_COST_PER_HOUR
  );

  // --- Design time calculations ---

  // Load factor from complexity: 1 + (complexity / 2)
  // So complexity=1 => 1.5x, complexity=3 => 2.5x, etc.
  const complexityFactor = 1 + complexityLevel / 2;

  // Effective design hours, before converting to days
  const effectiveDesignHours = estimatedDesignHours * complexityFactor;

  // Days (normal) and days (rush)
  let designTimeDays =
    effectiveDesignHours > 0 ? effectiveDesignHours / PER_DAY_HOURS : 0;

  let rushDesignTimeDays =
    allowRush && effectiveDesignHours > 0
      ? effectiveDesignHours / PER_DAY_RUSH_HOURS
      : null;

  // Minimum cap of 3 days (only when there is non-zero work)
  if (effectiveDesignHours > 0) {
    designTimeDays = Math.max(3, designTimeDays);
    if (rushDesignTimeDays != null) {
      rushDesignTimeDays = Math.max(3, rushDesignTimeDays);
    }
  }

  // --- Costs ---

  // Power cost uses days (as per your formula)
  const powerCost =
    (ASSUMED_LAPTOP_WATTS * designTimeDays * electricalCostPerKwh) / 1000 || 0;

  // Service cost uses HOURS (more natural), derived from days
  const designHoursConsidered = designTimeDays * PER_DAY_HOURS;
  const serviceCost = designHoursConsidered * basicServiceCostPerHour || 0;

  const totalExpense = powerCost + serviceCost;

  // --- Pricing ---

  const finalSellPrice =
    profitMarginDecimal >= 0.99
      ? totalExpense
      : totalExpense / (1 - profitMarginDecimal);

  const rushFinalSellPrice = allowRush ? finalSellPrice * 1.5 : null;

  const profit = finalSellPrice - totalExpense;

  // Estimated delivery = design time considered (days), with min 3 already applied
  const estimatedDeliveryDays = designTimeDays;
  const rushEstimatedDeliveryDays = rushDesignTimeDays;

  // --- Sidebar line items ---

  const lineItems = [];

  lineItems.push({
    id: 'designTimeConsidered',
    label: 'Design time considered (days)',
    amount: 0, // value comes from meta.designTimeDays
  });
  lineItems.push({
    id: 'powerCost',
    label: 'Power cost',
    amount: powerCost,
  });
  lineItems.push({
    id: 'serviceCost',
    label: 'Service cost',
    amount: serviceCost,
  });
  lineItems.push({
    id: 'totalExpenses',
    label: 'Total expenses',
    amount: totalExpense,
  });
  lineItems.push({
    id: 'profit',
    label: 'Profit',
    amount: profit,
  });
  lineItems.push({
    id: 'finalSellPrice',
    label: 'Final sell price',
    amount: finalSellPrice,
  });

  if (rushFinalSellPrice != null) {
    lineItems.push({
      id: 'rushFinalSellPrice',
      label: 'Rush final sell price',
      amount: rushFinalSellPrice,
    });
  }

  // Estimated delivery (days) as a textual/time item (like completionTime)
  lineItems.push({
    id: 'estimatedDeliveryTime',
    label: 'Estimated delivery time (days)',
    amount: 0, // from meta.estimatedDeliveryDays
  });

  const subtotal = totalExpense;
  const adjustments = 0;
  const total =
    rushFinalSellPrice != null ? rushFinalSellPrice : finalSellPrice;

  return {
    lineItems,
    subtotal,
    adjustments,
    total,
    meta: {
      complexityLevel,
      effectiveDesignHours,
      designTimeDays,
      rushDesignTimeDays,
      estimatedDeliveryDays,
      rushEstimatedDeliveryDays,
      finalSellPrice,
      rushFinalSellPrice,
      totalExpense,
      profit,
    },
  };
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n) || Number.isNaN(n)) return fallback;
  return n;
}

function clamp(v, min, max) {
  if (v < min) return min;
  if (v > max) return max;
  return v;
}

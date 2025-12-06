// src/service-types/post-processing/calculator.js

// Calculator for Post Processing service

const ASSUMED_TOOL_WATTS = 500;
const PER_DAY_HOURS = 8;
const PER_DAY_RUSH_HOURS = 10;

const DEFAULT_ELECTRICAL_COST_PER_KWH = 12.5;
const DEFAULT_BASIC_SERVICE_COST_PER_HOUR = 500;

// Complexity mapping [1..5]
const COMPLEXITY_MAP = {
  minimal: 1,
  easy: 2,
  standard: 3,
  hard: 4,
  extreme: 5,
};

// Electrical tool usage mapping [0..5] (0 = none)
const TOOL_USAGE_MAP = {
  none: 0,
  minimal: 1,
  moderate: 2,
  significant: 3,
  heavy: 4,
};

export function calculatePostProcessingQuote(inputs = {}, _catalogs = {}) {
  const estimatedPostProcessHours = toNumber(
    inputs.estimatedPostProcessHours,
    0
  );

  const complexityKey = (inputs.postProcessComplexity || 'standard')
    .toLowerCase();
  const complexityLevel =
    COMPLEXITY_MAP[complexityKey] ?? COMPLEXITY_MAP.standard;

  const toolUsageKey = (inputs.electricalToolUsage || 'none').toLowerCase();
  const toolUsageLevel =
    TOOL_USAGE_MAP[toolUsageKey] ?? TOOL_USAGE_MAP.none;

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
  const procurementCosts = toNumber(inputs.procurementCosts, 0);
  const miscCosts = toNumber(inputs.miscCosts, 0);

  // Considered service time (days)
  const complexityFactor = 1 + complexityLevel / 2;

  let consideredServiceTimeDays =
    estimatedPostProcessHours > 0
      ? (estimatedPostProcessHours * complexityFactor) / PER_DAY_HOURS
      : 0;

  // No explicit min-cap specified in your text here, so I leave it as-is.
  // (If you want min 3 days like others, we can add Math.max(3, ...) later.)

  let rushConsideredServiceTimeDays =
    allowRush && estimatedPostProcessHours > 0
      ? (estimatedPostProcessHours * complexityFactor) /
        PER_DAY_RUSH_HOURS
      : null;

  // Service cost: convert days → hours
  const serviceHours = consideredServiceTimeDays * PER_DAY_HOURS;
  const serviceCost = serviceHours * basicServiceCostPerHour || 0;

  // Electrical cost
  const electricalCost =
    (ASSUMED_TOOL_WATTS *
      consideredServiceTimeDays *
      electricalCostPerKwh *
      toolUsageLevel) /
      1000 || 0;

  // Total expense
  const totalExpense =
    serviceCost + electricalCost + miscCosts + procurementCosts;

  // Prices
  const finalSellPrice =
    profitMarginDecimal >= 0.99
      ? totalExpense
      : totalExpense / (1 - profitMarginDecimal);

  const rushFinalSellPrice = allowRush ? finalSellPrice * 1.5 : null;

  const profit = finalSellPrice - totalExpense;

  // Delivery time:
  // considered service time + (estimated hours * complexity/2) / per day time
  const extraDays =
    (estimatedPostProcessHours * (complexityLevel / 2)) / PER_DAY_HOURS;

  let deliveryDays = consideredServiceTimeDays + extraDays;

  let rushDeliveryDays =
    allowRush && estimatedPostProcessHours > 0
      ? consideredServiceTimeDays +
        (estimatedPostProcessHours * (complexityLevel / 2)) /
          PER_DAY_RUSH_HOURS
      : null;

  const lineItems = [];

  lineItems.push({
    id: 'consideredServiceTime',
    label: 'Considered service time (days)',
    amount: 0, // from meta.consideredServiceTimeDays
  });
  lineItems.push({
    id: 'serviceCost',
    label: 'Service cost',
    amount: serviceCost,
  });
  lineItems.push({
    id: 'electricalCost',
    label: 'Electrical cost',
    amount: electricalCost,
  });
  lineItems.push({
    id: 'procurementCosts',
    label: 'Procurement costs',
    amount: procurementCosts,
  });
  lineItems.push({
    id: 'miscCosts',
    label: 'Miscellaneous costs',
    amount: miscCosts,
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

  lineItems.push({
    id: 'deliveryTime',
    label: 'Delivery time (days)',
    amount: 0, // meta.deliveryDays
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
      toolUsageLevel,
      consideredServiceTimeDays,
      rushConsideredServiceTimeDays: rushConsideredServiceTimeDays,
      deliveryDays,
      rushDeliveryDays,
      finalSellPrice,
      rushFinalSellPrice,
      totalExpense,
      profit,
      serviceCost,
      electricalCost,
      procurementCosts,
      miscCosts,
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

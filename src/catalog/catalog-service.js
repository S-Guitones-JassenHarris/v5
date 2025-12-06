// src/catalog/catalog-service.js

const catalogs = {
  materials: [],
  machines: [],
};

let catalogsLoaded = false;

/**
 * Public: are catalogs loaded at least once?
 */
export function areCatalogsLoaded() {
  return catalogsLoaded;
}

/**
 * Public: get a catalog array by ID (e.g. "materials", "machines").
 */
export function getCatalog(catalogId) {
  return catalogs[catalogId] || [];
}

/**
 * Public: load all known catalogs (materials, machines).
 */
export async function loadAllCatalogs() {
  try {
    const [materials, machines] = await Promise.all([
      loadCatalog('./data/materials.csv'),
      loadCatalog('./data/machines.csv'),
    ]);

    catalogs.materials = materials;
    catalogs.machines = machines;
    catalogsLoaded = true;
  } catch (err) {
    console.error('Error loading catalogs:', err);
    // Keep catalogsLoaded = false so UI can react if needed
  }
}

/**
 * Fetch and parse a CSV file into an array of objects.
 */
async function loadCatalog(url) {
  const resp = await fetch(url);
  if (!resp.ok) {
    console.warn(`Failed to load catalog from ${url}: ${resp.status}`);
    return [];
  }

  const text = await resp.text();
  return parseCsv(text);
}

/**
 * Very simple CSV parser:
 * - Assumes comma-separated
 * - First line is header row
 * - No support for quoted commas, etc. (fine for our catalogs)
 */
function parseCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) return [];

  const header = lines[0].split(',').map((h) => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(','); // simple split, fine for our use
    const obj = {};
    header.forEach((key, idx) => {
      obj[key] = (cols[idx] ?? '').trim();
    });
    rows.push(obj);
  }

  return rows;
}

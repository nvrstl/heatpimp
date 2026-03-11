// Belgian energy constants
export const GAS_KWH_PER_M3 = 10.55; // kWh gross calorific value per m³ natural gas
export const GAS_CO2_G_PER_KWH = 204;  // g CO₂ per kWh natural gas (combustion)
export const ELECTRICITY_CO2_G_PER_KWH = 134; // g CO₂ per kWh electricity Belgium (2025)

// Boiler efficiency (how much heat you actually get per kWh gas burned)
export const BOILER_EFFICIENCY = {
  old: 0.80,        // pre-2000 boiler
  standard: 0.88,   // standard gas boiler
  condensing: 0.95, // condensing boiler (HR)
};

// SCOP: Seasonal Coefficient of Performance depending on insulation quality
// Better insulation → lower flow temperature needed → higher COP
export const SCOP = {
  poor:      2.5, // bad insulation, old radiators, flow temp ~60°C
  moderate:  3.0, // average insulation, radiators, flow temp ~50°C
  good:      3.5, // good insulation, larger radiators or mixed, flow temp ~40°C
  excellent: 4.0, // excellent insulation, underfloor heating, flow temp ~35°C
};

// Installation cost estimates for air/water heat pump (Belgium 2025)
export const INSTALLATION_BASE_COST = 10500; // € base cost excl. BTW for average home
export const INSTALLATION_COST_PER_M2_ABOVE_BASE = 15; // € per m² above 120m²
export const INSTALLATION_BASE_M2 = 120; // base house size
export const FLOOR_HEATING_SURCHARGE = 3000; // € extra if floor heating needed

// Belgian energy prices (defaults, user can override)
export const DEFAULT_GAS_PRICE_PER_KWH = 0.105;   // €/kWh all-in (energy + distribution + taxes, ≈ 1.11 €/m³)
export const DEFAULT_ELECTRICITY_PRICE = 0.30;      // €/kWh residential Belgium 2025

// Annual price inflation assumptions
export const GAS_PRICE_INFLATION = 0.03;          // 3%/year gas price increase
export const ELECTRICITY_PRICE_INFLATION = 0.02;  // 2%/year electricity price increase

// Verplichte bijmenging groen gas (Belgian regulation)
// Vanaf 2027 moet aardgas verplicht worden bijgemengd met groen gas (biomethaan/waterstof),
// wat leidt tot een structurele prijsverhoging bovenop de normale marktprijsevolutie.
// Bron: verwachte Belgische/Europese regelgeving bijmenging
export const GREEN_GAS_SURCHARGE_PER_M3: Record<number, number> = {
  2027: 0.02,  // €0.01–0.03/m³ (midpoint) – start verplichte bijmenging
  2028: 0.057, // lineaire interpolatie 2027→2030
  2029: 0.093, // lineaire interpolatie 2027→2030
  2030: 0.13,  // €0.12–0.14/m³ (midpoint) – volledig bijmengingsniveau
};
// Maximale toeslag vanaf 2030 (stabiel nadien gehanteerd)
export const GREEN_GAS_SURCHARGE_MAX_PER_M3 = 0.13;

// Belgian regional subsidies for air/water heat pump (2025)
// Source: Mijn VerbouwPremie (Flanders), RENOLUTION (Brussels), Wallonia grants
export const SUBSIDIES = {
  flanders: {
    low:    4750, // category 1 income (≤ €25,000/year household)
    middle: 3750, // category 2 income (≤ €60,000/year)
    high:   3000, // category 3 income (above €60,000)
  },
  brussels: {
    low:  4750, // income ≤ €35,000/year
    high: 4250, // income above €35,000
  },
  wallonia: {
    low:  5000, // revenu modeste
    high: 3000, // revenu normal
  },
};

// VAT reduction: 21% → 6% for buildings > 10 years old (from 2026 also for newer)
// This saves 15% on the installation cost
export const VAT_SAVING_RATE = 0.15;

// CO₂ footprint of Belgian gas grid: 56 kg CO₂/GJ = 201.6 g/kWh
// Electricity grid Belgium 2025: ~134 g CO₂/kWh

export const HEAT_PUMP_LIFESPAN_YEARS = 20;

// Solar panel yield (Belgium average)
export const SOLAR_YIELD_KWH_PER_KWP = 950; // kWh/kWp/year
export const SOLAR_SELF_CONSUMPTION_RATE = 0.35; // 35% of yield used directly (free)

// Heat pump sizing
// Full load hours: how many hours/year the HP would run at full capacity to cover annual demand
// Poorly insulated homes have high peaks but fewer full-load hours; well-insulated homes run longer at low power
export const FULL_LOAD_HOURS: Record<string, number> = {
  poor:      1400,
  moderate:  1700,
  good:      2000,
  excellent: 2200,
};

// Design heat loss per m² at Belgian design conditions (outdoor -8°C, indoor 21°C)
export const HEAT_LOSS_W_PER_M2: Record<string, number> = {
  poor:      100,
  moderate:   70,
  good:        50,
  excellent:   30,
};

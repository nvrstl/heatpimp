import type { CalculationResults } from '../lib/calculations';
import CostChart from './CostChart';

interface Props {
  results: CalculationResults;
  onReset: () => void;
}

function formatEur(value: number, decimals = 0) {
  return `€${value.toLocaleString('nl-BE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

function formatKwh(value: number) {
  return `${Math.round(value).toLocaleString('nl-BE')} kWh`;
}

function StatCard({
  label, value, sub, color = 'blue', icon,
}: {
  label: string; value: string; sub?: string; color?: 'blue' | 'green' | 'orange' | 'purple'; icon: string;
}) {
  const colorMap = {
    blue:   'bg-blue-50 text-blue-700 border-blue-100',
    green:  'bg-green-50 text-green-700 border-green-100',
    orange: 'bg-orange-50 text-orange-700 border-orange-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
  };
  return (
    <div className={`rounded-2xl border p-5 ${colorMap[color]}`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-bold mb-0.5">{value}</div>
      <div className="text-sm font-medium opacity-80">{label}</div>
      {sub && <div className="text-xs opacity-60 mt-1">{sub}</div>}
    </div>
  );
}

function Row({ label, gas, hp, highlight }: { label: string; gas: string; hp: string; highlight?: boolean }) {
  return (
    <tr className={highlight ? 'bg-gray-50 font-semibold' : ''}>
      <td className="py-2.5 px-4 text-sm text-gray-700">{label}</td>
      <td className="py-2.5 px-4 text-sm text-right text-orange-700">{gas}</td>
      <td className="py-2.5 px-4 text-sm text-right text-blue-700">{hp}</td>
    </tr>
  );
}

function SubsidyBadge({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-700">{label}</span>
      <span className="text-sm font-semibold text-green-700">- {formatEur(amount)}</span>
    </div>
  );
}

export default function Results({ results, onReset }: Props) {
  const {
    annualHeatDemandKwh,
    currentAnnualGasCost,
    currentAnnualGasKwh,
    hpAnnualElecKwh,
    hpAnnualElecCost,
    hpSCOP,
    annualSavings,
    annualSavingsPercent,
    installationGrossCost,
    vatSaving,
    subsidyAmount,
    netInstallationCost,
    paybackYears,
    lifetimeSavings,
    currentCO2KgPerYear,
    hpCO2KgPerYear,
    co2SavedKgPerYear,
    co2SavedPercent,
    chartData,
    greenGasSurchargeExtraCost20y,
    solarFreeKwhYear,
    solarAnnualSaving,
  } = results;

  const paybackDisplay = paybackYears >= 99
    ? 'Niet rendabel'
    : paybackYears <= 0
      ? '< 1 jaar'
      : `${paybackYears.toFixed(1).replace('.', ',')} jaar`;

  const treeEquivalent = Math.round(co2SavedKgPerYear / 22); // ~22 kg CO₂ per tree per year

  return (
    <div className="space-y-6">

      {/* Hero summary */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <p className="text-blue-200 text-sm font-medium mb-1">Jaarlijkse besparing</p>
        <p className="text-5xl font-extrabold mb-1">{formatEur(annualSavings)}</p>
        <p className="text-blue-200 text-sm">
          {annualSavingsPercent > 0
            ? `${Math.round(annualSavingsPercent)}% minder dan je huidige gaskosten`
            : 'Warmtepomp is duurder bij huidige tarieven — overweeg bijkomende isolatie'}
        </p>
        {annualSavings <= 0 && (
          <p className="mt-3 text-xs bg-white/20 rounded-lg px-3 py-2">
            ⚠️ Met slechte isolatie en lage gasprijzen is een warmtepomp financieel minder interessant. Verbeter eerst je isolatie voor betere resultaten.
          </p>
        )}
      </div>

      {/* 4 KPI cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon="⏱️"
          label="Terugverdientijd"
          value={paybackDisplay}
          sub="na subsidies & BTW"
          color="blue"
        />
        <StatCard
          icon="💰"
          label="Netto-investering"
          value={formatEur(netInstallationCost)}
          sub="na subsidies & BTW-voordeel"
          color="orange"
        />
        <StatCard
          icon="🌿"
          label="CO₂-besparing"
          value={`${Math.round(co2SavedKgPerYear)} kg`}
          sub={`per jaar ≈ ${treeEquivalent} bomen`}
          color="green"
        />
        <StatCard
          icon="📈"
          label="Voordeel na 20 jaar"
          value={formatEur(lifetimeSavings)}
          sub="cumulatief voordeel"
          color="purple"
        />
      </div>

      {/* 20-year chart */}
      <CostChart data={chartData} paybackYears={paybackYears} />

      {/* Green gas blending surcharge notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <h3 className="font-semibold text-amber-900 mb-2">🌿 Verplichte bijmenging groen gas (vanaf 2027)</h3>
        <p className="text-sm text-amber-800 mb-3">
          Vanaf 2027 is het in België verplicht groen gas (biomethaan/waterstof) bij te mengen in het aardgasnet.
          Dit leidt tot een <strong>structurele prijsstijging</strong> bovenop de normale marktevolutie:
        </p>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { year: '2027', price: '€0,01–0,03' },
            { year: '2028', price: '~€0,06' },
            { year: '2029', price: '~€0,09' },
            { year: '2030+', price: '€0,12–0,14' },
          ].map(({ year, price }) => (
            <div key={year} className="bg-white rounded-xl p-3 text-center border border-amber-100">
              <div className="text-xs text-amber-600 font-medium mb-0.5">{year}</div>
              <div className="text-sm font-bold text-amber-800">{price}/m³</div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-amber-100">
          <span className="text-sm text-gray-700">Extra gaskost over 20 jaar (jouw verbruik)</span>
          <span className="text-sm font-bold text-amber-700">+ {formatEur(greenGasSurchargeExtraCost20y)}</span>
        </div>
        <p className="text-xs text-amber-600 mt-2">
          Deze toeslag is verwerkt in de 20-jarige vergelijking hierboven. Een warmtepomp ontwijkt deze kostenverhoging volledig.
        </p>
      </div>

      {/* Energy comparison table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Energievergelijking per jaar</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <th className="py-3 px-4 text-left">Kengetal</th>
              <th className="py-3 px-4 text-right text-orange-600">Gas nu</th>
              <th className="py-3 px-4 text-right text-blue-600">Warmtepomp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            <Row label="Warmtebehoefte" gas={formatKwh(annualHeatDemandKwh)} hp={formatKwh(annualHeatDemandKwh)} />
            <Row
              label="Energieverbruik"
              gas={`${formatKwh(currentAnnualGasKwh)} gas`}
              hp={`${formatKwh(hpAnnualElecKwh)} elektr.`}
            />
            <Row
              label="Efficiëntie"
              gas="≤ 95% (ketel)"
              hp={`SCOP ${hpSCOP.toFixed(1)} (WP)`}
            />
            <Row
              label="CO₂-uitstoot"
              gas={`${Math.round(currentCO2KgPerYear)} kg/jaar`}
              hp={`${Math.round(hpCO2KgPerYear)} kg/jaar`}
            />
            {solarFreeKwhYear > 0 && (
              <Row
                label="Gratis zonnestroom (zelfverbruik)"
                gas="—"
                hp={`- ${formatKwh(solarFreeKwhYear)}`}
              />
            )}
            <Row
              label="Jaarlijkse energiekost"
              gas={formatEur(currentAnnualGasCost)}
              hp={formatEur(hpAnnualElecCost)}
              highlight
            />
          </tbody>
        </table>
      </div>

      {/* Solar savings block */}
      {solarFreeKwhYear > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
          <h3 className="font-semibold text-yellow-900 mb-2">☀️ Besparing via zonnepanelen</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-3 text-center border border-yellow-100">
              <div className="text-xl font-bold text-yellow-700">{formatKwh(solarFreeKwhYear)}</div>
              <div className="text-xs text-gray-500 mt-0.5">gratis elektriciteit/jaar</div>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-yellow-100">
              <div className="text-xl font-bold text-yellow-700">{formatEur(solarAnnualSaving)}</div>
              <div className="text-xs text-gray-500 mt-0.5">extra besparing/jaar</div>
            </div>
          </div>
          <p className="text-xs text-yellow-700 mt-3">
            35% zelfverbruik van de jaarlijkse zonnepaneelopbrengst. Kosten van de panelen zijn niet meegerekend.
          </p>
        </div>
      )}

      {/* Installation cost breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Investeringsraming</h3>
        <div className="space-y-0">
          <div className="flex justify-between py-2.5 border-b border-gray-100">
            <span className="text-sm text-gray-700">Warmtepomp + installatie (excl. BTW)</span>
            <span className="text-sm font-medium">{formatEur(installationGrossCost)}</span>
          </div>
          {vatSaving > 0 && <SubsidyBadge label="BTW-voordeel (21% → 6%, gebouw >10 jaar)" amount={vatSaving} />}
          <SubsidyBadge label="Regionale premie (Mijn VerbouwPremie / RENOLUTION)" amount={subsidyAmount} />
          <div className="flex justify-between pt-3 mt-1">
            <span className="text-sm font-semibold text-gray-900">Netto-investering</span>
            <span className="text-lg font-bold text-blue-700">{formatEur(netInstallationCost)}</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4">
          * Ramingen zijn indicatief. Installatieprijzen variëren per installateur, type WP en specifieke woonsituatie.
          Vraag altijd meerdere offertes op. Subsidies zijn afhankelijk van je dossier en kunnen wijzigen.
        </p>
      </div>

      {/* CO2 section */}
      <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
        <h3 className="font-semibold text-green-900 mb-3">🌍 Milieu-impact</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {Math.round(currentCO2KgPerYear).toLocaleString('nl-BE')} kg
            </div>
            <div className="text-xs text-gray-500">CO₂ per jaar (gas)</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {Math.round(hpCO2KgPerYear).toLocaleString('nl-BE')} kg
            </div>
            <div className="text-xs text-gray-500">CO₂ per jaar (WP)</div>
          </div>
          <div className="bg-green-100 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-700 mb-1">
              -{Math.round(co2SavedPercent)}%
            </div>
            <div className="text-xs text-green-600">CO₂-reductie</div>
          </div>
        </div>
        <p className="text-xs text-green-700 mt-3">
          Belgisch elektriciteitsnet: ~134 g CO₂/kWh (2025, mix kernenergie + hernieuwbaar).
          Aardgas: ~204 g CO₂/kWh. Een warmtepomp reduceert je verwarmingsuitstoot met ca. {Math.round(co2SavedPercent)}%.
        </p>
      </div>

      {/* Tips */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
        <h3 className="font-semibold text-amber-900 mb-3">💡 Tips voor optimaal resultaat</h3>
        <ul className="space-y-2 text-sm text-amber-800">
          <li>✓ Combineer met <strong>zonnepanelen</strong> voor een effectief elektriciteitstarieven van €0,05–€0,10/kWh</li>
          <li>✓ Vraag minimum <strong>3 offertes</strong> bij erkende warmtepomp-installateurs (Q-Alliance certificaat)</li>
          <li>✓ Dien je premieaanvraag in <strong>vóór</strong> de installatie (niet retroactief)</li>
          <li>✓ Overweeg een <strong>boilervat</strong> voor warmtapwater om de WP te ontlasten</li>
          <li>✓ Bij radiatoren: laat een <strong>hydraulische balancering</strong> uitvoeren voor betere efficiëntie</li>
        </ul>
      </div>

      <button
        onClick={onReset}
        className="w-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3.5 rounded-2xl text-sm transition-colors"
      >
        ← Opnieuw berekenen
      </button>
    </div>
  );
}

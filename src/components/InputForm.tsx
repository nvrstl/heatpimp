import { useState } from 'react';
import type { FormInputs, InsulationLevel, BoilerType, Region, IncomeLevel, GasUnit, HeatingType } from '../lib/calculations';
import { DEFAULT_GAS_PRICE_PER_KWH, DEFAULT_ELECTRICITY_PRICE } from '../lib/constants';

interface Props {
  onCalculate: (inputs: FormInputs) => void;
}

const insulationOptions: { value: InsulationLevel; label: string; desc: string }[] = [
  { value: 'poor',      label: 'Slecht',       desc: 'Weinig/geen isolatie, enkelglas, voor 1980' },
  { value: 'moderate',  label: 'Matig',        desc: 'Dakisolatie, gedeeltelijk dubbelglas, 1980–2000' },
  { value: 'good',      label: 'Goed',         desc: 'Volledige isolatie, HR-glas, 2000–2015' },
  { value: 'excellent', label: 'Uitstekend',   desc: 'Passiefhuis/BEN, triple glas, na 2015' },
];

const boilerOptions: { value: BoilerType; label: string }[] = [
  { value: 'old',       label: 'Oude ketel (< 2000)' },
  { value: 'standard',  label: 'Standaard gasketel' },
  { value: 'condensing', label: 'Condenserende ketel (HR)' },
];

const heatingOptions: { value: HeatingType; label: string; desc: string }[] = [
  { value: 'radiators',    label: 'Radiatoren',           desc: 'Klassieke radiatoren' },
  { value: 'mixed',        label: 'Gemengd',              desc: 'Mix radiatoren en vloerverwarming' },
  { value: 'floorheating', label: 'Vloerverwarming',      desc: 'Volledig vloerverwarming' },
];

const regionOptions: { value: Region; label: string }[] = [
  { value: 'flanders',  label: 'Vlaanderen' },
  { value: 'brussels',  label: 'Brussel' },
  { value: 'wallonia',  label: 'Wallonië' },
];

const incomeOptions: { value: IncomeLevel; label: string; desc: string }[] = [
  { value: 'low',    label: 'Laag inkomen',    desc: '≤ €25.000/jaar (Vlaanderen) / ≤ €35.000 (Brussel)' },
  { value: 'middle', label: 'Midden inkomen',  desc: '≤ €60.000/jaar (enkel Vlaanderen)' },
  { value: 'high',   label: 'Hoog inkomen',    desc: 'Boven bovenstaande grenzen' },
];

const gasUnitOptions: { value: GasUnit; label: string; placeholder: string }[] = [
  { value: 'm3',    label: 'm³/jaar',    placeholder: 'bv. 1800' },
  { value: 'kwh',   label: 'kWh/jaar',   placeholder: 'bv. 18000' },
  { value: 'euros', label: '€/jaar',     placeholder: 'bv. 1500' },
];

function SectionTitle({ step, title, subtitle }: { step: number; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
        {step}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-gray-700 mb-1.5">{children}</label>;
}

function InputField({ label, value, onChange, type = 'number', min, step, suffix, hint }: {
  label: string; value: number | string; onChange: (v: string) => void;
  type?: string; min?: number; step?: number; suffix?: string; hint?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type={type}
            value={value}
            min={min}
            step={step}
            onChange={(e) => onChange(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
          {suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
              {suffix}
            </span>
          )}
        </div>
      </div>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function RadioGroup<T extends string>({ value, onChange, options }: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; desc?: string }[];
}) {
  return (
    <div className="grid gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`w-full text-left px-3.5 py-3 rounded-lg border text-sm transition-all ${
            value === opt.value
              ? 'border-blue-500 bg-blue-50 text-blue-900'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <span className="font-medium">{opt.label}</span>
          {opt.desc && <span className="ml-2 text-xs opacity-70">{opt.desc}</span>}
        </button>
      ))}
    </div>
  );
}

export default function InputForm({ onCalculate }: Props) {
  const [houseSize, setHouseSize] = useState(150);
  const [buildingAge, setBuildingAge] = useState(1990);
  const [insulation, setInsulation] = useState<InsulationLevel>('moderate');
  const [heatingType, setHeatingType] = useState<HeatingType>('radiators');

  const [gasUnit, setGasUnit] = useState<GasUnit>('m3');
  const [gasConsumption, setGasConsumption] = useState(1800);
  const [gasPrice, setGasPrice] = useState(DEFAULT_GAS_PRICE_PER_KWH);
  const [boilerType, setBoilerType] = useState<BoilerType>('standard');

  const [electricityPrice, setElectricityPrice] = useState(DEFAULT_ELECTRICITY_PRICE);

  const [hasSolar, setHasSolar] = useState(false);
  const [solarKwp, setSolarKwp] = useState(5);

  const [region, setRegion] = useState<Region>('flanders');
  const [incomeLevel, setIncomeLevel] = useState<IncomeLevel>('middle');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onCalculate({
      houseSize,
      buildingAge,
      insulation,
      heatingType,
      gasUnit,
      gasConsumption,
      gasPrice,
      boilerType,
      electricityPrice,
      region,
      incomeLevel,
      solarKwp: hasSolar ? solarKwp : 0,
    });
  }

  const currentGasUnit = gasUnitOptions.find((o) => o.value === gasUnit)!;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Section 1: Your home */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <SectionTitle step={1} title="Jouw woning" subtitle="Grootte, bouwjaar en isolatieniveau" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <InputField
            label="Bewoonbare oppervlakte"
            value={houseSize}
            onChange={(v) => setHouseSize(Number(v))}
            min={50}
            suffix="m²"
          />
          <InputField
            label="Bouwjaar"
            value={buildingAge}
            onChange={(v) => setBuildingAge(Number(v))}
            min={1900}
            step={1}
            hint="Bepaalt BTW-voordeel (6% bij >10 jaar oud)"
          />
        </div>

        <div className="mb-4">
          <Label>Isolatieniveau</Label>
          <RadioGroup value={insulation} onChange={setInsulation} options={insulationOptions} />
        </div>

        <div>
          <Label>Huidige afgiftesysteem</Label>
          <RadioGroup value={heatingType} onChange={setHeatingType} options={heatingOptions} />
        </div>
      </div>

      {/* Section 2: Current heating */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <SectionTitle step={2} title="Huidige gasverwarming" subtitle="Verbruik en tarieven — te vinden op je energiefactuur" />

        <div className="mb-4">
          <Label>Hoe wil je je verbruik ingeven?</Label>
          <div className="flex gap-2">
            {gasUnitOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setGasUnit(opt.value)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                  gasUnit === opt.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <InputField
            label={`Jaarlijks gasverbruik`}
            value={gasConsumption}
            onChange={(v) => setGasConsumption(Number(v))}
            min={0}
            suffix={currentGasUnit.label}
            hint={`${currentGasUnit.placeholder}`}
          />
          {gasUnit !== 'euros' && (
            <InputField
              label="Gasprijs"
              value={gasPrice}
              onChange={(v) => setGasPrice(Number(v))}
              min={0}
              step={0.001}
              suffix="€/kWh"
              hint="Gemiddeld: €0,08–€0,10/kWh"
            />
          )}
        </div>

        <div>
          <Label>Type gasketel</Label>
          <RadioGroup value={boilerType} onChange={setBoilerType} options={boilerOptions} />
        </div>
      </div>

      {/* Section 3: New system */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <SectionTitle step={3} title="Elektriciteit voor warmtepomp" />
        <div className="max-w-xs">
          <InputField
            label="Elektriciteitstarief"
            value={electricityPrice}
            onChange={(v) => setElectricityPrice(Number(v))}
            min={0}
            step={0.01}
            suffix="€/kWh"
            hint="Variabel tarief ca. €0,25–€0,35/kWh"
          />
        </div>
        <p className="text-xs text-gray-400 mt-3">
          💡 Tip: warmtepompen draaien best 's nachts of met zonnepanelen voor een lager effectief tarief.
        </p>
      </div>

      {/* Section 4: Solar panels */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <SectionTitle step={4} title="Zonnepanelen" subtitle="Optioneel — vermindert je elektriciteitskosten" />

        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => setHasSolar(!hasSolar)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${hasSolar ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hasSolar ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span className="text-sm font-medium text-gray-700">Ik heb (of plan) zonnepanelen</span>
        </div>

        {hasSolar && (
          <div className="max-w-xs">
            <InputField
              label="Vermogen zonnepanelen"
              value={solarKwp}
              onChange={(v) => setSolarKwp(Number(v))}
              min={1}
              step={0.5}
              suffix="kWp"
              hint={`≈ ${Math.round(solarKwp * 950 * 0.35)} kWh/jaar gratis voor de warmtepomp (35% zelfverbruik van ${Math.round(solarKwp * 950).toLocaleString('nl-BE')} kWh opbrengst)`}
            />
          </div>
        )}
      </div>

      {/* Section 5: Location & subsidies */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <SectionTitle step={5} title="Regio & inkomen" subtitle="Voor de berekening van subsidies en premies" />

        <div className="mb-4">
          <Label>Regio</Label>
          <div className="flex gap-2">
            {regionOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRegion(opt.value)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                  region === opt.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>Inkomenscategorie</Label>
          <RadioGroup
            value={incomeLevel}
            onChange={setIncomeLevel}
            options={incomeOptions.filter((o) => !(region !== 'flanders' && o.value === 'middle'))}
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-4 rounded-2xl text-base transition-colors shadow-lg shadow-blue-200"
      >
        Bereken mijn besparing →
      </button>
    </form>
  );
}

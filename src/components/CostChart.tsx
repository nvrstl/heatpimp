import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { ChartDataPoint } from '../lib/calculations';

interface Props {
  data: ChartDataPoint[];
  paybackYears: number;
}

function formatEur(value: number) {
  return `€${value.toLocaleString('nl-BE')}`;
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: number;
}) => {
  if (active && payload && payload.length) {
    const gas = payload.find((p) => p.name === 'Gas');
    const hp = payload.find((p) => p.name === 'Warmtepomp');
    const diff = gas && hp ? gas.value - hp.value : 0;
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-sm">
        <p className="font-semibold text-gray-800 mb-2">Jaar {label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }} className="flex justify-between gap-6">
            <span>{p.name}</span>
            <span className="font-medium">{formatEur(p.value)}</span>
          </p>
        ))}
        {diff > 0 && (
          <p className="mt-2 pt-2 border-t border-gray-100 text-green-600 font-semibold">
            Voordeel WP: {formatEur(diff)}
          </p>
        )}
        {diff < 0 && (
          <p className="mt-2 pt-2 border-t border-gray-100 text-orange-500 font-semibold">
            Nog te recupereren: {formatEur(-diff)}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function CostChart({ data, paybackYears }: Props) {
  const breakEvenYear = Math.ceil(paybackYears);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-semibold text-gray-900 text-base mb-1">
        Cumulatieve kosten over 20 jaar
      </h3>
      <p className="text-sm text-gray-500 mb-5">
        Inclusief installatie, energiekosten, jaarlijkse prijsstijging (gas +3%/jaar, elektriciteit +2%/jaar) en verplichte bijmenging groen gas (vanaf 2027).
      </p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              label={{ value: 'Jaar', position: 'insideBottom', offset: -2, fontSize: 12, fill: '#94a3b8' }}
            />
            <YAxis
              tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 13, paddingTop: 12 }}
            />
            {paybackYears < 20 && (
              <ReferenceLine
                x={breakEvenYear}
                stroke="#10b981"
                strokeDasharray="4 4"
                label={{
                  value: `Break-even jaar ${breakEvenYear}`,
                  position: 'insideTopRight',
                  fontSize: 11,
                  fill: '#10b981',
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="gas"
              name="Gas"
              stroke="#f97316"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="hp"
              name="Warmtepomp"
              stroke="#2563eb"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

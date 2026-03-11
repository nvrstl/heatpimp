import { useState } from 'react';
import InputForm from './components/InputForm';
import Results from './components/Results';
import { calculate } from './lib/calculations';
import type { FormInputs, CalculationResults } from './lib/calculations';

export default function App() {
  const [results, setResults] = useState<CalculationResults | null>(null);

  function handleCalculate(inputs: FormInputs) {
    const r = calculate(inputs);
    setResults(r);
    // Scroll to top of results on mobile
    setTimeout(() => {
      document.getElementById('results-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              ♨
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-base leading-tight">Warmtepomp Calculator</h1>
              <p className="text-xs text-gray-400">Gas → Lucht/water · België 2025</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Gratis</span>
            <span>Geen registratie vereist</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      {!results && (
        <div className="bg-gradient-to-b from-blue-600 to-blue-700 text-white">
          <div className="max-w-5xl mx-auto px-4 py-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">
              Overstap van gas naar warmtepomp
            </h2>
            <p className="text-blue-200 text-base sm:text-lg max-w-xl mx-auto">
              Bereken in 2 minuten je jaarlijkse besparing, terugverdientijd en CO₂-reductie.
              Inclusief Belgische subsidies en BTW-voordeel.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm">
              {[
                '✓ Subsidies Vlaanderen/Brussel/Wallonië',
                '✓ BTW-voordeel 6%',
                '✓ CO₂-vergelijking',
                '✓ 20-jaar kostengrafiek',
              ].map((item) => (
                <span key={item} className="bg-white/10 px-3 py-1.5 rounded-full text-blue-100">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-8">
        {!results ? (
          <div className="max-w-xl mx-auto">
            <InputForm onCalculate={handleCalculate} />
          </div>
        ) : (
          <div id="results-top">
            {/* Two-column on desktop: inputs on left, results on right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  Aanpassen
                </h2>
                <InputForm onCalculate={handleCalculate} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  Resultaten
                </h2>
                <Results results={results} onReset={() => setResults(null)} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center text-xs text-gray-400 space-y-1">
          <p>
            Berekeningen zijn indicatief en gebaseerd op gemiddelde Belgische energieprijzen (2025).
            Werkelijke besparingen hangen af van je specifieke situatie, installateur en energiemarkt.
          </p>
          <p>
            Subsidies: <a href="https://www.vlaanderen.be/mijn-verbouwpremie" target="_blank" rel="noopener" className="underline hover:text-gray-600">Mijn VerbouwPremie</a>
            {' · '}
            <a href="https://environnement.brussels/renolution" target="_blank" rel="noopener" className="underline hover:text-gray-600">RENOLUTION</a>
            {' · '}
            <a href="https://energie.wallonie.be" target="_blank" rel="noopener" className="underline hover:text-gray-600">Energie Wallonië</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

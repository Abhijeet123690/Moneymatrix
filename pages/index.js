// ✅ money-matrix/pages/index.js
import { useState } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import ChartSection from '../components/ChartSection';

export default function Home() {
  const [quote, setQuote] = useState(null);
  const [chartData, setChartData] = useState(null);

  const loadStock = async (symbol, name) => {
    const quoteRes = await fetch(`/api/quote?symbol=${symbol}`);
    const quoteJson = await quoteRes.json();
    setQuote(quoteJson['Global Quote']);

    const chartRes = await fetch(`/api/daily?symbol=${symbol}`);
    const chartJson = await chartRes.json();
    setChartData(chartJson);
  };

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto p-4 space-y-6">
        <SearchBar onSelect={loadStock} />
        {quote && (
          <div className="bg-slate-800 text-white p-4 rounded">
            <h2 className="text-xl font-bold">{quote['01. symbol']}</h2>
            <p className="text-2xl">₹{parseFloat(quote['05. price']).toFixed(2)}</p>
            <p className={parseFloat(quote['09. change']) > 0 ? 'text-green-400' : 'text-red-400'}>
              {quote['09. change']} ({quote['10. change percent']})
            </p>
          </div>
        )}
        {chartData && <ChartSection data={chartData} />}
      </main>
    </>
  );
}

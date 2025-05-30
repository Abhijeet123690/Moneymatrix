// ✅ money-matrix/components/ChartSection.js
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip);

export default function ChartSection({ data }) {
  if (!data || !data['Time Series (Daily)']) return null;

  const series = data['Time Series (Daily)'];
  const dates = Object.keys(series).slice(0, 30).reverse();
  const prices = dates.map((date) => parseFloat(series[date]['4. close']));

  return (
    <div className="bg-slate-800 text-white p-4 rounded">
      <h3 className="text-lg font-semibold mb-2">Price Chart</h3>
      <Line
        data={{
          labels: dates,
          datasets: [
            {
              label: 'Closing Price',
              data: prices,
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.3,
              fill: true,
            }
          ]
        }}
        options={{
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: false }
          }
        }}
      />
    </div>
  );
}

import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function ChartPanel({ data }) {
  if (!data) return null;

  const download = (id, name) => {
    const link = document.createElement('a');
    link.download = `${name}.png`;
    link.href = document.getElementById(id).toDataURL('image/png');
    link.click();
  };

  const chartClass = 'max-w-xl my-4';

  return (
    <div>
      <div className={chartClass}>
        <Bar id="perDay" data={data.perDay} />
        <button className="mt-1 px-2 py-1 bg-soft-blue" onClick={() => download('perDay', 'per-day')}>
          Download
        </button>
      </div>
      <div className={chartClass}>
        <Pie id="byWard" data={data.byWard} />
        <button className="mt-1 px-2 py-1 bg-soft-blue" onClick={() => download('byWard', 'by-ward')}>
          Download
        </button>
      </div>
      <div className={chartClass}>
        <Line id="perOperator" data={data.perOperator} />
        <button className="mt-1 px-2 py-1 bg-soft-blue" onClick={() => download('perOperator', 'per-operator')}>
          Download
        </button>
      </div>
      <div className={chartClass}>
        <Bar id="byHour" data={data.byHour} />
        <button className="mt-1 px-2 py-1 bg-soft-blue" onClick={() => download('byHour', 'by-hour')}>
          Download
        </button>
      </div>
    </div>
  );
}

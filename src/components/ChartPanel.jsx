import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ChartPanel({ data = {} }) {
  if (!data.labels) return null;

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Suspicion Scores' }
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = 'chart.png';
    link.href = document.getElementById('suspicionChart').toDataURL('image/png');
    link.click();
  };

  return (
    <div>
      <Bar id="suspicionChart" options={options} data={data} />
      <button onClick={handleDownload} className="mt-2 px-2 py-1 bg-soft-blue rounded">
        Download Graph
      </button>
    </div>
  );
}

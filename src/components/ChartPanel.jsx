import { Bar, Pie, Line, Scatter } from 'react-chartjs-2';
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
import React from 'react';

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
  const barOpts = (title, y) => ({
    plugins: { legend: { display: false }, title: { display: true, text: title } },
    scales: { x: { title: { display: true, text: 'Category' } }, y: { title: { display: true, text: y } } },
  });
  const lineOpts = (title, y) => ({
    plugins: { legend: { display: false }, title: { display: true, text: title } },
    scales: { x: { title: { display: true, text: 'Operator' } }, y: { title: { display: true, text: y } } },
  });

  const renderHeatmap = () => {
    if (!data.heatmap) return null;
    const operators = Object.keys(data.heatmap);
    return (
      <>
        <h4 className="text-center text-sm mb-1">Hourly Heatmap</h4>
        <table className="text-xs">
          <thead>
            <tr>
              <th className="px-1">Op/Hour</th>
              {Array.from({ length: 24 }).map((_, i) => (
                <th key={i} className="px-1">{i}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {operators.map((op) => (
              <tr key={op}>
                <td className="px-1 font-bold">{op}</td>
                {data.heatmap[op].map((c, i) => (
                  <td
                    key={i}
                    className="w-4 h-4"
                    style={{ backgroundColor: `rgba(96,165,250,${c / 10})` }}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  };

  const renderDeviceWard = () => {
    if (!data.deviceWard) return null;
    const devices = Object.keys(data.deviceWard);
    const wards = Array.from(new Set(devices.flatMap((d) => Object.keys(data.deviceWard[d]))));
    return (
      <>
        <h4 className="text-center text-sm mb-1">Device/Ward Matrix</h4>
        <table className="text-xs border border-soft-blue">
          <thead>
            <tr>
              <th className="px-1">Device</th>
              {wards.map((w) => (
                <th key={w} className="px-1">
                  {w}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {devices.map((d) => (
              <tr key={d}>
                <td className="px-1 font-bold">{d}</td>
                {wards.map((w) => (
                  <td key={w} className="px-1 text-center">
                    {data.deviceWard[d][w] || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  };

  return (
    <div>
      <div className={chartClass}>
        <Bar id="perDay" data={data.perDay} options={barOpts('Tests by Day', 'Tests')} />
        <button className="mt-1 px-2 py-1 bg-soft-blue" onClick={() => download('perDay', 'per-day')}>
          Download
        </button>
      </div>
      <div className={chartClass}>
        <Pie id="byWard" data={data.byWard} options={{ plugins: { title: { display: true, text: 'Tests by Ward' } } }} />
        <button className="mt-1 px-2 py-1 bg-soft-blue" onClick={() => download('byWard', 'by-ward')}>
          Download
        </button>
      </div>
      <div className={chartClass}>
        <Line id="perOperator" data={data.perOperator} options={lineOpts('Tests per Operator', 'Tests')} />
        <button className="mt-1 px-2 py-1 bg-soft-blue" onClick={() => download('perOperator', 'per-operator')}>
          Download
        </button>
      </div>
      <div className={chartClass}>
        <Bar id="byHour" data={data.byHour} options={barOpts('Tests by Hour', 'Tests')} />
        <button className="mt-1 px-2 py-1 bg-soft-blue" onClick={() => download('byHour', 'by-hour')}>
          Download
        </button>
      </div>
      <div className={chartClass}>
        <Bar id="scoreByOp" data={data.scoreByOperator} options={barOpts('Suspicious Score by Operator', 'Score')} />
        <button className="mt-1 px-2 py-1 bg-soft-blue" onClick={() => download('scoreByOp', 'score-by-operator')}>
          Download
        </button>
      </div>
      <div className={chartClass}>
        <Scatter
          id="timeline"
          data={{
            datasets: data.timeline.map((t, i) => ({
              label: t.op,
              data: t.points.map((p) => ({ x: new Date(p.time).getTime(), y: i })),
              pointRadius: 3,
              showLine: false,
              backgroundColor: '#60a5fa',
            })),
          }}
          options={{
            scales: {
              x: { type: 'linear', title: { display: true, text: 'Time' } },
              y: {
                ticks: {
                  callback: (v) => data.timeline[v]?.op || '',
                },
                title: { display: true, text: 'Operator' },
              },
            },
            plugins: { title: { display: true, text: 'Operator Timeline' } },
          }}
        />
        <button className="mt-1 px-2 py-1 bg-soft-blue" onClick={() => download('timeline', 'timeline')}>
          Download
        </button>
      </div>
      <div className={chartClass}>{renderHeatmap()}</div>
      <div className={chartClass}>{renderDeviceWard()}</div>
    </div>
  );
}

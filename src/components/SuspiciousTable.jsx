import { useState } from 'react';

export default function SuspiciousTable({ scores = [] }) {
  const [range, setRange] = useState({ min: '', max: '' });
  const [sortField, setSortField] = useState('totalScore');
  const [desc, setDesc] = useState(true);

  const filtered = scores.filter((s) => {
    if (range.min !== '' && s.avgScore < parseFloat(range.min)) return false;
    if (range.max !== '' && s.avgScore > parseFloat(range.max)) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (valA === valB) return 0;
    return (desc ? valB - valA : valA - valB);
  });

  const toggleSort = (field) => {
    if (sortField === field) {
      setDesc(!desc);
    } else {
      setSortField(field);
      setDesc(true);
    }
  };

  const color = (avg) => {
    if (avg < 1) return 'text-green-400';
    if (avg <= 2.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold mb-2">Suspicious Scores</h3>
      <div className="flex space-x-2 mb-2 text-sm">
        <input
          type="number"
          placeholder="Min avg"
          value={range.min}
          onChange={(e) => setRange({ ...range, min: e.target.value })}
          className="bg-navy border border-soft-blue p-1 w-20"
        />
        <input
          type="number"
          placeholder="Max avg"
          value={range.max}
          onChange={(e) => setRange({ ...range, max: e.target.value })}
          className="bg-navy border border-soft-blue p-1 w-20"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-soft-blue cursor-pointer">
          <tr>
            <th className="px-3 py-2" onClick={() => toggleSort('operator')}>Operator</th>
            <th className="px-3 py-2" onClick={() => toggleSort('tests')}>Tests</th>
            <th className="px-3 py-2" onClick={() => toggleSort('totalScore')}>Total Score</th>
            <th className="px-3 py-2" onClick={() => toggleSort('avgScore')}>Avg/Test</th>
            <th className="px-3 py-2" onClick={() => toggleSort('peakHour')}>Peak/Hour</th>
          </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.operator} className="odd:bg-navy even:bg-soft-blue/30">
                <td className="px-3 py-1 whitespace-nowrap">{row.operator}</td>
                <td className="px-3 py-1">{row.tests}</td>
                <td className="px-3 py-1">{row.totalScore}</td>
                <td className={`px-3 py-1 font-bold ${color(row.avgScore)}`}>{row.avgScore}</td>
                <td className="px-3 py-1">{row.peakHour}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

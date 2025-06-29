export default function ResultsTable({ results = [] }) {
  if (!results.length) return null;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left">
        <thead className="bg-soft-blue">
          <tr>
            <th className="px-3 py-2">Operator</th>
            <th className="px-3 py-2">Risk Score</th>
            <th className="px-3 py-2">Test Count</th>
            <th className="px-3 py-2">Flags</th>
          </tr>
        </thead>
        <tbody>
          {results.map((row) => (
            <tr key={row.operator} className="odd:bg-navy even:bg-soft-blue/30">
              <td className="px-3 py-2 font-medium">{row.operator}</td>
              <td className="px-3 py-2">{row.risk_score}</td>
              <td className="px-3 py-2">{row.test_count}</td>
              <td className="px-3 py-2">{row.flags.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

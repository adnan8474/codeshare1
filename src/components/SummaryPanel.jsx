export default function SummaryPanel({ stats }) {
  if (!stats) return null;
  return (
    <div className="p-4 bg-soft-blue rounded space-y-1 text-sm">
      <h3 className="font-bold mb-2">Summary</h3>
      <p>🧪 Total Tests: {stats.totalTests}</p>
      <p>👥 Unique Operators: {stats.uniqueOperators}</p>
      <p>🏆 Operator with Most Tests: {stats.operatorMostTests}</p>
      <p>🔁 Barcode Reuse Count: {stats.barcodeReuseCount}</p>
      <p>⚡ Max Consecutive Tests: {stats.maxConsecutive}</p>
      <p>⏰ Shift Violations: {stats.shiftViolations}</p>
      <p>🚨 Most Suspicious Operator: {stats.mostSuspiciousOperator}</p>
      <p>🚩 Total Anomalies: {stats.totalAnomalies}</p>
      <div>
        {Object.entries(stats.breakdown).map(([k, v]) => (
          <p key={k} className="text-xs">
            {k}: {v}
          </p>
        ))}
      </div>
    </div>
  );
}

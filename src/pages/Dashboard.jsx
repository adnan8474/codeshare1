import { useState, useEffect } from 'react';
import UploadForm from '../components/UploadForm';
import ResultsTable from '../components/ResultsTable';
import ChartPanel from '../components/ChartPanel';
import SidebarFilters from '../components/SidebarFilters';
import { analyzeData } from '../utils/dataAnalysis';
import SummaryPanel from '../components/SummaryPanel';
import RulesBuilder from '../components/RulesBuilder';
import SuspiciousTable from '../components/SuspiciousTable';
import { defaultConfig } from '../utils/anomalyUtils';

// TODO: allow exporting filtered dataset as CSV
// TODO: persist filter settings in localStorage
// TODO: add anomaly-only toggle view
// TODO: add heatmap of hourly usage
// TODO: add smoothing trend lines in charts
// TODO: AI suggestions on suspicious users
// TODO: date slider playback of activity

export default function Dashboard() {
  const [rawData, setRawData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [config, setConfig] = useState(defaultConfig);
  const [auditOnly, setAuditOnly] = useState(false);

  useEffect(() => {
    if (rawData.length) {
      const res = analyzeData(rawData, config);
      setAnalysis(res);
      setAnomalies(res.anomalies);
    }
  }, [config, rawData]);

  const handleUpload = (rows) => {
    setRawData(rows);
    setFiltered(rows);
  };

  const handleFilter = (rows) => {
    setFiltered(rows);
  };

  const displayedRows = auditOnly
    ? filtered.filter((_, idx) => anomalies.some((a) => a.row === idx))
    : filtered;

  const downloadCsv = (rows, name) => {
    const headers = Object.keys(rows[0] || {});
    const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => r[h]).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.click();
  };

  const exportPdf = () => {
    if (window.html2pdf) {
      window.html2pdf().from(document.body).save('report.pdf');
    }
  };

  return (
    <div className="flex min-h-screen bg-navy text-white">
      <SidebarFilters data={rawData} onFilter={handleFilter} />
      <div className="flex-1 p-4 space-y-6">
        <UploadForm onUploadComplete={handleUpload} />
        {filtered.length > 0 && (
          <>
            <div className="flex flex-wrap gap-4">
              <SummaryPanel stats={analysis?.stats} />
              <RulesBuilder onChange={setConfig} />
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-1">
                  <input type="checkbox" checked={auditOnly} onChange={(e) => setAuditOnly(e.target.checked)} />
                  <span>Audit Mode</span>
                </label>
                <button className="px-2 py-1 bg-soft-blue" onClick={() => downloadCsv(displayedRows, 'data.csv')}>
                  Export CSV
                </button>
                <button className="px-2 py-1 bg-soft-blue" onClick={exportPdf}>
                  Export PDF
                </button>
              </div>
            </div>
            <ResultsTable data={displayedRows} />
            <SuspiciousTable scores={analysis?.suspicious} />
            <ChartPanel data={analysis?.chartData} />
          </>
        )}
      </div>
    </div>
  );

import { useState } from 'react';
import UploadForm from '../components/UploadForm';
import ResultsTable from '../components/ResultsTable';
import ChartPanel from '../components/ChartPanel';
import SidebarFilters from '../components/SidebarFilters';
import { analyzeData } from '../utils/dataAnalysis';

// TODO: allow exporting filtered dataset as CSV
// TODO: persist filter settings in localStorage
// TODO: add anomaly-only toggle view
// TODO: add heatmap of hourly usage
// TODO: add smoothing trend lines in charts

export default function Dashboard() {
  const [rawData, setRawData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [analysis, setAnalysis] = useState(null);

  const handleUpload = (rows) => {
    setRawData(rows);
    setFiltered(rows);
    setAnalysis(analyzeData(rows));
  };

  const handleFilter = (rows) => {
    setFiltered(rows);
  };

  return (
    <div className="flex min-h-screen bg-navy text-white">
      <SidebarFilters data={rawData} onFilter={handleFilter} />
      <div className="flex-1 p-4 space-y-6">
        <UploadForm onUploadComplete={handleUpload} />
        {filtered.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-soft-blue rounded">
                <p>Total tests: {analysis?.stats.totalTests}</p>
                <p>Unique users: {analysis?.stats.uniqueUsers}</p>
                <p>Devices: {analysis?.stats.devices}</p>
                <p>Flagged anomalies: {analysis?.stats.anomalies}</p>
              </div>
            </div>
            <ResultsTable data={filtered} />
            <ChartPanel data={analysis?.chartData} />
          </>
        )}
      </div>
    </div>
  );
}

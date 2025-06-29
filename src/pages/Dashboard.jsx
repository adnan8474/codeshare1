import { useState } from 'react';
import UploadForm from '../components/UploadForm';
import ResultsTable from '../components/ResultsTable';
import ChartPanel from '../components/ChartPanel';
import SidebarFilters from '../components/SidebarFilters';

export default function Dashboard() {
  const [results, setResults] = useState(null);

  return (
    <div className="flex min-h-screen bg-navy text-white">
      <SidebarFilters />
      <div className="flex-1 p-4 space-y-6">
        <UploadForm onUploadComplete={setResults} />
        {results && (
          <>
            <ResultsTable results={results.suspicious_users} />
            <ChartPanel data={results.analytics} />
          </>
        )}
      </div>
    </div>
  );
}

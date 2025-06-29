import React from 'react';

export default function InstructionsDropdown() {
  return (
    <details className="mb-4">
      <summary className="cursor-pointer bg-soft-blue p-2 rounded font-bold">Instructions</summary>
      <div className="p-2 text-sm space-y-1">
        <p>1. Upload your CSV or Excel log using the form.</p>
        <p>2. Adjust the rules to tune anomaly detection.</p>
        <p>3. Use the filters to narrow the dataset.</p>
        <p>4. Review suspicious scores and charts.</p>
        <p>5. Export your filtered data or PDF report.</p>
      </div>
    </details>
  );
}

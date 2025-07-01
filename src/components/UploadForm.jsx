import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';

export default function UploadForm({ onUploadComplete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setSuccess(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

        const requiredHeaders = ['operator_id', 'timestamp', 'location', 'device'];
        const headers = Object.keys(json[0] || {}).map(k => k.toLowerCase());
        const missing = requiredHeaders.filter(h => !headers.includes(h));
        if (missing.length) {
          setError(`Missing required column(s): ${missing.join(', ')}`);
          setLoading(false);
          return;
        }

        onUploadComplete && onUploadComplete(json);
        setSuccess(true);
      } catch (err) {
        console.error(err);
        setError('Could not parse file');
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setError('File reading failed');
      setLoading(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
      e.target.value = null;
    }
  };

  const downloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/template.csv';
    link.download = 'template.csv';
    link.click();
  };

  return (
    <div>
      <div
        className="border-2 border-dashed border-soft-blue rounded p-6 text-center"
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <p className="mb-2">Drag & drop your CSV or Excel file here</p>
        <p className="mb-2">or</p>
        <input
          type="file"
          accept=".csv,.xlsx"
          onChange={onChange}
          ref={inputRef}
          className="hidden"
          id="fileInput"
        />
        <label htmlFor="fileInput" className="cursor-pointer text-blue-400 underline">
          Browse files
        </label>
        <button
          type="button"
          onClick={downloadTemplate}
          className="ml-4 px-2 py-1 bg-soft-blue rounded"
        >
          Download Template
        </button>
      </div>
      {loading && <p className="mt-2 text-soft-blue">Processing...</p>}
      {error && <p className="mt-2 text-red-500">{error}</p>}
      {success && <p className="mt-2 text-green-400">File loaded successfully</p>}
    </div>
  );
}

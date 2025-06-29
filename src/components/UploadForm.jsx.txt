import { useRef, useState } from 'react';
import axios from 'axios';

export default function UploadForm({ onUploadComplete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('https://poctify-1.onrender.com/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUploadComplete && onUploadComplete(res.data);
    } catch (err) {
      setError('Upload failed');
    } finally {
      setLoading(false);
    }
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
    window.location.href = 'https://poctify-1.onrender.com/template/download';
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
      {loading && <p className="mt-2 text-soft-blue">Uploading...</p>}
      {error && <p className="mt-2 text-red-500">{error}</p>}
    </div>
  );
}

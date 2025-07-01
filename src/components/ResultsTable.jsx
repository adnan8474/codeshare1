import { useState } from 'react';

export default function ResultsTable({ data = [] }) {
  const [page, setPage] = useState(0);
  const pageSize = 100;
  const headers = ['timestamp', 'operator_id', 'location', 'device'];
  const pages = Math.ceil(data.length / pageSize);
  const slice = data.slice(page * pageSize, page * pageSize + pageSize);

  if (!data.length) return null;

  return (
    <div className="mt-4">
      <p className="mb-2 text-sm text-gray-300">Total records: {data.length}</p>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-soft-blue">
            <tr>
              {headers.map((h) => (
                <th key={h} className="px-3 py-2 capitalize">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((row, i) => (
              <tr
                key={i}
                className="odd:bg-navy even:bg-soft-blue/30 transition-colors"
              >
                {headers.map((h) => (
                  <td key={h} className="px-3 py-2 whitespace-nowrap">
                    {String(row[h])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="flex justify-end mt-2 space-x-2 text-sm">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            disabled={page === 0}
            className="px-2 py-1 bg-soft-blue disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {page + 1} / {pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, pages - 1))}
            disabled={page === pages - 1}
            className="px-2 py-1 bg-soft-blue disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

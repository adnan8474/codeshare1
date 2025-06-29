import { useState, useEffect } from 'react';

function detectField(columns, names) {
  return columns.find((c) =>
    names.some((n) => c.toLowerCase().includes(n))
  );
}

export default function SidebarFilters({ data, onFilter }) {
  const columns = data.length ? Object.keys(data[0]) : [];
  const operatorField = detectField(columns, ['operator', 'user']);
  const dateField = detectField(columns, ['date', 'time']);
  const locationField = detectField(columns, ['location', 'ward', 'device']);
  const valueField = detectField(columns, ['result', 'value']);

  const [filters, setFilters] = useState({
    operators: [],
    start: '',
    end: '',
    location: '',
    min: '',
    max: '',
  });

  useEffect(() => {
    const result = data.filter((row) => {
      if (operatorField && filters.operators.length) {
        if (!filters.operators.includes(row[operatorField])) return false;
      }
      if (locationField && filters.location) {
        if (row[locationField] !== filters.location) return false;
      }
      if (dateField && (filters.start || filters.end)) {
        const d = new Date(row[dateField]);
        if (filters.start && d < new Date(filters.start)) return false;
        if (filters.end && d > new Date(filters.end)) return false;
      }
      if (valueField && (filters.min || filters.max)) {
        const v = parseFloat(row[valueField]);
        if (filters.min && v < parseFloat(filters.min)) return false;
        if (filters.max && v > parseFloat(filters.max)) return false;
      }
      return true;
    });
    onFilter(result);
  }, [filters, data]);

  const reset = () => {
    setFilters({ operators: [], start: '', end: '', location: '', min: '', max: '' });
  };

  const operatorOptions = Array.from(new Set(data.map((r) => r[operatorField])));
  const locationOptions = Array.from(new Set(data.map((r) => r[locationField])));

  return (
    <aside className="w-64 p-4 border-r border-soft-blue hidden md:block space-y-4">
      <h2 className="text-xl font-bold">Filters</h2>
      {operatorField && (
        <div>
          <label className="block mb-1 text-sm">Operators</label>
          <select
            multiple
            value={filters.operators}
            onChange={(e) =>
              setFilters({
                ...filters,
                operators: Array.from(e.target.selectedOptions).map((o) => o.value),
              })
            }
            className="w-full bg-navy border border-soft-blue p-1"
          >
            {operatorOptions.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
        </div>
      )}
      {dateField && (
        <div>
          <label className="block mb-1 text-sm">Date Range</label>
          <div className="flex space-x-2">
            <input
              type="date"
              value={filters.start}
              onChange={(e) => setFilters({ ...filters, start: e.target.value })}
              className="bg-navy border border-soft-blue p-1 w-full"
            />
            <input
              type="date"
              value={filters.end}
              onChange={(e) => setFilters({ ...filters, end: e.target.value })}
              className="bg-navy border border-soft-blue p-1 w-full"
            />
          </div>
        </div>
      )}
      {locationField && (
        <div>
          <label className="block mb-1 text-sm">Location</label>
          <select
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            className="w-full bg-navy border border-soft-blue p-1"
          >
            <option value="">All</option>
            {locationOptions.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      )}
      {valueField && (
        <div>
          <label className="block mb-1 text-sm">{valueField} Range</label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={filters.min}
              onChange={(e) => setFilters({ ...filters, min: e.target.value })}
              className="bg-navy border border-soft-blue p-1 w-full"
            />
            <input
              type="number"
              value={filters.max}
              onChange={(e) => setFilters({ ...filters, max: e.target.value })}
              className="bg-navy border border-soft-blue p-1 w-full"
            />
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={reset}
        className="px-2 py-1 bg-soft-blue w-full"
      >
        Reset Filters
      </button>
    </aside>
  );
}

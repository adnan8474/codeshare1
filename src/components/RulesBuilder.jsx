import { useState, useEffect } from 'react';
import { defaultConfig } from '../utils/anomalyUtils';

const STORAGE_KEY = 'poct_rules';

export default function RulesBuilder({ onChange }) {
  const [rules, setRules] = useState(defaultConfig);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setRules({ ...defaultConfig, ...parsed });
      onChange && onChange({ ...defaultConfig, ...parsed });
    }
  }, []);

  const update = (field, value) => {
    const updated = { ...rules, [field]: value };
    setRules(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    onChange && onChange(updated);
  };

  return (
    <div className="p-4 bg-soft-blue rounded space-y-2 text-sm">
      <h3 className="font-bold mb-1">Rules</h3>
      <div>
        <label className="mr-2">Working hours start</label>
        <input
          type="number"
          min="0"
          max="23"
          value={rules.workingHours[0]}
          onChange={(e) => update('workingHours', [parseInt(e.target.value, 10), rules.workingHours[1]])}
          className="bg-navy border border-soft-blue p-1 w-16"
        />
        <span className="mx-1">-</span>
        <input
          type="number"
          min="0"
          max="23"
          value={rules.workingHours[1]}
          onChange={(e) => update('workingHours', [rules.workingHours[0], parseInt(e.target.value, 10)])}
          className="bg-navy border border-soft-blue p-1 w-16"
        />
      </div>
      <div>
        <label className="mr-2">Max per hour</label>
        <input
          type="number"
          value={rules.maxPerHour}
          onChange={(e) => update('maxPerHour', parseInt(e.target.value, 10))}
          className="bg-navy border border-soft-blue p-1 w-20"
        />
      </div>
      <div>
        <label className="mr-2">Max per day</label>
        <input
          type="number"
          value={rules.maxPerDay}
          onChange={(e) => update('maxPerDay', parseInt(e.target.value, 10))}
          className="bg-navy border border-soft-blue p-1 w-20"
        />
      </div>
      <div>
        <label className="mr-2">Min ward gap (min)</label>
        <input
          type="number"
          value={rules.minWardGapMinutes}
          onChange={(e) => update('minWardGapMinutes', parseInt(e.target.value, 10))}
          className="bg-navy border border-soft-blue p-1 w-20"
        />
      </div>
    </div>
  );
}

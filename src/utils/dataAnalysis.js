import { detectAnomalies, summarize, guessFields } from './anomalyUtils';

export function analyzeData(rows, config) {
  const { fields, anomalies } = detectAnomalies(rows, config);
  const stats = summarize(rows, anomalies, fields);

  if (!rows.length) return { stats, anomalies: [], chartData: {} };

  const locationField = fields.ward;
  const deviceField = fields.device;
  const timeField = fields.time;
  const operatorField = fields.operator;

  // charts data
  const countsByDay = {};
  const countsByWard = {};
  const countsByHour = Array(24).fill(0);
  const heatmap = {};
  const timeline = {};
  const countsByOperator = {};
  const deviceWard = {};

  rows.forEach((row) => {
    const time = new Date(row[timeField]);
    const day = time.toISOString().slice(0, 10);
    countsByDay[day] = (countsByDay[day] || 0) + 1;
    const ward = row[locationField];
    countsByWard[ward] = (countsByWard[ward] || 0) + 1;
    countsByHour[time.getHours()]++;
    const op = row[operatorField];
    countsByOperator[op] = (countsByOperator[op] || 0) + 1;
    if (!heatmap[op]) heatmap[op] = Array(24).fill(0);
    heatmap[op][time.getHours()]++;
    if (!timeline[op]) timeline[op] = [];
    timeline[op].push(time.toISOString());
    const device = row[deviceField];
    if (device && ward) {
      if (!deviceWard[device]) deviceWard[device] = {};
      deviceWard[device][ward] = (deviceWard[device][ward] || 0) + 1;
    }
  });

  const chartData = {
    perDay: {
      labels: Object.keys(countsByDay),
      datasets: [{ label: 'Tests', data: Object.values(countsByDay), backgroundColor: '#60a5fa' }],
    },
    byWard: {
      labels: Object.keys(countsByWard),
      datasets: [{ label: 'Wards', data: Object.values(countsByWard), backgroundColor: Object.keys(countsByWard).map(() => '#60a5fa') }],
    },
    perOperator: {
      labels: Object.keys(countsByOperator),
      datasets: [{ label: 'Tests', data: Object.values(countsByOperator), backgroundColor: '#60a5fa' }],
    },
    byHour: {
      labels: countsByHour.map((_, i) => `${i}:00`),
      datasets: [{ label: 'Tests', data: countsByHour, backgroundColor: '#60a5fa' }],
    },
    heatmap,
    timeline: Object.entries(timeline).map(([op, times]) => ({
      op,
      points: times.map((t) => ({ time: t })),
    })),
    deviceWard,
  };

  return { stats, anomalies, chartData };
}

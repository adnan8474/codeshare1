import { detectAnomalies, summarize, guessFields } from './anomalyUtils';

export function calculateSuspiciousScores(rows, cfg = {}) {
  const {
    workingHours = [7, 20],
    wardChangeMinutes = 10,
    deviceChangeMinutes = 10,
    freqPerHour = 15,
  } = cfg;
  const fields = guessFields(rows);
  const map = {};
  rows.forEach((row) => {
    const op = row[fields.operator];
    if (!op) return;
    const time = new Date(row[fields.time]);
    const ward = row[fields.ward];
    const device = row[fields.device];
    if (!map[op]) map[op] = { events: [], hours: {}, score: 0 };
    map[op].events.push({ time, ward, device });
    const hourKey = time.toISOString().slice(0, 13);
    map[op].hours[hourKey] = (map[op].hours[hourKey] || 0) + 1;
    const h = time.getHours();
    if (h < workingHours[0] || h > workingHours[1]) map[op].score += 2;
  });

  Object.values(map).forEach((info) => {
    info.events.sort((a, b) => a.time - b.time);
    for (let i = 1; i < info.events.length; i++) {
      const prev = info.events[i - 1];
      const cur = info.events[i];
      const diff = (cur.time - prev.time) / 60000;
      if (prev.ward && cur.ward && prev.ward !== cur.ward && diff < wardChangeMinutes) {
        info.score += 3;
      }
      if (prev.device && cur.device && prev.device !== cur.device && diff < deviceChangeMinutes) {
        info.score += 1;
      }
    }
    Object.values(info.hours).forEach((count) => {
      if (count > freqPerHour) info.score += 2 * (count - freqPerHour);
    });
  });

  const scores = Object.entries(map).map(([operator, info]) => {
    const avg = info.events.length ? info.score / info.events.length : 0;
    return {
      operator,
      tests: info.events.length,
      totalScore: info.score,
      avgScore: Number(avg.toFixed(2)),
    };
  });

  return { fields, scores };
}

export function analyzeData(rows, config) {
  const { fields, anomalies } = detectAnomalies(rows, config);
  const stats = summarize(rows, anomalies, fields);
  const { scores } = calculateSuspiciousScores(rows, config);

  if (!rows.length) return { stats, anomalies: [], chartData: {}, suspicious: [] };

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

  return { stats, anomalies, chartData, suspicious: scores };
}

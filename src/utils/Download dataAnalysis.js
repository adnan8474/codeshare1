import { detectAnomalies, summarize, guessFields } from './anomalyUtils';

export function calculateSuspiciousScores(rows, cfg = {}) {
  const {
    workingHours = [7, 20],
    wardChangeMinutes = 10,
    deviceChangeMinutes = 10,
    freqPerHour = 15,
    barcodeReusePenalty = 2,
  } = cfg;
  const fields = guessFields(rows);
  const map = {};
  const barcodeDayMap = {};
  rows.forEach((row) => {
    const op = row[fields.operator];
    if (!op) return;
    const time = new Date(row[fields.time]);
    const ward = row[fields.ward];
    const device = row[fields.device];
    const barcode = row[fields.barcode];
    if (!map[op]) map[op] = { events: [], hours: {}, score: 0 };
    map[op].events.push({ time, ward, device });
    const hourKey = time.toISOString().slice(0, 13);
    map[op].hours[hourKey] = (map[op].hours[hourKey] || 0) + 1;
    const h = time.getHours();
    if (h < workingHours[0] || h > workingHours[1]) map[op].score += 2;

    if (barcode) {
      const day = time.toISOString().slice(0, 10);
      if (!barcodeDayMap[barcode]) barcodeDayMap[barcode] = {};
      if (!barcodeDayMap[barcode][day]) barcodeDayMap[barcode][day] = new Set();
      barcodeDayMap[barcode][day].add(op);
    }
  });

  Object.entries(barcodeDayMap).forEach(([, days]) => {
    Object.values(days).forEach((ops) => {
      if (ops.size > 1) {
        ops.forEach((op) => {
          if (map[op]) map[op].score += barcodeReusePenalty;
        });
      }
    });
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
      info.peak = Math.max(info.peak || 0, count);
    });
  });

  const scores = Object.entries(map).map(([operator, info]) => {
    const avg = info.events.length ? info.score / info.events.length : 0;
    return {
      operator,
      tests: info.events.length,
      totalScore: info.score,
      avgScore: Number(avg.toFixed(2)),
      peakHour: info.peak || 0,
    };
  });

  return { fields, scores };
}

export function analyzeData(rows, config) {
  const { fields, anomalies } = detectAnomalies(rows, config);
  const { scores } = calculateSuspiciousScores(rows, config);
  const stats = summarize(rows, anomalies, fields, scores);

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
    scoreByOperator: {
      labels: scores.map((s) => s.operator),
      datasets: [{ label: 'Suspicious Score', data: scores.map((s) => s.totalScore), backgroundColor: '#f87171' }],
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

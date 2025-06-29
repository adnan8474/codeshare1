export function analyzeData(rows) {
  const stats = {
    totalTests: rows.length,
    uniqueUsers: 0,
    devices: 0,
    anomalies: 0,
  };

  if (!rows.length) return { stats, anomalies: [], charts: {} };

  const keys = Object.keys(rows[0]);
  const getField = (names) => keys.find((k) => names.some((n) => k.toLowerCase().includes(n)));

  const operatorField = getField(['operator', 'user']);
  const locationField = getField(['location', 'ward']);
  const deviceField = getField(['device']);
  const timeField = getField(['time', 'date']);
  const barcodeField = getField(['barcode']);

  stats.uniqueUsers = new Set(rows.map((r) => r[operatorField])).size;
  stats.devices = new Set(rows.map((r) => r[deviceField])).size;

  const anomalies = [];

  const byOperator = {};
  rows.forEach((row) => {
    const op = row[operatorField];
    const loc = row[locationField];
    const time = new Date(row[timeField]);
    const device = row[deviceField];
    const barcode = row[barcodeField];

    if (!byOperator[op]) byOperator[op] = [];
    byOperator[op].push({ time, loc, device, barcode });
  });

  Object.entries(byOperator).forEach(([op, events]) => {
    events.sort((a, b) => a.time - b.time);
    let shiftCount = 0;
    let shiftStart = events[0].time;
    const locations = new Set();
    const barcodes = new Set();

    events.forEach((e) => {
      locations.add(e.loc);
      if (barcodes.has(e.barcode)) {
        anomalies.push({ op, issue: 'Barcode reuse', time: e.time.toISOString() });
      }
      barcodes.add(e.barcode);

      const hour = e.time.getHours();
      if (hour < 7 || hour > 21) {
        anomalies.push({ op, issue: 'Usage outside hours', time: e.time.toISOString() });
      }
      if (e.time - shiftStart > 8 * 3600 * 1000) {
        shiftStart = e.time;
        shiftCount = 0;
      }
      shiftCount++;
      if (shiftCount > 20) {
        anomalies.push({ op, issue: 'Excessive tests in shift', time: e.time.toISOString() });
      }
    });
    if (locations.size > 1) {
      anomalies.push({ op, issue: 'Multiple locations', time: events[0].time.toISOString() });
    }
  });

  stats.anomalies = anomalies.length;

  // charts data
  const countsByDay = {};
  const countsByWard = {};
  const countsByHour = Array(24).fill(0);
  const countsByOperator = {};

  rows.forEach((row) => {
    const time = new Date(row[timeField]);
    const day = time.toISOString().slice(0, 10);
    countsByDay[day] = (countsByDay[day] || 0) + 1;
    const ward = row[locationField];
    countsByWard[ward] = (countsByWard[ward] || 0) + 1;
    countsByHour[time.getHours()]++;
    const op = row[operatorField];
    countsByOperator[op] = (countsByOperator[op] || 0) + 1;
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
  };

  return { stats, anomalies, chartData };
}

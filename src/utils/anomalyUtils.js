export const defaultConfig = {
  workingHours: [7, 20],
  maxPerHour: 25,
  maxPerDay: 150,
  minWardGapMinutes: 15,
};

export function guessFields(rows) {
  if (!rows.length) return {};
  const keys = Object.keys(rows[0]);
  const find = (names) => keys.find((k) => names.some((n) => k.toLowerCase().includes(n)));
  return {
    operator: find(['operator', 'user']),
    device: find(['device', 'serial']),
    ward: find(['ward', 'location']),
    time: find(['time', 'date']),
    barcode: find(['barcode', 'patient']),
    result: find(['result', 'value']),
  };
}

export function detectAnomalies(rows, cfg = {}) {
  const config = { ...defaultConfig, ...cfg };
  const fields = guessFields(rows);
  const anomalies = [];
  if (!rows.length || !fields.time) return { fields, anomalies };

  const byOperator = {};
  const byBarcode = {};
  const byResult = {};

  rows.forEach((row, index) => {
    const op = row[fields.operator];
    const ward = row[fields.ward];
    const device = row[fields.device];
    const barcode = row[fields.barcode];
    const result = parseFloat(row[fields.result]);
    const time = new Date(row[fields.time]);
    const day = time.toISOString().slice(0, 10);
    const hourKey = `${day}-${time.getHours()}`;

    if (!byOperator[op]) byOperator[op] = { events: [], byDay: {}, byHour: {} };
    byOperator[op].events.push({ index, ward, device, time, barcode });
    byOperator[op].byDay[day] = (byOperator[op].byDay[day] || 0) + 1;
    byOperator[op].byHour[hourKey] = (byOperator[op].byHour[hourKey] || 0) + 1;

    if (barcode) {
      if (!byBarcode[barcode]) byBarcode[barcode] = {};
      if (!byBarcode[barcode][day]) byBarcode[barcode][day] = new Set();
      byBarcode[barcode][day].add(op);
    }

    if (!isNaN(result)) byResult[result] = (byResult[result] || 0) + 1;
  });

  // Barcode reuse across operators within same day
  Object.entries(byBarcode).forEach(([barcode, days]) => {
    Object.entries(days).forEach(([day, ops]) => {
      if (ops.size > 1) {
        ops.forEach((op) => {
          anomalies.push({ type: 'Barcode reuse across operators', severity: 'high', operator: op, barcode, day });
        });
      }
    });
  });

  // per operator checks
  Object.entries(byOperator).forEach(([op, info]) => {
    const events = info.events.sort((a, b) => a.time - b.time);
    // location / device switching quickly
    for (let i = 1; i < events.length; i++) {
      const prev = events[i - 1];
      const cur = events[i];
      const diffMin = (cur.time - prev.time) / 60000;
      if ((cur.device && prev.device && cur.device !== prev.device) || (cur.ward && prev.ward && cur.ward !== prev.ward)) {
        if (diffMin < config.minWardGapMinutes) {
          anomalies.push({ type: 'Location switch too fast', severity: 'medium', operator: op, time: cur.time.toISOString(), row: cur.index });
        }
      }
      if (diffMin === 0.5) {
        anomalies.push({ type: 'Consistent interval', severity: 'low', operator: op, time: cur.time.toISOString(), row: cur.index });
      }
    }

    // shift violations
    events.forEach((e) => {
      const h = e.time.getHours();
      if (h < config.workingHours[0] || h > config.workingHours[1]) {
        anomalies.push({ type: 'Shift violation', severity: 'high', operator: op, time: e.time.toISOString(), row: e.index });
      }
    });

    // spikes
    Object.entries(info.byHour).forEach(([key, count]) => {
      if (count > config.maxPerHour) {
        anomalies.push({ type: 'Hourly spike', severity: 'high', operator: op, hour: key, count });
      }
    });
    Object.entries(info.byDay).forEach(([day, count]) => {
      if (count > config.maxPerDay) {
        anomalies.push({ type: 'Daily spike', severity: 'high', operator: op, day, count });
      }
    });
  });

  // repeated results
  Object.entries(byResult).forEach(([val, count]) => {
    if (count > 10) {
      anomalies.push({ type: 'Repeated result', severity: 'medium', value: val, count });
    }
  });

  // outliers
  const numericValues = Object.keys(byResult).map(Number).filter((n) => !isNaN(n));
  if (numericValues.length) {
    const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
    const std = Math.sqrt(numericValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / numericValues.length);
    numericValues.forEach((v) => {
      if (Math.abs(v - mean) > 3 * std) {
        anomalies.push({ type: 'Result outlier', severity: 'medium', value: v });
      }
    });
  }

  return { fields, anomalies };
}

export function summarize(rows, anomalies, fields, scores = []) {
  const operatorCounts = {};
  const barcodeReuse = anomalies.filter((a) => a.type === 'Barcode reuse across operators').length;
  anomalies = anomalies || [];

  rows.forEach((r) => {
    const op = r[fields.operator];
    operatorCounts[op] = (operatorCounts[op] || 0) + 1;
  });

  const operators = Object.keys(operatorCounts);
  const maxOp = operators.reduce((a, b) => (operatorCounts[a] > operatorCounts[b] ? a : b), operators[0] || '');
  const maxConsecutive = Math.max(
    ...operators.map((op) => operatorCounts[op] || 0)
  );

  const shiftViolations = anomalies.filter((a) => a.type === 'Shift violation').length;

  const mostSuspicious = scores.reduce((a, b) => (a.avgScore > b.avgScore ? a : b), scores[0] || { operator: '', avgScore: 0 });

  return {
    totalTests: rows.length,
    uniqueOperators: operators.length,
    operatorMostTests: maxOp,
    barcodeReuseCount: barcodeReuse,
    maxConsecutive,
    shiftViolations,
    totalAnomalies: anomalies.length,
    mostSuspiciousOperator: mostSuspicious.operator || '',
    breakdown: anomalies.reduce((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1;
      return acc;
    }, {}),
  };
}


export function guessFields(rows) {
  if (!rows.length) return {};

  const keys = Object.keys(rows[0]);
  const normalizedKeys = keys.reduce((map, key) => {
    const clean = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    map[clean] = key;
    return map;
  }, {});

  return {
    operator: normalizedKeys['operatorid'] || '',
    device: normalizedKeys['device'] || '',
    ward: normalizedKeys['location'] || normalizedKeys['ward'] || '',
    time: normalizedKeys['timestamp'] || normalizedKeys['time'] || normalizedKeys['datetime'] || '',
  };
}

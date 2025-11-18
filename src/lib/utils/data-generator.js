export function generateTimeSeriesData(metric, timeRange) {
  const now = new Date();
  const data = [];
  
  let points;
  let intervalMinutes;
  let baseValue;
  let variation;
  
  // Configuración según la métrica
  switch (metric) {
    case 'pressure':
      baseValue = 1.5;
      variation = 0.3;
      break;
    case 'ph':
      baseValue = 7.2;
      variation = 0.5;
      break;
    case 'temperature':
      baseValue = 25;
      variation = 3;
      break;
  }
  
  // Configuración según el rango de tiempo
  switch (timeRange) {
    case 'day':
      points = 48; // Cada 30 minutos durante 24 horas
      intervalMinutes = 30;
      break;
    case 'week':
      points = 56; // Cada 3 horas durante 7 días
      intervalMinutes = 180;
      break;
    case 'month':
      points = 60; // Cada 12 horas durante 30 días
      intervalMinutes = 720;
      break;
  }
  
  // Generar datos con variación suave
  let previousValue = baseValue;
  
  for (let i = 0; i < points; i++) {
    const timestamp = new Date(now.getTime() - (points - i - 1) * intervalMinutes * 60 * 1000);
    
    // Variación suave con tendencia aleatoria
    const change = (Math.random() - 0.5) * variation * 0.3;
    let newValue = previousValue + change;
    
    // Mantener dentro de rangos razonables
    newValue = Math.max(baseValue - variation, Math.min(baseValue + variation, newValue));
    
    data.push({
      time: formatTime(timestamp, timeRange),
      value: newValue
    });
    
    previousValue = newValue;
  }
  
  return data;
}

function formatTime(date, timeRange) {
  if (timeRange === 'day') {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  } else if (timeRange === 'week') {
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  } else {
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }
}

export function getLatestValue(data) {
  if (data.length === 0) return 0;
  return data[data.length - 1].value;
}
import express from 'express';
import cors from 'cors';
import pool from './db.js';

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Almacenamiento temporal de datos (últimos 5 minutos)
let sensorDataBuffer = [];
const BUFFER_SIZE = 60; // 60 lecturas x 5 segundos = 5 minutos

// ===== FUNCIONES AUXILIARES =====

// Guardar lecturas en buffer
function addToBuffer(data) {
  sensorDataBuffer.push(data);
  if (sensorDataBuffer.length > BUFFER_SIZE) {
    sensorDataBuffer.shift();
  }
}

// Calcular promedios del buffer
function calculateStats() {
  if (sensorDataBuffer.length === 0) return null;
  
  const pressures = sensorDataBuffer.map(d => d.pressure);
  const humidities = sensorDataBuffer.map(d => d.humidity);
  const temperatures = sensorDataBuffer.map(d => d.temperature);
  
  return {
    pressure_avg: (pressures.reduce((a, b) => a + b) / pressures.length).toFixed(2),
    humidity_avg: (humidities.reduce((a, b) => a + b) / humidities.length).toFixed(2),
    temperature_avg: (temperatures.reduce((a, b) => a + b) / temperatures.length).toFixed(2),
    pressure_max: Math.max(...pressures).toFixed(2),
    humidity_max: Math.max(...humidities).toFixed(2),
    temperature_max: Math.max(...temperatures).toFixed(2),
    pressure_min: Math.min(...pressures).toFixed(2),
    humidity_min: Math.min(...humidities).toFixed(2),
    temperature_min: Math.min(...temperatures).toFixed(2)
  };
}

// Guardar en BD cada 5 minutos
async function archiveData() {
  try {
    const stats = calculateStats();
    if (!stats) return;
    
    const connection = await pool.getConnection();
    const ahora = new Date();
    
    // Insertar en tabla presión
    await connection.query(
      'INSERT INTO presion (valor_hpa, fecha_hora, fuente) VALUES (?, ?, ?)',
      [stats.pressure_avg, ahora, 'ESP32-DHT22']
    );
    
    // Insertar en tabla humedad
    await connection.query(
      'INSERT INTO humedad (valor_porcentaje, fecha_hora, fuente) VALUES (?, ?, ?)',
      [stats.humidity_avg, ahora, 'ESP32-DHT22']
    );
    
    // Insertar en tabla temperatura
    await connection.query(
      'INSERT INTO temperatura (valor_celsius, fecha_hora, fuente) VALUES (?, ?, ?)',
      [stats.temperature_avg, ahora, 'ESP32-DHT22']
    );
    
    connection.release();
    
    console.log(`✅ Datos archivados en BD: ${new Date().toLocaleTimeString('es-ES')}`);
    console.log(`  Presión: ${stats.pressure_avg} hPa`);
    console.log(`  Humedad: ${stats.humidity_avg} %`);
    console.log(`  Temperatura: ${stats.temperature_avg} °C`);
  } catch (error) {
    console.error('❌ Error archivando datos:', error);
  }
}

// ===== RUTAS =====

// POST: Recibir datos del ESP32
app.post('/api/sensors', async (req, res) => {
  try {
    const { pressure, humidity, temperature } = req.body;
    
    if (pressure === undefined || humidity === undefined || temperature === undefined) {
      return res.status(400).json({ 
        error: 'Faltan campos: pressure, humidity, temperature' 
      });
    }
    
    const data = {
      pressure: parseFloat(pressure),
      humidity: parseFloat(humidity),
      temperature: parseFloat(temperature),
      timestamp: new Date().toISOString()
    };
    
    // Agregar al buffer
    addToBuffer(data);
    
    // Guardar en BD (tabla de tiempo real)
    try {
      const connection = await pool.getConnection();
      const ahora = new Date();
      
      // Insertar en tabla presión
      await connection.query(
        'INSERT INTO presion (valor_hpa, fecha_hora, fuente) VALUES (?, ?, ?)',
        [data.pressure, ahora, 'ESP32-DHT22']
      );
      
      // Insertar en tabla humedad
      await connection.query(
        'INSERT INTO humedad (valor_porcentaje, fecha_hora, fuente) VALUES (?, ?, ?)',
        [data.humidity, ahora, 'ESP32-DHT22']
      );
      
      // Insertar en tabla temperatura
      await connection.query(
        'INSERT INTO temperatura (valor_celsius, fecha_hora, fuente) VALUES (?, ?, ?)',
        [data.temperature, ahora, 'ESP32-DHT22']
      );
      
      connection.release();
      console.log(`✅ Dato recibido y guardado: P=${data.pressure}hPa, H=${data.humidity}%, T=${data.temperature}°C`);
    } catch (dbError) {
      console.warn('⚠️ Dato recibido pero no guardado en BD:', dbError.message);
    }
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error procesando datos' });
  }
});

// GET: Obtener últimos datos en memoria
app.get('/api/sensors', (req, res) => {
  res.json(sensorDataBuffer);
});

// GET: Obtener datos históricos de BD
app.get('/api/sensors/archive', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Obtener últimas 288 lecturas (24h si es cada 5 min)
    const [presion] = await connection.query(
      'SELECT * FROM presion ORDER BY fecha_hora DESC LIMIT 288'
    );
    const [humedad] = await connection.query(
      'SELECT * FROM humedad ORDER BY fecha_hora DESC LIMIT 288'
    );
    const [temperatura] = await connection.query(
      'SELECT * FROM temperatura ORDER BY fecha_hora DESC LIMIT 288'
    );
    
    connection.release();
    
    res.json({
      presion: presion.reverse(),
      humedad: humedad.reverse(),
      temperatura: temperatura.reverse()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    records_buffer: sensorDataBuffer.length,
    timestamp: new Date().toISOString()
  });
});

// ===== SERVIDOR =====
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📡 POST /api/sensors - Recibir datos del ESP32`);
  console.log(`📊 GET /api/sensors - Obtener datos en memoria (últimos 5 min)`);
  console.log(`📈 GET /api/sensors/archive - Obtener datos archivados en BD`);
  console.log(`🏥 GET /health - Estado del servidor\n`);
});

// Ejecutar archivado cada 5 minutos
setInterval(archiveData, 5 * 60 * 1000);

// Primer archivado después de 5 minutos
setTimeout(archiveData, 5 * 60 * 1000);

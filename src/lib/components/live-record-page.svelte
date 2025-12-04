<script>
  import Button from '$lib/components/ui/button.svelte';
  import Card from '$lib/components/ui/card.svelte';
  import CardContent from '$lib/components/ui/card-content.svelte';
  import CardHeader from '$lib/components/ui/card-header.svelte';
  import CardTitle from '$lib/components/ui/card-title.svelte';
  import LineChart from './line-chart.svelte';
  import { onMount, onDestroy } from 'svelte';
  
  let { user, onlogout, onnavigate } = $props();
  
  // Estado para almacenar los datos del día
  let todayData = $state([]);
  let ws;
  let lastUpdateTime = $state('');
  let nextUpdateTime = $state('');
  
  // Función para agregar nuevo punto de datos desde WebSocket
  function addNewDataPoint(data) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    const newPoint = {
      time: timeStr,
      pressure: data.pressure,
      humidity: data.humidity,
      temperature: data.temperature
    };
    
    todayData = [...todayData, newPoint];
    lastUpdateTime = now.toLocaleTimeString('es-ES');
    
    // Calcular próxima actualización (asumiendo cada 30 minutos)
    const nextUpdate = new Date(now.getTime() + 30 * 60 * 1000);
    nextUpdateTime = nextUpdate.toLocaleTimeString('es-ES');
    
    // Mantener solo datos del día actual (máximo 48 puntos = 24 horas)
    if (todayData.length > 48) {
      todayData = todayData.slice(-48);
    }
    
    console.log('Nuevo dato recibido:', newPoint);
  }
  
  // Calcular tiempo restante para próxima actualización
  let timeRemaining = $state('');
  
  function updateTimeRemaining() {
    if (nextUpdateTime) {
      const now = new Date();
      const [hours, minutes] = nextUpdateTime.split(':').map(Number);
      const next = new Date();
      next.setHours(hours, minutes, 0);
      
      if (next < now) {
        next.setDate(next.getDate() + 1);
      }
      
      const diff = next - now;
      const minutesLeft = Math.floor(diff / 60000);
      const secondsLeft = Math.floor((diff % 60000) / 1000);
      
      timeRemaining = `${minutesLeft}m ${secondsLeft}s`;
    }
  }
  
  onMount(() => {
    // Función para conectar WebSocket
    function connectWebSocket() {
      ws = new WebSocket('ws://localhost:8081');
      ws.onopen = () => console.log('Conectado al WebSocket');
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          addNewDataPoint(data);
        } catch (error) {
          console.error('Error parseando datos del WebSocket:', error);
        }
      };
      ws.onclose = () => {
        console.log('Desconectado del WebSocket, reconectando en 5 segundos...');
        setTimeout(connectWebSocket, 5000); // Reconectar automáticamente
      };
      ws.onerror = (error) => {
        console.error('Error en WebSocket:', error);
        ws.close();
      };
    }

    connectWebSocket(); // Inicia conexión
    
    // Actualizar contador cada segundo
    const countdownInterval = setInterval(() => {
      updateTimeRemaining();
    }, 1000);
    
    return () => {
      clearInterval(countdownInterval);
    };
  });
  
  onDestroy(() => {
    if (ws) {
      ws.close();
    }
  });
  
  // Preparar datos para las gráficas
  let pressureChartData = $derived(todayData.map(d => ({ time: d.time, value: d.pressure })));
  let humidityChartData = $derived(todayData.map(d => ({ time: d.time, value: d.humidity })));
  let temperatureChartData = $derived(todayData.map(d => ({ time: d.time, value: d.temperature })));
  
  // Obtener valores actuales
  let currentPressure = $derived(todayData.length > 0 ? todayData[todayData.length - 1].pressure : 0);
  let currentHumidity = $derived(todayData.length > 0 ? todayData[todayData.length - 1].humidity : 0);
  let currentTemp = $derived(todayData.length > 0 ? todayData[todayData.length - 1].temperature : 0);
</script>

<div class="min-h-screen bg-background">
  <!-- Header -->
  <header class="border-b border-border bg-card">
    <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button 
            onclick={() => onnavigate('dashboard')}
            class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary hover:bg-primary/90 transition-colors"
            aria-label="Volver al dashboard"
          >
            <svg class="h-6 w-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 class="text-xl font-bold text-foreground">Registro en Tiempo Real</h1>
            <p class="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        
        <Button onclick={onlogout} variant="outline" class="border-border hover:bg-muted">
          {#snippet children()}
            Cerrar Sesión
          {/snippet}
        </Button>
      </div>
    </div>
  </header>
  
  <!-- Main Content -->
  <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
    <!-- Status Cards -->
    <div class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Última actualización -->
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm">Última Actualización</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-lg font-semibold">{lastUpdateTime || 'Iniciando...'}</p>
        </CardContent>
      </Card>
      
      <!-- Próxima actualización -->
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm">Próxima Actualización</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-lg font-semibold">{nextUpdateTime || 'Calculando...'}</p>
          <p class="text-xs text-muted-foreground">{timeRemaining}</p>
        </CardContent>
      </Card>
      
      <!-- Total de registros -->
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm">Registros de Hoy</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-lg font-semibold">{todayData.length}</p>
          <p class="text-xs text-muted-foreground">puntos de datos</p>
        </CardContent>
      </Card>
      
      <!-- Estado -->
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm">Estado del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex items-center gap-2">
            <div class="h-2 w-2 rounded-full bg-green-500"></div>
            <p class="text-lg font-semibold">Activo</p>
          </div>
        </CardContent>
      </Card>
    </div>
    
    <!-- Current Values -->
    <div class="mb-6 grid gap-4 sm:grid-cols-3">
      <Card class="border-l-4 border-l-blue-500">
        <CardHeader class="pb-2">
          <CardTitle class="text-sm">Presión Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-2xl font-bold">{currentPressure.toFixed(2)} <span class="text-sm text-muted-foreground">Bar</span></p>
        </CardContent>
      </Card>
      
      <Card class="border-l-4 border-l-yellow-500">
        <CardHeader class="pb-2">
          <CardTitle class="text-sm">Humedad Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-2xl font-bold">{currentHumidity.toFixed(2)} <span class="text-sm text-muted-foreground">%</span></p>
        </CardContent>
      </Card>
      
      <Card class="border-l-4 border-l-red-500">
        <CardHeader class="pb-2">
          <CardTitle class="text-sm">Temperatura Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-2xl font-bold">{currentTemp.toFixed(1)} <span class="text-sm text-muted-foreground">°C</span></p>
        </CardContent>
      </Card>
    </div>
    
    <!-- Live Charts -->
    {#if todayData.length > 0}
      <div class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Presión - Tiempo Real</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="h-[300px]">
              <LineChart data={pressureChartData} color="rgb(59, 130, 246)" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Humedad - Tiempo Real</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="h-[300px]">
              <LineChart data={humidityChartData} color="rgb(234, 179, 8)" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Temperatura - Tiempo Real</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="h-[300px]">
              <LineChart data={temperatureChartData} color="rgb(239, 68, 68)" />
            </div>
          </CardContent>
        </Card>
      </div>
    {:else}
      <Card>
        <CardContent class="py-12 text-center">
          <div class="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p class="mt-4 text-lg font-medium">Inicializando sistema de monitoreo...</p>
          <p class="text-sm text-muted-foreground">Los datos aparecerán en breve</p>
        </CardContent>
      </Card>
    {/if}
  </div>
</div>
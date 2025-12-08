<script>
  import Button from '$lib/components/ui/button.svelte';
  import MetricCard from './metric-card.svelte';
  import ChartCard from './chart-card.svelte';
  import { onMount } from 'svelte';
  
  let { user, onlogout, onnavigate } = $props();
  
  let timeRange = $state('day');
  let pressureData = $state([]);
  let humidityData = $state([]);
  let temperatureData = $state([]);
  
  let currentPressure = $state(0);
  let currentHumidity = $state(0);
  let currentTemp = $state(0);
  
  let lastUpdate = $state('');
  let isLoading = $state(true);
  
  onMount(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch('/api/data');
        const data = await response.json();
        
        if (data && Array.isArray(data) && data.length > 0) {
          const formattedData = data.map(item => ({
            time: new Date(item.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            pressure: parseFloat(item.pressure),
            humidity: parseFloat(item.humidity),
            temperature: parseFloat(item.temperature),
            timestamp: item.timestamp
          }));
          
          pressureData = formattedData.map(d => ({ time: d.time, value: d.pressure }));
          humidityData = formattedData.map(d => ({ time: d.time, value: d.humidity }));
          temperatureData = formattedData.map(d => ({ time: d.time, value: d.temperature }));
          
          const lastData = formattedData[formattedData.length - 1];
          currentPressure = lastData.pressure;
          currentHumidity = lastData.humidity;
          currentTemp = lastData.temperature;
          lastUpdate = new Date().toLocaleTimeString('es-ES');
        }
        
        isLoading = false;
      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
        isLoading = false;
      }
    }
    
    fetchDashboardData();
    const pollInterval = setInterval(fetchDashboardData, 10000);
    
    return () => {
      clearInterval(pollInterval);
    };
  });
</script>

<div class="min-h-screen bg-background">
  <header class="border-b border-border bg-card">
    <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <svg class="h-6 w-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 class="text-xl font-bold text-foreground">Sistema de Monitoreo</h1>
            <p class="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        
        <div class="flex gap-2">
          <Button onclick={() => onnavigate('live-record')} variant="outline" class="border-border hover:bg-muted">
            {#snippet children()}
              <svg class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Registro en Tiempo Real
            {/snippet}
          </Button>
          <Button onclick={onlogout} variant="outline" class="border-border hover:bg-muted">
            {#snippet children()}
              Cerrar Sesión
            {/snippet}
          </Button>
        </div>
      </div>
    </div>
  </header>
  
  <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-lg font-semibold text-foreground">Panel de Control</h2>
        {#if lastUpdate}
          <p class="text-sm text-muted-foreground">Última actualización: {lastUpdate}</p>
        {/if}
      </div>
      <div class="flex gap-2 rounded-lg bg-card border border-border p-1">
        <button
          onclick={() => timeRange = 'day'}
          class="rounded px-4 py-1.5 text-sm font-medium transition-colors {timeRange === 'day' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}"
        >
          Día
        </button>
        <button
          onclick={() => timeRange = 'week'}
          class="rounded px-4 py-1.5 text-sm font-medium transition-colors {timeRange === 'week' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}"
        >
          Semana
        </button>
        <button
          onclick={() => timeRange = 'month'}
          class="rounded px-4 py-1.5 text-sm font-medium transition-colors {timeRange === 'month' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}"
        >
          Mes
        </button>
      </div>
    </div>
    
    <div class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <MetricCard
        title="Presión"
        value={currentPressure.toFixed(2)}
        unit="hPa"
        trend={0}
        icon="pressure"
      />
      <MetricCard
        title="Humedad"
        value={currentHumidity.toFixed(1)}
        unit="%"
        trend={0}
        icon="humidity"
      />
      <MetricCard
        title="Temperatura"
        value={currentTemp.toFixed(1)}
        unit="°C"
        trend={0}
        icon="temperature"
      />
    </div>
    
    {#if isLoading && pressureData.length === 0}
      <div class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-muted-foreground">Cargando datos...</p>
        </div>
      </div>
    {/if}
    
    {#if pressureData.length > 0}
      <div class="space-y-6">
        <ChartCard
          title="Presión"
          data={pressureData}
          color="rgb(59, 130, 246)"
          unit="hPa"
          timeRange={timeRange}
        />
        <ChartCard
          title="Humedad"
          data={humidityData}
          color="rgb(34, 197, 94)"
          unit="%"
          timeRange={timeRange}
        />
        <ChartCard
          title="Temperatura"
          data={temperatureData}
          color="rgb(239, 68, 68)"
          unit="°C"
          timeRange={timeRange}
        />
      </div>
    {/if}
  </div>
</div>

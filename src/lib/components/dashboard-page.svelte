<script>
  import Button from '$lib/components/ui/button.svelte';
  import MetricCard from './metric-card.svelte';
  import ChartCard from './chart-card.svelte';
  import { generateTimeSeriesData, getLatestValue } from '$lib/utils/data-generator.js';
  
  let { user, onlogout, onnavigate } = $props();
  
  let timeRange = $state('day'); // 'day', 'week', 'month'
  
  // Generar datos para cada métrica
  let pressureData = $state(generateTimeSeriesData('pressure', timeRange));
  let phData = $state(generateTimeSeriesData('ph', timeRange));
  let temperatureData = $state(generateTimeSeriesData('temperature', timeRange));
  
  // Actualizar datos cuando cambia el rango de tiempo
  $effect(() => {
    pressureData = generateTimeSeriesData('pressure', timeRange);
    phData = generateTimeSeriesData('ph', timeRange);
    temperatureData = generateTimeSeriesData('temperature', timeRange);
  });
  
  let currentPressure = $derived(getLatestValue(pressureData));
  let currentPh = $derived(getLatestValue(phData));
  let currentTemp = $derived(getLatestValue(temperatureData));
</script>

<div class="min-h-screen bg-background">
  <!-- Header -->
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
          <!-- Agregando navegación a registro en tiempo real -->
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
  
  <!-- Main Content -->
  <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
    <!-- Time Range Selector -->
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-lg font-semibold text-foreground">Panel de Control</h2>
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
    
    <!-- Metric Cards -->
    <div class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <MetricCard
        title="Presión"
        value={currentPressure.toFixed(2)}
        unit="Bar"
        trend={2.5}
        icon="pressure"
      />
      <MetricCard
        title="pH"
        value={currentPh.toFixed(2)}
        unit=""
        trend={-0.8}
        icon="ph"
      />
      <MetricCard
        title="Temperatura"
        value={currentTemp.toFixed(1)}
        unit="°C"
        trend={1.2}
        icon="temperature"
      />
    </div>
    
    <!-- Charts -->
    <div class="space-y-6">
      <ChartCard
        title="Presión"
        data={pressureData}
        color="rgb(59, 130, 246)"
        unit="Bar"
        timeRange={timeRange}
      />
      <ChartCard
        title="pH"
        data={phData}
        color="rgb(234, 179, 8)"
        unit=""
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
  </div>
</div>
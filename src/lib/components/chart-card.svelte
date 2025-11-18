<script>
  import LineChart from './line-chart.svelte';
  
  let { title, data, color, unit, timeRange } = $props();
  
  let stats = $derived({
    min: Math.min(...data.map(d => d.value)).toFixed(2),
    max: Math.max(...data.map(d => d.value)).toFixed(2),
    avg: (data.reduce((sum, d) => sum + d.value, 0) / data.length).toFixed(2)
  });
</script>

<div class="rounded-lg border border-border bg-card p-6">
  <div class="mb-6 flex items-center justify-between">
    <div>
      <h3 class="text-lg font-semibold text-foreground">{title}</h3>
      <p class="text-sm text-muted-foreground">
        {timeRange === 'day' ? 'Últimas 24 horas' : timeRange === 'week' ? 'Últimos 7 días' : 'Últimos 30 días'}
      </p>
    </div>
    
    <div class="flex gap-6 text-sm">
      <div>
        <p class="text-muted-foreground">Mín</p>
        <p class="font-semibold text-foreground">{stats.min} {unit}</p>
      </div>
      <div>
        <p class="text-muted-foreground">Prom</p>
        <p class="font-semibold text-foreground">{stats.avg} {unit}</p>
      </div>
      <div>
        <p class="text-muted-foreground">Máx</p>
        <p class="font-semibold text-foreground">{stats.max} {unit}</p>
      </div>
    </div>
  </div>
  
  <div class="h-[300px]">
    <LineChart {data} {color} />
  </div>
</div>
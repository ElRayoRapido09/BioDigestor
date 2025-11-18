<script>
  let { title, value, unit, trend, icon } = $props();
  
  let isPositive = $derived(trend > 0);
</script>

<div class="rounded-lg border border-border bg-card p-6">
  <div class="mb-4 flex items-center justify-between">
    <h3 class="text-sm font-medium text-muted-foreground">{title}</h3>
    <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
      {#if icon === 'pressure'}
        <svg class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      {:else if icon === 'ph'}
        <svg class="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      {:else}
        <svg class="h-5 w-5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      {/if}
    </div>
  </div>
  
  <div class="mb-2 flex items-baseline gap-2">
    <span class="text-3xl font-bold text-foreground">{value}</span>
    <span class="text-lg text-muted-foreground">{unit}</span>
  </div>
  
  <div class="flex items-center gap-1 text-sm">
    {#if isPositive}
      <svg class="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
      <span class="text-green-500">+{trend}%</span>
    {:else}
      <svg class="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
      <span class="text-red-500">{trend}%</span>
    {/if}
    <span class="text-muted-foreground">vs período anterior</span>
  </div>
</div>
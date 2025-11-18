<script>
  let { data, color } = $props();
  
  let svgElement = $state(null);
  let tooltip = $state({ show: false, x: 0, y: 0, value: 0, time: '' });
  
  // Calcular dimensiones y escalas
  let width = 1000;
  let height = 300;
  let padding = { top: 20, right: 20, bottom: 40, left: 50 };
  
  let chartWidth = $derived(width - padding.left - padding.right);
  let chartHeight = $derived(height - padding.top - padding.bottom);
  
  let minValue = $derived(Math.min(...data.map(d => d.value)) * 0.95);
  let maxValue = $derived(Math.max(...data.map(d => d.value)) * 1.05);
  
  let xScale = $derived((index) => (index / (data.length - 1)) * chartWidth);
  let yScale = $derived((value) => chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight);
  
  // Crear el path de la línea
  let linePath = $derived(() => {
    if (data.length === 0) return '';
    
    let path = `M ${xScale(0)} ${yScale(data[0].value)}`;
    for (let i = 1; i < data.length; i++) {
      path += ` L ${xScale(i)} ${yScale(data[i].value)}`;
    }
    return path;
  });
  
  // Crear el path del área
  let areaPath = $derived(() => {
    if (data.length === 0) return '';
    
    let path = `M ${xScale(0)} ${chartHeight}`;
    path += ` L ${xScale(0)} ${yScale(data[0].value)}`;
    for (let i = 1; i < data.length; i++) {
      path += ` L ${xScale(i)} ${yScale(data[i].value)}`;
    }
    path += ` L ${xScale(data.length - 1)} ${chartHeight}`;
    path += ' Z';
    return path;
  });
  
  // Grid lines
  let yGridLines = $derived(() => {
    const lines = [];
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const value = minValue + (maxValue - minValue) * (i / steps);
      const y = yScale(value);
      lines.push({ y, value: value.toFixed(1) });
    }
    return lines;
  });
  
  function handleMouseMove(event) {
    if (!svgElement) return;
    
    const rect = svgElement.getBoundingClientRect();
    const x = event.clientX - rect.left - padding.left;
    
    if (x < 0 || x > chartWidth) {
      tooltip.show = false;
      return;
    }
    
    const index = Math.round((x / chartWidth) * (data.length - 1));
    const dataPoint = data[index];
    
    if (dataPoint) {
      tooltip = {
        show: true,
        x: xScale(index) + padding.left,
        y: yScale(dataPoint.value) + padding.top,
        value: dataPoint.value.toFixed(2),
        time: dataPoint.time
      };
    }
  }
  
  function handleMouseLeave() {
    tooltip.show = false;
  }
</script>

<div class="relative h-full w-full">
  <svg
    bind:this={svgElement}
    viewBox="0 0 {width} {height}"
    class="h-full w-full"
    onmousemove={handleMouseMove}
    onmouseleave={handleMouseLeave}
  >
    <g transform="translate({padding.left}, {padding.top})">
      <!-- Grid lines -->
      {#each yGridLines as line}
        <line
          x1="0"
          y1={line.y}
          x2={chartWidth}
          y2={line.y}
          stroke="rgb(var(--color-border))"
          stroke-width="1"
          stroke-dasharray="4"
        />
        <text
          x="-10"
          y={line.y}
          text-anchor="end"
          dominant-baseline="middle"
          class="fill-muted-foreground text-xs"
        >
          {line.value}
        </text>
      {/each}
      
      <!-- Area -->
      <path
        d={areaPath()}
        fill={color}
        fill-opacity="0.1"
      />
      
      <!-- Line -->
      <path
        d={linePath()}
        fill="none"
        stroke={color}
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      
      <!-- Data points -->
      {#each data as point, i}
        {#if i % Math.ceil(data.length / 20) === 0}
          <circle
            cx={xScale(i)}
            cy={yScale(point.value)}
            r="3"
            fill={color}
          />
        {/if}
      {/each}
      
      <!-- Tooltip indicator -->
      {#if tooltip.show}
        <line
          x1={tooltip.x - padding.left}
          y1="0"
          x2={tooltip.x - padding.left}
          y2={chartHeight}
          stroke={color}
          stroke-width="1"
          stroke-dasharray="4"
        />
        <circle
          cx={tooltip.x - padding.left}
          cy={tooltip.y - padding.top}
          r="5"
          fill={color}
          stroke="rgb(var(--color-background))"
          stroke-width="2"
        />
      {/if}
    </g>
  </svg>
  
  <!-- Tooltip -->
  {#if tooltip.show}
    <div
      class="pointer-events-none absolute rounded-lg border border-border bg-card px-3 py-2 shadow-lg"
      style="left: {tooltip.x + 10}px; top: {tooltip.y - 40}px;"
    >
      <p class="text-xs text-muted-foreground">{tooltip.time}</p>
      <p class="text-sm font-semibold text-foreground">{tooltip.value}</p>
    </div>
  {/if}
</div>
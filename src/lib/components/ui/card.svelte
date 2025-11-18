<script>
  let { 
    children, 
    class: className = '', 
    ...restProps 
  } = $props();
  
  let classes = $derived(`rounded-lg border border-border bg-card text-card-foreground shadow-sm ${className}`);
</script>

<div class={classes} {...restProps}>
  {@render children()}
</div>
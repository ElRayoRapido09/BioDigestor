<script>
  let { 
    children, 
    class: className = '', 
    ...restProps 
  } = $props();
  
  let classes = $derived(`text-lg font-semibold leading-none tracking-tight ${className}`);
</script>

<h3 class={classes} {...restProps}>
  {@render children()}
</h3>
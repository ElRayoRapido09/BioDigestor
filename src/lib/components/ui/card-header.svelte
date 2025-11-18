<script>
  let { 
    children, 
    class: className = '', 
    ...restProps 
  } = $props();
  
  let classes = $derived(`flex flex-col space-y-1.5 p-6 ${className}`);
</script>

<div class={classes} {...restProps}>
  {@render children()}
</div>
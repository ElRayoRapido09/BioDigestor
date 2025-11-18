<script>
  let { 
    children, 
    class: className = '', 
    ...restProps 
  } = $props();
  
  let classes = $derived(`p-6 pt-0 ${className}`);
</script>

<div class={classes} {...restProps}>
  {@render children()}
</div>
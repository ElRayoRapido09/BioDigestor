<script>
  import { buttonVariants } from './button.js';
  
  let { 
    children, 
    variant = 'default', 
    size = 'default', 
    class: className = '', 
    onclick = null,
    type = 'button',
    ...restProps 
  } = $props();
  
  let classes = $derived(buttonVariants({ variant, size, className }));
</script>

<button 
  {type}
  {onclick}
  class={classes}
  {...restProps}
>
  {#if children}
    {@render children()}
  {/if}
</button>
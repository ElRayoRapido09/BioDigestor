<script>
  import Button from '$lib/components/ui/button.svelte';
  
  let { onlogin } = $props();
  
  let email = $state('');
  let password = $state('');
  let error = $state('');
  
  function handleSubmit(e) {
    e.preventDefault();
    error = '';
    
    // Validación simple
    if (!email || !password) {
      error = 'Por favor completa todos los campos';
      return;
    }
    
    if (password.length < 6) {
      error = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }
    
    // Simular inicio de sesión exitoso
    onlogin({ email });
  }
</script>

<div class="flex min-h-screen items-center justify-center p-4">
  <div class="w-full max-w-md">
    <div class="bg-card border border-border rounded-lg p-8 shadow-2xl">
      <div class="mb-8 text-center">
        <div class="mb-2 flex justify-center">
          <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <svg class="h-7 w-7 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        <h1 class="text-2xl font-bold text-foreground">Sistema de Monitoreo</h1>
        <p class="mt-2 text-sm text-muted-foreground">Ingresa tus credenciales para continuar</p>
      </div>
      
      <form onsubmit={handleSubmit} class="space-y-5">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-200 mb-2">
            Correo electrónico
          </label>
          <input
            type="email"
            id="email"
            bind:value={email}
            class="w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="usuario@ejemplo.com"
          />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-200 mb-2">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            bind:value={password}
            class="w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="••••••••"
          />
        </div>
        
        {#if error}
          <div class="rounded-md bg-destructive/10 border border-destructive/20 p-3">
            <p class="text-sm text-destructive">{error}</p>
          </div>
        {/if}
        
        <Button type="submit" class="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200">
          {#snippet children()}
            Iniciar Sesión
          {/snippet}
        </Button>
      </form>
      
      <div class="mt-6 text-center">
        <p class="text-xs text-muted-foreground">
          Usa cualquier correo y contraseña de más de 6 caracteres
        </p>
      </div>
    </div>
  </div>
</div>
<script>
  import '../app.css';
  import LoginPage from '$lib/components/login-page.svelte';
  import DashboardPage from '$lib/components/dashboard-page.svelte';
  import LiveRecordPage from '$lib/components/live-record-page.svelte';
  
  let isAuthenticated = $state(false);
  let user = $state(null);
  let currentPage = $state('dashboard'); // 'dashboard' | 'live-record'
  
  function handleLogin(userData) {
    isAuthenticated = true;
    user = userData;
  }
  
  function handleLogout() {
    isAuthenticated = false;
    user = null;
    currentPage = 'dashboard';
  }
  
  function navigateTo(page) {
    currentPage = page;
  }
</script>

<main class="min-h-screen bg-background">
  {#if !isAuthenticated}
    <LoginPage onlogin={handleLogin} />
  {:else}
    {#if currentPage === 'dashboard'}
      <DashboardPage {user} onlogout={handleLogout} onnavigate={navigateTo} />
    {:else if currentPage === 'live-record'}
      <LiveRecordPage {user} onlogout={handleLogout} onnavigate={navigateTo} />
    {/if}
  {/if}
</main>

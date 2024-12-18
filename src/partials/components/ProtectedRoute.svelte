<script>
  import { Route } from 'svelte-routing';
  import { navigate } from 'svelte-routing';
  import { isAuthenticated, checkAuthStatus } from '../../routes/routes';
  import { onMount } from 'svelte';

  export let path;
  export let component;

  let isChecking = true;

  onMount(async () => {
    if (path !== '/' && path !== '/login') {
      isChecking = true;
      const isValid = await checkAuthStatus();
      if (!isValid) {
        const returnUrl = encodeURIComponent(window.location.pathname);
        navigate(`/login?returnUrl=${returnUrl}`, { replace: true });
      }
      isChecking = false;
    }
  });

  // Also check when path changes
  $: {
    if (path !== '/' && path !== '/login' && !$isAuthenticated) {
      checkAuthStatus();
    }
  }
</script>

{#if isChecking}
  <!-- Optional: Add a loading indicator here -->
{:else}
  <Route {path} {component} />
{/if}

<!-- src/routes/ProtectedPage.svelte -->
<script>
  import { onMount } from 'svelte';
  import { isAuthenticated } from './routes';

  let token;

  onMount(() => {
    if (!$isAuthenticated) {
      window.location.href = '/login';
    }
  });
</script>

<h1>Protected Content</h1>
<p>This content is only visible to authenticated users.</p>

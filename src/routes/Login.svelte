  
 <!-- src/routes/Login.svelte -->
 <script>
   import { navigate } from 'svelte-routing';
   import { login, isAuthenticated } from './routes';   
   import Home from './Home.svelte';
   import { onMount } from 'svelte';
   import {config } from '../../app.config';

   let username = '';
   let password = '';
   let isLdapUser = false; 
   let rememberMe = false;
   let returnUrl = '/';

   async function validateReturnUrl(url) {
     try {
       // Basic client-side sanitization
       if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
         return '/';
       }

       // Server-side validation
       const response = await fetch(
         `${config.baseURL}/auth/validate-route?returnUrl=${encodeURIComponent(url)}`,
         { method: 'GET' }
       );

       if (response.ok) {
         const { safeUrl } = await response.json();
         return safeUrl;
       }

       return '/';
     } catch (e) {
       console.error('Route validation failed:', e);
       return '/';
     }
   }

   async function loginUser() {
    const loginurl = isLdapUser ?
      `${config.baseURL}/auth/login/ldap` :
      `${config.baseURL}/auth/login/local`

    try {
      const response = await fetch(loginurl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
  
      const data = await response.json();
      if (response.ok) {
        login(data.access_token, data.refresh_token, rememberMe);
        navigate(returnUrl);
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Login failed. Please try again.');
    }
  }

  // Function to handle Enter key press
  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      loginUser();
    }
  }

  onMount(async () => {
     const params = new URLSearchParams(window.location.search);
     const returnParam = params.get('returnUrl');
     if (returnParam) {
       returnUrl = await validateReturnUrl(returnParam);
     }
   });

 </script>

<div class="bg-gray-100  flex flex-col items-center justify-center h-full">
  {#if !$isAuthenticated}
    <Home/>
    <div class="bg-white p-8 rounded-lg shadow-md w-96">
      <h2 class="text-2xl font-semibold text-center text-gray-800 mb-6">Login</h2>
      <div class="space-y-4">

        <div class="flex items-center">
          <input
            type="checkbox"
            id="ldapCheckbox"
            bind:checked={isLdapUser}
            class="mr-2"
          />
          <label for="ldapCheckbox" class="text-gray-700">LDAP user</label>
        </div>



        <input
          class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Username"
          bind:value={username}
          on:keypress={handleKeyPress}
        />
        <input
          class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="password"
          placeholder="Password"
          bind:value={password}
          on:keypress={handleKeyPress}
        />
        <div class="flex items-center">
          <input
            type="checkbox"
            id="rememberMeCheckbox"
            bind:checked={rememberMe}
            class="mr-2"
          />
          <label for="rememberMeCheckbox" class="text-gray-700">Remember Me</label>
        </div>
        <button
          class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300"
          on:click={loginUser}
        >
          Login
        </button>
      </div>
    </div>
  {/if}

  {#if $isAuthenticated}
    <Home/>
  {/if}
</div>

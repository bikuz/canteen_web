 
 <!--
 <script>
   import { onMount } from 'svelte';
   import { login } from '../services/auth';
   import { isAuthenticated } from '../routes';

   let username = '';
   let password = '';

   async function handleLogin() {
     try {
       await login(username, password);
       isAuthenticated.set(true);
       window.location.href = '/';
     } catch (err) {
       alert('Login failed');
     }
   }
 </script>

 <form on:submit|preventDefault={handleLogin}>
   <input type="text" bind:value={username} placeholder="Username" required />
   <input type="password" bind:value={password} placeholder="Password" required />
   <button type="submit">Login</button>
 </form>
 -->

 <!-- src/routes/Login.svelte -->
 <script>
   import { navigate } from 'svelte-routing';
   import { login,isAuthenticated } from './routes';   
   import Home from './Home.svelte';

   let username = '';
   let password = '';
   let isLdapUser = false; // New variable for checkbox state 

   async function loginUser() {
    const loginurl = isLdapUser 
      ? 'http://localhost:3000/auth/login/ldap' 
      : 'http://localhost:3000/auth/login/local'; // Toggle between urls
  
    var response = await fetch(loginurl, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ username, password }),
     });

     var data = await response.json();
     if (response.ok) {
       login(data.access_token);       
       navigate('/protected');
     } else {
       alert(data.message);
     }
   }

   // Function to handle Enter key press
  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      loginUser();
    }
  }
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

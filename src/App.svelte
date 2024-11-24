<!-- 
<script>
  import OrderList from './OrderList.svelte';
  import OrderForm from './OrderForm.svelte';
</script>

<main>
  <h1>Canteen Order Management</h1>
  <OrderForm />
  <OrderList />
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style> -->

<!-- src/App.svelte -->
<script>
  // import OrderForm from './OrderForm.svelte';
  import { Router, Link, Route, navigate } from 'svelte-routing';
  // import Home from './routes/Home.svelte';
  import Login from './routes/Login.svelte';
  import Protected from './routes/Protected.svelte';
  import Home from './routes/Home.svelte';
  // import Categories from './routes/Categories.svelte';
  import Category from './routes/Category.svelte';
  import ItemManagement from './routes/Items.svelte';
  import DashboardAdmin from './routes/Dashboard_admin.svelte';
  import { isAuthenticated, logout as logoutAction} from './routes/routes.js';
  import { Icon, ArrowUp, Bars3 } from "svelte-hero-icons";

  $: token = $isAuthenticated;
  let isSidebarOpen  = false;
  

  // Function to handle logout and redirect
  const logout = () => {
    logoutAction(); // Call the actual logout action
    navigate('/');  // Redirect to home page
  };

  function toggleSidebar() {
    // isSidebarOpen  = !isSidebarOpen ;
    document.getElementById('sidebar').classList.toggle('hidden');
  }

  // Function to close sidebar
  function closeSidebar() {
      // isSidebarOpen = false;
      const sidebar = document.getElementById('sidebar');
      if (!sidebar.classList.contains('hidden')){
        sidebar.classList.add('hidden');
      }
   }

   // Close sidebar when clicking outside
   function handleClickOutside(event) {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar.contains(event.target)) {
         closeSidebar();
      }
   }

   // Adding event listener to document for clicks
  //  document.addEventListener('click', handleClickOutside);

   // Clean up event listener on component destroy
  //  import { onDestroy } from 'svelte';
  //  onDestroy(() => document.removeEventListener('click', handleClickOutside));

</script>


<Router>
  <div class="flex h-screen w-screen bg-gray-100 overflow-hidden">
    <!-- Sidebar -->
    <aside class="w-64 bg-gray-800 text-white flex-shrink-0 h-full overflow-auto hidden lg:flex flex-col">
      <div class="p-4 text-2xl font-bold">
        App Logoss
      </div>
      <nav class="p-4 space-y-2">
        <Link to="/" class="block p-2 rounded hover:bg-gray-700">Home</Link>
        
        {#if $isAuthenticated}
          <Link to="/protected" class="block p-2 rounded hover:bg-gray-700  text-white " >Protected</Link>
          <Link to="/dbAdmin" class="block p-2 rounded hover:bg-gray-700" on:click={closeSidebar}>Dashboard Admin</Link>
          <Link to="/catMgmt" class="block p-2 rounded hover:bg-gray-700" on:click={closeSidebar}>Category Management</Link>
          
            <Link to="/itemMgmt" class="block p-2 rounded hover:bg-gray-700" on:click={closeSidebar}>Item Management</Link>
            
          <button on:click={logout} class="block w-full text-left p-2 rounded hover:bg-gray-700">
            Logout
          </button>
        {:else}
          <Link to="/login" class="block p-2 rounded hover:bg-gray-700">Login</Link>
        {/if}
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="flex flex-col flex-grow h-full overflow-hidden">
      <!-- Header -->
      <header class="bg-gray-900 text-white p-4 shadow flex">
        
        <!-- Mobile menu button -->
        <button class="lg:hidden text-white p-1" on:click={toggleSidebar}>
          <Icon src={Bars3} size="18" />
       </button>  
       <h1 class="text-lg ml-2">App Title</h1>    
      </header>

      
      <!-- Mobile Sidebar -->
      <aside id="sidebar" class="lg:hidden fixed inset-0 bg-gray-800 text-white flex flex-col z-50 transform translate-x-full transition-transform duration-300" style="width: 250px;">
        <div class="p-4 text-2xl font-bold">App Logo</div>
        <nav class="p-4 space-y-2">
           <Link to="/" class="block p-2 rounded hover:bg-gray-700" on:click={closeSidebar}>Home</Link>
           {#if $isAuthenticated}
              <Link to="/protected" class="block p-2 rounded hover:bg-gray-700" on:click={closeSidebar}>Protected</Link>
              <Link to="/dbAdmin" class="block p-2 rounded hover:bg-gray-700" on:click={closeSidebar}>Dashboard Admin</Link>
              <Link to="/catMgmt" class="block p-2 rounded hover:bg-gray-700" on:click={closeSidebar}>Category Management</Link>
            <Link to="/itemMgmt" class="block p-2 rounded hover:bg-gray-700" on:click={closeSidebar}>Item Management</Link>
            
              <button on:click={logout} class="block w-full text-left p-2 rounded hover:bg-gray-700">Logout</button>
           {:else}
              <Link to="/login" class="block p-2 rounded hover:bg-gray-700">Login</Link>
           {/if}
        </nav>
     </aside>

      <!-- Main Area -->
      <main class="flex-grow p-3 overflow-hidden">
        <Route path="/" component={Login} />
        <Route path="/login" component={Login} />
        <Route path="/protected" component={Protected} />
        <!-- <Route path="/" component={Home} /> -->
        <Route path="/catMgmt" component={Category} />
        <Route path="/itemMgmt" component={ItemManagement} />
        <Route path="/dbAdmin" component={DashboardAdmin} />
        <!-- <Route path="/home" component={Home}/> -->
      </main>
    </div>
  </div>
</Router>

<style>
    
  
</style>

<!-- https://github.com/cruip/tailwind-dashboard-template/tree/main -->
<!-- https://github.com/salvia-kit/svelte-dashboards?tab=readme-ov-file -->
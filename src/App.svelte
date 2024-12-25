<script>

  import { Router, Link, Route, navigate } from 'svelte-routing';
  // import Home from './routes/Home.svelte';
  import Login from './routes/Login.svelte';
  import Protected from './routes/Protected.svelte';
   
  import Home from './routes/Home.svelte';
  // import Categories from './routes/Categories.svelte';
  import Category from './routes/Category.svelte';
  import FoodItems from './routes/FoodItems.svelte';
  import Menu from './routes/Menu.svelte';
  import Order from './routes/Order.svelte';
  import DashboardAdmin from './routes/Dashboard_admin.svelte';
  import OrderDashboard from './routes/OrderDashboard.svelte';
  import MenuClient from './routes/client/Menu.svelte';
  import Cart from './routes/client/Cart.svelte';
  import OrderHistory from './routes/client/OrderHistory.svelte';
  import OrderDetail from './routes/client/OrderDetail.svelte';
  import PaymentDashboard from './routes/PaymentDashboard.svelte';
  import MakePayment from './routes/MakePayment.svelte';
  import MakeOrder from './routes/MakeOrder.svelte';
  import MenuDisplay from './routes/MenuDisplay.svelte';
  import MenuDisplay2 from './routes/MenuDisplay2.svelte';

  import { isAuthenticated, logout as logoutAction} from './routes/routes.js';
  import { Icon, ArrowUp, Bars3 } from "svelte-hero-icons";
  import { cart } from './stores/cartStore';
  import { onMount, beforeUpdate } from 'svelte';
  import { getAccessToken, resetInactivityTimer } from './services/auth';
  import ProtectedRoute from './partials/components/ProtectedRoute.svelte';



  // $: token = $isAuthenticated;
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

  // Calculate total items in cart
  $: cartItemCount = $cart.reduce((sum, item) => sum + item.quantity, 0);



  // List of events to monitor for user activity
  // const activityEvents = [
  //   'mousedown',
  //   'mousemove',
  //   'keypress',
  //   'scroll',
  //   'touchstart'
  // ];

  // Add a function to check authentication
  function checkAuth(path) {
    // List of public routes that don't require authentication
    const publicRoutes = ['/', '/login'];
    
    // If it's not a public route and user is not authenticated, redirect to login
    if (!publicRoutes.includes(path) && !getAccessToken()) {
      const returnUrl = encodeURIComponent(path);
      navigate(`/login?returnUrl=${returnUrl}`);
    }
  }

  // Add route protection
  beforeUpdate(() => {
    // Get current path
    const path = window.location.pathname;
    checkAuth(path);
  });

  onMount(() => {
    // Initial auth check
    const path = window.location.pathname;
    checkAuth(path);

    // Listen for session expiration
    const handleSessionExpired = () => {
      isAuthenticated.set(false);
      const currentPath = window.location.pathname;
      const returnUrl = encodeURIComponent(currentPath);
      navigate(`/login?returnUrl=${returnUrl}`);
      alert('Your session has expired. Please log in again.');
    };

    window.addEventListener('session-expired', handleSessionExpired);

    // Cleanup on component destroy
    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  });

  // window.addEventListener('session-warning', () => {
  //   const stay = confirm('Your session will expire in 1 minute. Do you want to stay logged in?');
  //   if (stay) {
  //     resetInactivityTimer();
  //   }
  // });

</script>


<Router>
  {#if window.location.pathname === '/display'}
      <Route path="/display" component={MenuDisplay} />
  {:else if window.location.pathname === '/display2'}
      <Route path="/display2" component={MenuDisplay2} />
  {:else}
      <div class="flex h-screen w-screen bg-gray-100 overflow-hidden">
          <!-- Sidebar -->
          <aside class="w-64 bg-gray-800 text-white flex-shrink-0 h-full overflow-auto hidden lg:flex flex-col">
              <div class="p-4 text-2xl font-bold">
                  App Logoss
              </div>
              <nav class="p-4 space-y-2">
                  <Link to="/" class="block p-2 rounded hover:bg-gray-700">Home</Link>
                  
                  {#if $isAuthenticated}
                      <Link to="/dbAdmin" class="block p-2 rounded hover:bg-gray-700" on:click={closeSidebar}>Dashboard Admin</Link>
                      <Link to="/catMgmt" class="block p-2 rounded hover:bg-gray-700" on:click={closeSidebar}>Category Management</Link>
                      <Link to="/fooditemMgmt" class="block p-2 rounded hover:bg-gray-700" on:click={closeSidebar}>FoodItem Management</Link>
                      <Link to="/menuMgmt" class="block p-2 rounded hover:bg-gray-700" on:click={closeSidebar}>Menu Management</Link>
                      <Link to="/orderMgmt" class="block p-2 rounded hover:bg-gray-700" on:click={closeSidebar}>Order Management</Link>
                      <Link to="/payMgmt" class="block p-2 rounded hover:bg-gray-700" on:click={closeSidebar}>Payment Management</Link>
                      <Link to="/make-order" class="block p-2 rounded hover:bg-gray-700" on:click={closeSidebar}>Make Order</Link>
                      <Link to="/make-payment" class="block p-2 rounded hover:bg-gray-700" on:click={closeSidebar}>Make Payment</Link>
                      
                      <Link to="/client/menu" class="block p-2 rounded hover:bg-gray-700" on:click={closeSidebar}>Menu</Link>
                      <Link to="/client/orderHistory" class="block p-2 rounded hover:bg-gray-700" on:click={closeSidebar}>Order History</Link>
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
              <header class="bg-gray-900 text-white p-4 shadow flex justify-between items-center">
                  
                  <!-- Mobile menu button -->
                  <button class="lg:hidden text-white p-1" on:click={toggleSidebar}>
                      <Icon src={Bars3} size="18" />
                   </button>  
                   <h1 class="text-lg ml-2 uppercase ">Canteen Food Ordering System</h1>    
                   
                   <!-- Cart indicator -->
                   {#if $isAuthenticated}
                       <div class="relative">
                           <Link to="/cart" class="flex items-center">
                               <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                               </svg>
                               {#if cartItemCount > 0}
                                   <span class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                       {cartItemCount}
                                   </span>
                               {/if}
                           </Link>
                       </div>
                   {/if}
              </header>

              
              <!-- Mobile Sidebar -->
              <aside id="sidebar" class="lg:hidden fixed inset-0 bg-gray-800 text-white flex flex-col z-50 transform translate-x-full transition-transform duration-300" style="width: 250px;">
                  <div class="p-4 text-2xl font-bold">App Logo</div>
                  <nav class="p-4 space-y-2">
                      <Link to="/" class="block p-2 rounded hover:bg-gray-700" on:click={closeSidebar}>Home</Link>
                      {#if $isAuthenticated}
                          <Link to="/dbAdmin" class="block p-2 rounded hover:bg-gray-700" on:click={closeSidebar}>Dashboard Admin</Link>
                          <Link to="/catMgmt" class="block p-2 rounded hover:bg-gray-700" on:click={closeSidebar}>Category Management</Link>
                          <Link to="/fooditemMgmt" class="block p-2 rounded hover:bg-gray-700" on:click={closeSidebar}>FoodItem Management</Link>
                          <Link to="/menuMgmt" class="block p-2 rounded hover:bg-gray-700" on:click={closeSidebar}>Menu Management</Link>
                          <Link to="/orderMgmt" class="block p-2 rounded hover:bg-gray-700" on:click={closeSidebar}>Order Management</Link>
                          <Link to="/payMgmt" class="block p-2 rounded hover:bg-gray-700" on:click={closeSidebar}>Payment Management</Link>
                          <Link to="/make-order" class="block p-2 rounded hover:bg-gray-700" on:click={closeSidebar}>Make Order</Link>
                          <Link to="/make-payment" class="block p-2 rounded hover:bg-gray-700" on:click={closeSidebar}>Make Payment</Link>  

                          <Link to="/client/menu" class="block p-2 rounded hover:bg-gray-700" on:click={closeSidebar}>Menu</Link>
                          <Link to="/client/orderHistory" class="block p-2 rounded hover:bg-gray-700" on:click={closeSidebar}>Order History</Link>
                          
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
                  <ProtectedRoute path="/catMgmt" component={Category} />
                  <ProtectedRoute path="/fooditemMgmt" component={FoodItems} />
                  <ProtectedRoute path='/menuMgmt' component={Menu}/>
                  <ProtectedRoute path='/orderMgmt' component={OrderDashboard}/>
                  <ProtectedRoute path="/dbAdmin" component={DashboardAdmin} />
                  <ProtectedRoute path="/cart" component={Cart} />
                  <ProtectedRoute path='/client/menu' component={MenuClient}/>
                  <ProtectedRoute path="/client/orderHistory" component={OrderHistory} />
                  <ProtectedRoute path="/client/orderDetail/:orderId" component={OrderDetail} />
                  <ProtectedRoute path="/payMgmt" component={PaymentDashboard} />
                  <ProtectedRoute path="/make-payment" component={MakePayment} />
                  <ProtectedRoute path="/make-order" component={MakeOrder} />
                  <Route path="/menuDisplay" component={MenuDisplay} />
                  <Route path="/menuDisplay2" component={MenuDisplay2} />


                  <!-- <Route path="/" component={() => import('./routes/Login.svelte')} />
                    <Route path="/login" component={() => import('./routes/Login.svelte')} />
                    <Route path="/protected" component={() => import('./routes/Protected.svelte')} />
                    <Route path="/catMgmt" component={() => import('./routes/Category.svelte')} />
                    <Route path="/fooditemMgmt" component={() => import('./routes/FoodItems.svelte')} />
                    <Route path='/menuMgmt' component={() => import('./routes/Menu.svelte')} />
                    <Route path="/dbAdmin" component={() => import('./routes/Dashboard_admin.svelte')} /> -->
              </main>
          </div>
      </div>
  {/if}
</Router>

<style>
    
  
</style>

<!-- https://github.com/cruip/tailwind-dashboard-template/tree/main -->
<!-- https://github.com/salvia-kit/svelte-dashboards?tab=readme-ov-file -->
<script>

  import { Router, Link, Route, navigate } from 'svelte-routing';
  // import Home from './routes/Home.svelte';
  import Login from './routes/Login.svelte';
  import Protected from './routes/Protected.svelte';
   
  import Home from './routes/Home.svelte';
  // import Categories from './routes/Categories.svelte';
  import Category from './routes/Category.svelte';
  import FoodItems from './routes/FoodItems.svelte';
  import MenuMgmt from './routes/MenuMgmt.svelte';
  import Order from './routes/Order.svelte';
  // import DashboardAdmin from './routes/Dashboard_admin.svelte';
  import MainDashboard from './routes/MainDashboard.svelte';
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
  import RoleManagement from './routes/RoleManagement.svelte';
  import UserManagement from './routes/UserManagement.svelte';
  import DeleteAccount from './routes/DeleteAccount.svelte';
  import Support from './routes/support.svelte';

  import { isAuthenticated, logout as logoutAction} from './routes/routes.js';
  import { Icon, ArrowUp, Bars3, HomeModern , UserGroup, UserCircle, 
    Square3Stack3d, ClipboardDocumentList, Squares2x2, ShoppingCart, 
    CreditCard, ClipboardDocument, ListBullet, Clock, ArrowRightOnRectangle,
     ArrowLeftOnRectangle, QuestionMarkCircle } from "svelte-hero-icons";
  import { cart } from './stores/cartStore';
  import { onMount, beforeUpdate } from 'svelte';
  import { getAccessToken, resetInactivityTimer } from './services/auth';
  import ProtectedRoute from './partials/components/ProtectedRoute.svelte';
  import { userPermissions, userRoles } from './stores/permissionStore';
  import { getItems } from './services/apiHandler';
  import { user } from './stores/userStore.js';
  import { clickOutside } from './directives/clickOutside.js';
  


  // $: token = $isAuthenticated;
  let isSidebarOpen  = false;
  let showProfileMenu = false;

  // Function to handle logout and redirect
  const logout = () => {
    logoutAction();
    userPermissions.set([]); // Clear permissions on logout
    userRoles.set([]);
    navigate('/');
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

  // Make hasPermission reactive
  $: userHasPermission = (permission) => {
    // Check if userPermissions is loaded and not null/undefined
    if (!$userPermissions) return false;
    
    return $userPermissions.includes('*.*') || $userPermissions.includes(permission);
  }

  $: userHasRole = (role) => {
    // Check if userRoles is loaded and not null/undefined
    if (!$userRoles) return false;
    
    return $userRoles.includes(role);
  }
  // Modify your existing checkAuth function
  async function checkAuth(path) {
    const publicRoutes = ['/', '/login', '/display', '/display2', '/support'];
    
    if (!publicRoutes.includes(path) && !getAccessToken()) {
      const returnUrl = encodeURIComponent(path);
      navigate(`/login?returnUrl=${returnUrl}`);
    } else if (getAccessToken() && $userPermissions.length === 0) {
      // Fetch permissions if authenticated and permissions not loaded
      try {
        await getItems({
          endPoint: 'users/permissions',
          onSuccess: async (response) => {
            userPermissions.set(response);

            await getItems({
              endPoint: 'users/roles',
              onSuccess: (response) => {
                userRoles.set(response);
                // After roles are loaded, redirect customer to menu page if they're on the home page
                if (path === '/' && response.includes('customer')) {
                  navigate('/client/menu');
                }
              }
            });
          }
        });
      } catch (error) {
        console.error('Failed to fetch permissions:', error);
      }
    }
  }

  
  // Add route protection
  beforeUpdate(() => {
    // Get current path
    const path = window.location.pathname;
    checkAuth(path);
  });

  onMount(async () => {
    // Initial auth check
    const path = window.location.pathname;
    await checkAuth(path);

    // Fetch user profile if authenticated
    if ($isAuthenticated) {
      try {
        await getItems({
          endPoint: 'users/profile',
          onSuccess: (response) => {
            user.set(response);
          }
        });
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    }

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

  // Function to get initials
  function getInitials(firstName, lastName) {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  }

  // Function to handle profile menu
  function toggleProfileMenu() {
    showProfileMenu = !showProfileMenu;
  }

  // Function to close profile menu
  function closeProfileMenu() {
    showProfileMenu = false;
  }

</script>


<Router>
  {#if window.location.pathname === '/display'}
      <Route path="/display" component={MenuDisplay} />
  {:else if window.location.pathname === '/display2'}
      <Route path="/display2" component={MenuDisplay2} />
  {:else if window.location.pathname === '/support'}
      <Route path="/support" component={Support} />
  {:else}
      <div class="flex h-screen w-screen bg-gray-100 overflow-hidden">
          <!-- Sidebar -->
          <aside class="w-64 bg-white text-gray-800 flex-shrink-0 h-full hidden lg:flex flex-col shadow-lg">
              <div class="p-4 text-2xl font-bold">
                <img 
                src="/images/icimod_logo.png" 
                alt="Regional Data Explorer" 
                class="w-32 h-full object-cover"
                />
              </div>
              <nav class="p-4 space-y-2 max-h-calc(100vh-10em) overflow-y-auto">
                  {#if !userHasRole('customer')}
                      <Link to="/" class="p-2 rounded hover:bg-blue-200 flex items-center gap-2">
                          <Icon src={HomeModern} size="20" />
                          <span>Home</span>
                      </Link>
                  {/if}
                  {#if $isAuthenticated}
                      <Link to="/suppport" class="p-2 rounded hover:bg-blue-200 flex items-center gap-2" on:click={closeSidebar}>
                          <Icon src={QuestionMarkCircle} size="20" />
                          <span>Support</span>
                      </Link>
                  {/if}
                  
                  {#if $isAuthenticated}
                      {#if userHasPermission('User.findAll')}
                          <Link to="/userMgmt" class="p-2 rounded hover:bg-blue-200 flex items-center gap-2" on:click={closeSidebar}>
                              <Icon src={UserGroup} size="20" />
                              <span>User Management</span>
                          </Link>
                      {/if}

                      {#if userHasPermission('Role.findAll')}
                          <Link to="/roleMgmt" class="p-2 rounded hover:bg-blue-200 flex items-center gap-2" on:click={closeSidebar}>
                              <Icon src={UserCircle} size="20" />
                              <span>Role Management</span>
                          </Link>
                      {/if}

                      {#if userHasPermission('Categories.findAll')}
                          <Link to="/catMgmt" class="p-2 rounded hover:bg-blue-200 flex items-center gap-2" on:click={closeSidebar}>
                              <Icon src={Square3Stack3d} size="20" />
                              <span>Category Management</span>
                          </Link>
                      {/if}

                      {#if userHasPermission('Fooditems.findAll')}
                          <Link to="/fooditemMgmt" class="p-2 rounded hover:bg-blue-200 flex items-center gap-2" on:click={closeSidebar}>
                              <Icon src={ClipboardDocumentList} size="20" />
                              <span>FoodItem Management</span>
                          </Link>
                      {/if}

                      {#if userHasPermission('Menus.findAll')}
                          <Link to="/menuMgmt" class="p-2 rounded hover:bg-blue-200 flex items-center gap-2" on:click={closeSidebar}>
                              <Icon src={Squares2x2} size="20" />
                              <span>Menu Management</span>
                          </Link>
                      {/if}

                      {#if userHasPermission('Orders.findAll')}
                          <Link to="/orderMgmt" class="p-2 rounded hover:bg-blue-200 flex items-center gap-2" on:click={closeSidebar}>
                              <Icon src={ClipboardDocument} size="20" />
                              <span>Order Management</span>
                          </Link>
                      {/if}

                      {#if userHasPermission('Payments.findAll')}
                          <Link to="/payMgmt" class="p-2 rounded hover:bg-blue-200 flex items-center gap-2" on:click={closeSidebar}>
                              <Icon src={CreditCard} size="20" />
                              <span>Payment Management</span>
                          </Link>
                      {/if}

                      {#if userHasPermission('Orders.searchOrderForPayment')}
                            <Link to="/make-order" class="p-2 rounded hover:bg-blue-200 flex items-center gap-2" on:click={closeSidebar}>
                            <Icon src={ListBullet} size="20" />
                            Make Order</Link>
                        {/if}

                        {#if userHasPermission('Payments.create')}
                        <Link to="/make-payment" class="p-2 rounded hover:bg-blue-200 flex items-center gap-2" on:click={closeSidebar}>
                            <Icon src={CreditCard} size="20" />
                            Make Payment</Link>  
                        {/if}

                      <!-- Client menus that don't need specific permissions -->
                      {#if userHasPermission('Menus.fooditemsToday')}
                      <Link to="/client/menu" class="p-2 rounded hover:bg-blue-200 flex items-center gap-2" on:click={closeSidebar}>
                          <Icon src={Squares2x2} size="20" />
                          <span>Menu</span>
                          </Link>
                      {/if}

                      {#if userHasPermission('Orders.findOrderHistoryByUser')}
                          <Link to="/client/orderHistory" class="p-2 rounded hover:bg-blue-200 flex items-center gap-2" on:click={closeSidebar}>
                              <Icon src={Clock} size="20" />
                              <span>Order History</span>
                          </Link>
                      {/if}

                      <button on:click={logout} class="w-full text-left p-2 rounded hover:bg-blue-200 flex items-center gap-2">
                          <Icon src={ArrowRightOnRectangle} size="20" />
                          <span>Logout</span>
                      </button>
                  {:else}
                      <Link to="/login" class="p-2 rounded hover:bg-blue-200 flex items-center gap-2">
                          <Icon src={ArrowLeftOnRectangle} size="20" />
                          <span>Login</span>
                      </Link>
                  {/if}
              </nav>
          </aside>

          <!-- Main Content -->
          <div class="flex flex-col flex-grow h-full overflow-hidden">
              <!-- Header -->
              <header class="bg-white text-gray-800 p-4 flex justify-between items-center shadow-lg">
                  
                  <!-- Mobile menu button -->
                  <button class="lg:hidden text-gray-800 p-1" on:click={toggleSidebar}>
                      <Icon src={Bars3} size="18" />
                   </button>  
                   <h1 class="text-lg text-gray-800 ml-2 uppercase font-bold">Canteen Food Ordering System</h1>    
                   
                   <!-- Cart and Profile section -->
                   <div class="flex items-center gap-4">
                       {#if $isAuthenticated}
                           <!-- Cart Icon -->
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

                           <!-- Profile Button -->
                           <div class="relative">
                               <!-- svelte-ignore a11y-click-events-have-key-events -->
                               <button 
                                   class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium"
                                   on:click={toggleProfileMenu}
                               >
                                   {getInitials($user?.firstName, $user?.lastName)}
                               </button>

                               <!-- Profile Dropdown Menu -->
                               {#if showProfileMenu}
                                   <div 
                                       class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg p-3 z-50"
                                       use:clickOutside
                                       on:click_outside={closeProfileMenu}
                                   >
                                       <!-- User Info -->
                                       <div class="px-0 py-2 border-b">
                                           <p class="text-sm font-medium text-gray-900">{$user?.firstName} {$user?.lastName}</p>
                                           <p class="text-sm text-gray-500">{$user?.email}</p>
                                       </div>

                                       <!-- Menu Items -->
                                       <!-- <Link 
                                           to="/profile" 
                                           class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                           on:click={closeProfileMenu}
                                       >
                                           Profile Settings
                                       </Link> -->
                                       
                                       <button 
                                           on:click={() => {
                                               logout();
                                               closeProfileMenu();
                                           }} 
                                           class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                       >
                                           Logout
                                       </button>
                                   </div>
                               {/if}
                           </div>
                       {/if}
                   </div>
              </header>

              
              <!-- Mobile Sidebar -->
              <aside id="sidebar" class="lg:hidden fixed inset-0 bg-white text-gray-800 
              flex flex-col z-50 transform translate-x-full transition-transform 
              duration-300" style="width: 250px;">
                  <div class="p-4 text-2xl font-bold">
                    <img 
                        src="/images/icimod_logo.png" 
                        alt="Regional Data Explorer" 
                        class="w-32 h-full object-cover"
                        />
                  </div>
                  <nav class="p-4 space-y-2">
                      {#if !userHasRole('customer')}
                          <Link to="/" class="p-2 rounded hover:bg-blue-200 flex items-center gap-2" on:click={closeSidebar}>
                              <Icon src={HomeModern} size="20" />
                              Home</Link>
                      {/if}
                      {#if $isAuthenticated}
                          <Link to="/suppport" class="p-2 rounded hover:bg-blue-200 flex items-center gap-2" on:click={closeSidebar}>
                              <Icon src={QuestionMarkCircle} size="20" />
                              Support</Link>
                      {/if}
                      {#if $isAuthenticated}
                          {#if userHasPermission('User.findAll')}
                              <Link to="/userMgmt" class="p-2 rounded hover:bg-blue-200 flex items-center gap-2" on:click={closeSidebar}>
                                  <Icon src={UserGroup} size="20" />
                                  User Management</Link>
                          {/if}

                          {#if userHasPermission('Role.findAll')}
                              <Link to="/roleMgmt" class="p-2 rounded hover:bg-blue-200 flex items-center gap-2" on:click={closeSidebar}>
                                  <Icon src={UserCircle} size="20" />
                                  Role Management</Link>
                          {/if}

                          {#if userHasPermission('Categories.findAll')}
                              <Link to="/catMgmt" class="p-2 rounded hover:bg-blue-200 flex items-center gap-2" on:click={closeSidebar}>
                                  <Icon src={Square3Stack3d} size="20" />
                                  Category Management</Link>
                          {/if}

                          {#if userHasPermission('Fooditems.findAll')}
                              <Link to="/fooditemMgmt" class="p-2 rounded hover:bg-blue-200 flex items-center gap-2" on:click={closeSidebar}>
                                  <Icon src={ClipboardDocumentList} size="20" />
                                  FoodItem Management</Link>
                          {/if}

                          {#if userHasPermission('Menus.findAll')}
                              <Link to="/menuMgmt" class="p-2 rounded hover:bg-blue-200 flex items-center gap-2" on:click={closeSidebar}>
                                  <Icon src={Squares2x2} size="20" />
                                  Menu Management</Link>
                          {/if}

                          {#if userHasPermission('Orders.findAll')}
                              <Link to="/orderMgmt" class="p-2 rounded hover:bg-blue-200 flex items-center gap-2" on:click={closeSidebar}>
                                  <Icon src={ClipboardDocument} size="20" />
                                  Order Management</Link>
                          {/if}

                          {#if userHasPermission('Payments.findAll')}
                              <Link to="/payMgmt" class="p-2 rounded hover:bg-blue-200 flex items-center gap-2" on:click={closeSidebar}>
                                  <Icon src={CreditCard} size="20" />
                                  Payment Management</Link>
                          {/if}

                          {#if userHasPermission('Orders.searchOrderForPayment')}
                          <Link to="/make-order" class="p-2 rounded hover:bg-blue-200 flex items-center gap-2" on:click={closeSidebar}>
                              <Icon src={ListBullet} size="20" />
                              Make Order</Link>
                          {/if}

                          {#if userHasPermission('Payments.create')}
                          <Link to="/make-payment" class="p-2 rounded hover:bg-blue-200 flex items-center gap-2" on:click={closeSidebar}>
                              <Icon src={CreditCard} size="20" />
                              Make Payment</Link>  
                          {/if}

                          {#if userHasPermission('Menus.fooditemsToday')}  
                          <Link to="/client/menu" class="p-2 rounded hover:bg-blue-200 flex items-center gap-2" on:click={closeSidebar}>  
                              <Icon src={Squares2x2} size="20" />
                              Menu</Link>
                          {/if}

                          {#if userHasPermission('Orders.findOrderHistoryByUser')}
                          <Link to="/client/orderHistory" class="p-2 rounded hover:bg-blue-200 flex items-center gap-2" on:click={closeSidebar}>
                              <Icon src={Clock} size="20" />
                              Order History</Link>
                          {/if}

                          <button on:click={logout} class="w-full text-left p-2 rounded hover:bg-blue-200 flex items-center gap-2">
                              <Icon src={ArrowRightOnRectangle} size="20" />
                              Logout</button>
                      {:else}
                          <Link to="/login" class="p-2 rounded hover:bg-blue-200 flex items-center gap-2">
                              <Icon src={ArrowLeftOnRectangle} size="20" />
                              Login</Link>
                      {/if}
                  </nav>
              </aside>

              <!-- Main Area -->
              <main class="flex-grow p-3 overflow-hidden">
                  <Route path="/" component={Login} />
                  <Route path="/login" component={Login} />
                  <ProtectedRoute path="/MainDashboard" component={MainDashboard} />
                  <ProtectedRoute path="/catMgmt" component={Category} />
                  <ProtectedRoute path="/fooditemMgmt" component={FoodItems} />
                  <ProtectedRoute path='/menuMgmt' component={MenuMgmt}/>
                  <ProtectedRoute path='/orderMgmt' component={OrderDashboard}/>
                  <ProtectedRoute path="/cart" component={Cart} />
                  <ProtectedRoute path='/client/menu' component={MenuClient}/>
                  <ProtectedRoute path="/client/orderHistory" component={OrderHistory} />
                  <ProtectedRoute path="/client/orderDetail/:orderId" component={OrderDetail} />
                  <ProtectedRoute path="/payMgmt" component={PaymentDashboard} />
                  <ProtectedRoute path="/make-payment" component={MakePayment} />
                  <ProtectedRoute path="/make-order" component={MakeOrder} />
                  <ProtectedRoute path="/roleMgmt" component={RoleManagement} />
                  <ProtectedRoute path="/userMgmt" component={UserManagement} />
                  <ProtectedRoute path ="/delete-account" component={DeleteAccount}/>
                  <Route path="/support" component={Support} />

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
<script>

  // Enhanced sample data with more items
  let foodItems = [
    // Pizza Category
    {
      id: 1,
      name: "Margherita Pizza",
      image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&h=300&fit=crop&crop=center",
      orders: 45,
      category: "Pizza",
      price: "$12.99"
    },
    {
      id: 2,
      name: "Pepperoni Pizza",
      image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop&crop=center",
      orders: 52,
      category: "Pizza",
      price: "$14.99"
    },
    {
      id: 3,
      name: "BBQ Chicken Pizza",
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center",
      orders: 38,
      category: "Pizza",
      price: "$16.99"
    },
    
    // Burgers Category
    {
      id: 4,
      name: "Classic Beef Burger",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&crop=center",
      orders: 64,
      category: "Burgers",
      price: "$11.99"
    },
    {
      id: 5,
      name: "Chicken Deluxe",
      image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop&crop=center",
      orders: 32,
      category: "Burgers",
      price: "$13.49"
    },
    {
      id: 6,
      name: "Veggie Burger",
      image: "https://images.unsplash.com/photo-1525059696034-4967a729002e?w=400&h=300&fit=crop&crop=center",
      orders: 28,
      category: "Burgers",
      price: "$10.99"
    },
    
    // Pasta Category
    {
      id: 7,
      name: "Pasta Carbonara",
      image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop&crop=center",
      orders: 39,
      category: "Pasta",
      price: "$15.99"
    },
    {
      id: 8,
      name: "Penne Arrabbiata",
      image: "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400&h=300&fit=crop&crop=center",
      orders: 42,
      category: "Pasta",
      price: "$13.99"
    },
    {
      id: 9,
      name: "Lasagna",
      image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=300&fit=crop&crop=center",
      orders: 35,
      category: "Pasta",
      price: "$17.99"
    },
    
    // Salads Category
    {
      id: 10,
      name: "Caesar Salad",
      image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop&crop=center",
      orders: 28,
      category: "Salads",
      price: "$8.99"
    },
    {
      id: 11,
      name: "Greek Salad",
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop&crop=center",
      orders: 31,
      category: "Salads",
      price: "$9.99"
    },
    {
      id: 12,
      name: "Quinoa Power Bowl",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&crop=center",
      orders: 24,
      category: "Salads",
      price: "$11.99"
    },
    
    // Mexican Category
    {
      id: 13,
      name: "Fish Tacos",
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center",
      orders: 24,
      category: "Mexican",
      price: "$12.99"
    },
    {
      id: 14,
      name: "Chicken Quesadilla",
      image: "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=400&h=300&fit=crop&crop=center",
      orders: 36,
      category: "Mexican",
      price: "$10.99"
    },
    {
      id: 15,
      name: "Beef Burrito Bowl",
      image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop&crop=center",
      orders: 29,
      category: "Mexican",
      price: "$13.49"
    },
    
    // Desserts Category
    {
      id: 16,
      name: "Chocolate Cake",
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop&crop=center",
      orders: 18,
      category: "Desserts",
      price: "$6.99"
    },
    {
      id: 17,
      name: "Tiramisu",
      image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop&crop=center",
      orders: 22,
      category: "Desserts",
      price: "$7.99"
    },
    {
      id: 18,
      name: "Cheesecake",
      image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=300&fit=crop&crop=center",
      orders: 26,
      category: "Desserts",
      price: "$7.49"
    },
    
    // Asian Category
    {
      id: 19,
      name: "Chicken Teriyaki",
      image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&crop=center",
      orders: 41,
      category: "Asian",
      price: "$14.99"
    },
    {
      id: 20,
      name: "Pad Thai",
      image: "https://images.unsplash.com/photo-1559847844-d9a873b2649f?w=400&h=300&fit=crop&crop=center",
      orders: 33,
      category: "Asian",
      price: "$13.99"
    },
    {
      id: 21,
      name: "Sushi Platter",
      image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop&crop=center",
      orders: 47,
      category: "Asian",
      price: "$19.99"
    }
  ];

  let selectedCategory = 'All';

  // Calculate total orders and stats
  $: totalOrders = foodItems.reduce((sum, item) => sum + item.orders, 0);
  $: totalRevenue = foodItems.reduce((sum, item) => sum + (item.orders * parseFloat(item.price.replace('$', ''))), 0);
  $: averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Group items by category
  $: groupedItems = foodItems.reduce((groups, item) => {
    const category = item.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});

  // Get unique categories
  $: categories = ['All', ...Object.keys(groupedItems)];

  // Filter items based on selected category
  $: filteredGroupedItems = selectedCategory === 'All' 
    ? groupedItems 
    : { [selectedCategory]: groupedItems[selectedCategory] || [] };

  // Category colors for visual distinction
  const categoryColors = {
    'Pizza': 'from-red-500 to-orange-500',
    'Burgers': 'from-yellow-500 to-orange-600',
    'Pasta': 'from-green-500 to-teal-500',
    'Salads': 'from-green-400 to-emerald-500',
    'Mexican': 'from-pink-500 to-red-500',
    'Desserts': 'from-purple-500 to-pink-500',
    'Asian': 'from-blue-500 to-indigo-500'
  };

</script>


<div class="min-h-screen max-h-screen overflow-y-auto bg-white">
  <!-- Fixed Header -->
  <div class="sticky top-0 bg-white/90 backdrop-blur-lg border-b border-gray-200 z-40">
    <div class="max-w-7xl mx-auto px-4 py-3">
      <div class="text-center mb-3">
        <h1 class="text-2xl md:text-3xl font-bold text-black mb-2">
          🍽️ Food Order Summary
        </h1>
        <p class="text-gray-700 text-lg">Real-time insight</p>
      </div>


      <!-- Category Filter Tabs -->
      <div class="flex flex-wrap justify-center gap-2 mb-2">
        {#each categories as category}
          <button
            class="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 {selectedCategory === category 
              ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg transform scale-105' 
              : 'bg-white/80 text-gray-700 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md'}"
            on:click={() => selectedCategory = category}
          >
            <span>{category}</span>
            <span class="ml-2 px-2 py-1 rounded-full text-xs {selectedCategory === category 
              ? 'bg-white/20 text-white' 
              : 'bg-gray-200 text-gray-600'}">
              {category === 'All' ? totalOrders : (groupedItems[category] || []).reduce((sum, item) => sum + item.orders, 0)}
            </span>
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Scrollable Content -->
  <div class="max-w-7xl mx-auto px-4 pb-8">
    <!-- Food Items by Category -->
    {#each Object.entries(filteredGroupedItems) as [category, items]}
      <div class="mb-12">
        <!-- Simple Category Header -->
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-black text-left">
            {category}
          </h2>
        </div>

        <!-- Enhanced Items Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {#each items as item (item.id)}
            <div class="group bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 border border-blue-200/50 overflow-hidden">
              <!-- Enhanced Image Section -->
              <div class="relative h-36 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name}
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 group-hover:from-black/50 transition-all duration-500"></div>
                
              </div>

              <!-- Enhanced Content Section -->
              <div class="p-5">
                <p class="text-sm text-gray-500 mb-2">{item.category}</p>
                <h3 class="text-lg font-bold text-black mb-3 group-hover:text-blue-600 transition-colors truncate">
                  {item.name}
                </h3>
                
                <!-- Enhanced Orders Display -->
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-xl font-bold text-black">{item.orders}</p>
                      <p class="text-xs text-gray-500">Orders</p>
                    </div>
                  </div>

                </div>

                <!-- Order Volume Progress Bar -->
                <div class="mb-4">
                  <div class="flex justify-between text-xs text-gray-500 mb-2">
                    <span>Order Volume</span>
                    <span class="text-blue-600 font-semibold">{Math.round((item.orders / totalOrders) * 100)}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      class="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-1000 shadow-sm"
                      style="width: {(item.orders / totalOrders) * 100}%"
                    ></div>
                  </div>
                </div>

              </div>
            </div>
          {/each}
        </div>
      </div>
    {/each}

    <!-- Enhanced Footer -->
    <div class="text-center mt-20 py-12 bg-gray-50 rounded-3xl border border-gray-200 backdrop-blur-sm">
      <div class="text-4xl mb-4">📊</div>
      <p class="text-gray-600 text-lg font-medium">Dashboard last updated</p>
      <p class="text-black font-bold text-xl">{new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}</p>
      <div class="mt-4 flex justify-center space-x-2">
        <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
        <div class="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
      </div>
    </div>
  </div>
</div>
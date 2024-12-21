<script>
    import { createEventDispatcher } from "svelte";
    
    import {Icon, MagnifyingGlass} from "svelte-hero-icons"

    const dispatch = createEventDispatcher();
  
    let startDate = "";
    let endDate = "";
    // let tokenid="";
    let statusFilter = "";
    let paymentTypeFilter = "";
    let categoryFilter = "";
  
    function searchOrders() {
      dispatch("searchOrders", {
        startDate,
        endDate,
        statusFilter,
        paymentTypeFilter,
        categoryFilter,
      });
    }


  </script>
  
  <div class="flex bg-gray-800 text-white p-4 pb-0 w-full justify-between items-center shadow-lg rounded-lg">
    <!-- Search Filters -->
    <div class="flex gap-4">

      

      <!-- Date Range -->
      <div>
        <label class="block text-sm mb-1">Start Date</label>
        <input
          type="date"
          bind:value={startDate}
          class="p-2 rounded-md text-gray-800"
        />
      </div>
      <div>
        <label class="block text-sm mb-1">End Date</label>
        <input
          type="date"
          bind:value={endDate}
          class="p-2 rounded-md text-gray-800"
        />
      </div>
  
      <!-- <div>
        <label class="block text-sm mb-1">Token</label>
        <input
          type="text"
          bind:value={tokenid}
          class="p-2 rounded-md text-gray-800"
        />
      </div> -->

      <!-- Status -->
       <div>
        <label class="block text-sm mb-1">Status</label>
        <select
          bind:value={statusFilter}
          class="p-2 rounded-md text-gray-800"
        >
          <option value="">None</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
       </div>
      
  
      <!-- Payment Type -->
       <div>
        <label class="block text-sm mb-1">Payment Method</label>
        <select
          bind:value={paymentTypeFilter}
          class="p-2 rounded-md text-gray-800"
        >
          <option value="">None</option>
          <option value="Credit Card">Credit Card</option>
          <option value="Cash">Cash</option>
          <option value="Other">Other</option>
        </select>
       </div>
      
  
      <!-- Categories -->
      <div>
        <label class="block text-sm mb-1">Category</label>
        <select
          bind:value={categoryFilter}
          class="p-2 rounded-md text-gray-800"
        >
          <option value="">None</option>
          <option value="Electronics">Electronics</option>
          <option value="Clothing">Clothing</option>
          <option value="Groceries">Groceries</option>
        </select>
      </div>

    <!-- Search Button -->
    <div class="">
      <label class="block text-sm mb-1">&nbsp;</label>
      <!-- <button
        on:click={searchOrders}
        class="flex items-center gap-2 bg-green-500 px-4 py-2 rounded-md hover:bg-blue-600 transition"
      >
        <Icon src={MagnifyingGlass} size="16" />
        <span>Search</span>
      </button> -->
      <button class="flex items-center gap-2 mb-4 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg 
        shadow-lg hover:bg-blue-700 transition-all duration-300"
        on:click={searchOrders}>
        <Icon src={MagnifyingGlass} size="16" />
        <span>Search</span>
        </button>
    </div>


    </div>
  
    
    
  </div>
  
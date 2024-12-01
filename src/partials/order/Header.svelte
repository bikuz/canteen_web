<script>
    import { createEventDispatcher } from "svelte";
  
    const dispatch = createEventDispatcher();
  
    let startDate = "";
    let endDate = "";
    let tokenid="";
    let statusFilter = "";
    let paymentTypeFilter = "";
    let categoryFilter = "";
  
    function searchOrders() {
      dispatch("searchOrders", {
        startDate,
        endDate,
        status: statusFilter,
        paymentType: paymentTypeFilter,
        category: categoryFilter,
      });
    }
  </script>
  
  <div class="flex bg-gray-800 text-white p-4 w-full justify-between items-center">
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
  
      <div>
        <label class="block text-sm mb-1">Token ID</label>
        <input
          type="text"
          bind:value={tokenid}
          class="p-2 rounded-md text-gray-800"
        />
      </div>

      <!-- Status -->
      <select
        bind:value={statusFilter}
        class="p-2 rounded-md text-gray-800"
      >
        <option value="">Status</option>
        <option value="Pending">Pending</option>
        <option value="Completed">Completed</option>
        <option value="Cancelled">Cancelled</option>
      </select>
  
      <!-- Payment Type -->
      <select
        bind:value={paymentTypeFilter}
        class="p-2 rounded-md text-gray-800"
      >
        <option value="">Payment Type</option>
        <option value="Credit Card">Credit Card</option>
        <option value="Cash">Cash</option>
        <option value="Other">Other</option>
      </select>
  
      <!-- Categories -->
      <select
        bind:value={categoryFilter}
        class="p-2 rounded-md text-gray-800"
      >
        <option value="">Categories</option>
        <option value="Electronics">Electronics</option>
        <option value="Clothing">Clothing</option>
        <option value="Groceries">Groceries</option>
      </select>
    </div>
  
    <!-- Search Button -->
    <div class="flex gap-2 ml-4">
      <button
        on:click={searchOrders}
        class="bg-blue-500 px-4 py-2 rounded-md hover:bg-blue-600 transition"
      >
        Search
      </button>
    </div>
  </div>
  
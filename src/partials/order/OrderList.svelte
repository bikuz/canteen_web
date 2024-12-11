<script>
    export let orders = [];
    import { createEventDispatcher } from "svelte";
  
    const dispatch = createEventDispatcher();
  
    function handleSelect(order) {
      dispatch("selectOrder", order);
    }
  </script>
  
  <div class="flex-1 overflow-auto p-4 ">
    <table class="table-auto w-full text-left border-collapse">
      <thead>
        <tr class="bg-gray-200">
          <th class="p-2">Token ID</th>
          <th class="p-2">Customer</th>
          <th class="p-2">Date</th>
          <th class="p-2">Status</th>
          <th class="p-2">Payment Type</th>
          <th class="p-2 text-right">Total (NPR)</th>
          <th class="p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each orders as order}
          <tr class="hover:bg-gray-100 border-b">
            <td class="p-2">{order.id}</td>
            <td class="p-2">{order.customer}</td>
            <td class="p-2">{order.date}</td>
            <td class="p-2">{order.status}</td>
            <td class="p-2">{order.paymentType}</td>
            <td class="p-2 pr-6 text-right">{order.total}</td>
            <td class="p-2">
              <button
                class="text-blue-500"
                on:click={() => handleSelect(order)}
              >
                View
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  
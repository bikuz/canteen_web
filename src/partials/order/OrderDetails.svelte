<script>
    export let selectedOrder;
    import { createEventDispatcher } from "svelte";
  
    const dispatch = createEventDispatcher();
  
    function closePanel() {
      dispatch("close");
    }
  </script>
  
  <div
    class="absolute top-0 right-0 w-1/3 h-full bg-white shadow-lg p-4 transform transition-transform duration-300 ease-in-out"
    style="transform: translateX(0);"
  >
    <div class="flex justify-between items-center border-b pb-2">
      <h2 class="text-lg font-bold">Order Details</h2>
      <button class="text-red-500" on:click={closePanel}>Close</button>
    </div>
    <div class="mt-4">
      <p><strong>Order ID:</strong> {selectedOrder.id}</p>
      <p><strong>Customer:</strong> {selectedOrder.customer}</p>
      <p><strong>Date:</strong> {selectedOrder.date}</p>
      <p><strong>Status:</strong> {selectedOrder.status}</p>
      <p><strong>Total:</strong> {selectedOrder.total}</p>
    </div>
  </div>
  
  <style>
    div {
      animation: slideIn 0.3s ease-out;
    }
  
    @keyframes slideIn {
      from {
        transform: translateX(100%);
      }
      to {
        transform: translateX(0);
      }
    }
  </style>
  
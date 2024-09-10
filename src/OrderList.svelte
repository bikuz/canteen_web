<script>
  import { onMount } from 'svelte';
  import axios from 'axios';

  let orders = [];

  onMount(async () => {
    try {
      const response = await axios.get('http://localhost:3000/orders');
      orders = response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  });
</script>

<h2>Order List</h2>
{#each orders as order}
  <div>
    <p>Customer: {order.customerName}</p>
    <p>Items: {order.items.join(', ')}</p>
    <p>Total: ${order.totalAmount}</p>
  </div>
{:else}
  <p>No orders found.</p>
{/each}
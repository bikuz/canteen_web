<script>
  import axios from 'axios';

  let customerName = '';
  let items = '';
  let totalAmount = 0;

  async function submitOrder() {
    const order = {
      customerName,
      items: items.split(',').map(item => item.trim()),
      totalAmount: parseFloat(totalAmount)
    };

    try {
      await axios.post('http://localhost:3000/orders', order);
      alert('Order submitted successfully!');
      customerName = '';
      items = '';
      totalAmount = 0;
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Error submitting order');
    }
  }
</script>

<h2>Add New Order</h2>
<form on:submit|preventDefault={submitOrder}>
  <input bind:value={customerName} placeholder="Customer Name" required>
  <input bind:value={items} placeholder="Items (comma-separated)" required>
  <input type="number" bind:value={totalAmount} placeholder="Total Amount" required>
  <button type="submit">Submit Order</button>
</form>
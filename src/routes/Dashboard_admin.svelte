<script>
    // import Highcharts from 'highcharts';
    import { onMount } from 'svelte';

    import Highcharts from 'highcharts';
    import ExportingModule from 'highcharts/modules/exporting';
    import { Chart } from '@highcharts/svelte'; // Chart is also exported by default

    // Applying a certain Highcharts module
    // ExportingModule(Highcharts);

    // Dummy data for category-wise sales
    const salesData = [
        { name: 'Electronics', y: 40 },
        { name: 'Clothing', y: 30 },
        { name: 'Groceries', y: 20 },
        { name: 'Home Appliances', y: 10 },
    ];

    let options = {
        chart: {
            type: 'line'
        },
        title: {
            text: 'My Chart'
        },
        series: [{
            data: [1, 2, 3, 4, 5]
        }]
    };
    
    // Example data for total and pending orders
    let totalOrders = 120;
    let pendingOrders = 35;

    // Categories: Breakfast, Lunch, Snacks
    let categories = [
        { name: "Breakfast", count: 12 },
        { name: "Lunch", count: 45 },
        { name: "Snacks", count: 20 }
    ];

    // Sample food orders list
    let foodOrders = [
        { name: "Burger", status: "Delivered", time: "10:30 AM" },
        { name: "Pizza", status: "Pending", time: "12:00 PM" },
        { name: "Salad", status: "Preparing", time: "12:30 PM" }
    ];

    let container;
    let chart;

    onMount(() => {
        // chart = Highcharts.chart(container, options);
    });
</script>

<style>
    .home-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
    }

    .home-header {
        display: flex;
        justify-content: space-around;
        gap: 20px;
        margin: 20px 0;
    }

    .header-card {
        flex: 1;
        padding: 40px;
        border-radius: 10px;
        background-color: #ffeb3b;
        color: #333;
        text-align: center;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    }

    .header-card h2 {
        font-size: 1.5rem;
        margin-bottom: 10px;
    }

    .header-card p {
        font-size: 2rem;
        font-weight: bold;
    }

    .category-display {
        display: flex;
        justify-content: space-around;
        gap: 20px;
        background-color: #e1f5fe;
        padding: 20px;
        border-radius: 10px;
    }

    .category-card {
        flex: 1;
        text-align: center;
        padding: 30px;
        margin: 10px;
        background-color: #bbdefb;
        border-radius: 8px;
        font-size: 1.2rem;
    }

    .food-orders {
        margin-top: 20px;
        background-color: #ffffff;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    }

    .food-orders h3 {
        font-size: 1.5rem;
        margin-bottom: 20px;
    }

    .food-item {
        display: flex;
        justify-content: space-between;
        padding: 15px;
        border-bottom: 1px solid #e0e0e0;
        font-size: 1.1rem;
    }

    .food-item:last-child {
        border-bottom: none;
    }
</style>

<div class="home-container">
    <!-- Total and Pending Orders Display -->
    <div class="home-header">
        <div class="header-card">
            <h2>Daily sales Chart</h2>
            <!-- <p>{totalOrders}</p> -->
        </div>
        <div class="header-card">
            <h2>Monthly Sales Chart</h2>
            <!-- <p>{pendingOrders}</p> -->
           
            <Chart options={options} highcharts={Highcharts}/>

            <!-- <div bind:this={container} class="w-full h-[400px]"></div> -->
        </div>
    </div>

    <!-- Categories Display -->
    <div class="category-display">
        {#each categories as category}
            <div class="category-card">
                <h3>{category.name}</h3>
                <p>Orders: {category.count}</p>
            </div>
        {/each}
    </div>

    <!-- Food Orders List -->
    <div class="food-orders">
        <h3>Food Orders</h3>
        {#each foodOrders as order}
            <div class="food-item">
                <div>
                    <p>{order.name}</p>
                    <small>Status: {order.status}</small>
                </div>
                <div>
                    <small>{order.time}</small>
                </div>
            </div> 
        {/each}
    </div>
</div>

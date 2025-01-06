<script>
    import { onMount } from 'svelte';
    import { getItems } from '../services/apiHandler';
    import Highcharts from 'highcharts';
    import ExportingModule from 'highcharts/modules/exporting';
    import { Chart } from '@highcharts/svelte'; // Chart is also exported by default


    let orders = [];
    let isLoading = true;
    let startDate = '';
    let endDate = '';
    
    let statistics = {
        // Order Statistics
        totalOrders: 0,
        createdOrders: 0,
        processingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        
        // Payment Statistics
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        cancelledAmount: 0,
        paidOrders: 0,
        pendingOrders: 0
    };

    // Chart Options
    let orderStatusChartOptions = {
        chart: {
            type: 'pie',
            height: '300px'
        },
        title: {
            text: 'Order Status Distribution'
        },
        series: [{
            name: 'Orders',
            data: []
        }]
    };

    let paymentChartOptions = {
        chart: {
            type: 'column',
            height: '300px'
        },
        title: {
            text: 'Payment Overview'
        },
        xAxis: {
            categories: ['Total', 'Paid', 'Pending', 'Cancelled']
        },
        yAxis: {
            title: {
                text: 'Amount (Rs.)'
            }
        },
        series: [{
            name: 'Amount',
            data: []
        }]
    };

    let dailyOrdersChartOptions = {
        chart: {
            type: 'line',
            height: '300px'
        },
        title: {
            text: 'Daily Orders Trend'
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'Number of Orders'
            }
        },
        series: [{
            name: 'Orders',
            data: []
        }]
    };

    let salesViewMode = 'daily'; // Add this variable for toggle

    // Add new chart options for sales
    let salesChartOptions = {
        chart: {
            type: 'column',
            height: '250px'
        },
        title: {
            text: 'Sales Overview'
        },
        xAxis: {
            type: 'datetime',
            labels: {
                format: '{value:%Y-%m-%d}' // Will be updated based on view mode
            }
        },
        yAxis: [{
            title: {
                text: 'Amount (Rs.)'
            }
        }, {
            title: {
                text: 'Number of Orders'
            },
            opposite: true
        }],
        tooltip: {
            shared: true
        },
        series: [{
            name: 'Sales Amount',
            yAxis: 0,
            data: [],
            tooltip: {
                valuePrefix: 'Rs. '
            }
        }, {
            name: 'Number of Orders',
            yAxis: 1,
            data: [],
            type: 'spline'
        }]
    };

    onMount(() => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        
        endDate = end.toISOString().split('T')[0];
        startDate = start.toISOString().split('T')[0];
        
        fetchOrders();
    });

    async function fetchOrders() {
        isLoading = true;
        try {
            const queryParams = new URLSearchParams();
            if (startDate) queryParams.append('startDate', startDate);
            if (endDate) queryParams.append('endDate', endDate);

            await getItems({
                endPoint: `orders?${queryParams.toString()}`,
                onSuccess: (response) => {
                    orders = response.sort((a, b) => 
                        new Date(b.createdAt) - new Date(a.createdAt)
                    );
                    calculateStatistics();
                    updateCharts();
                }
            });
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            isLoading = false;
        }
    }

    function calculateStatistics() {
        statistics = orders.reduce((acc, order) => {
            // Order Status Statistics
            acc.totalOrders++;
            switch(order.status) {
                case 'created':
                    acc.createdOrders++;
                    break;
                case 'processing':
                    acc.processingOrders++;
                    break;
                case 'completed':
                    acc.completedOrders++;
                    break;
                case 'cancelled':
                    acc.cancelledOrders++;
                    break;
            }

            // Payment Statistics
            acc.totalAmount += order.totalPrice;
            switch(order.paymentStatus) {
                case 'paid':
                    acc.paidAmount += order.totalPrice;
                    acc.paidOrders++;
                    break;
                case 'pending':
                    acc.pendingAmount += order.totalPrice;
                    acc.pendingOrders++;
                    break;
                case 'cancelled':
                    acc.cancelledAmount += order.totalPrice;
                    break;
            }

            return acc;
        }, {
            totalOrders: 0,
            createdOrders: 0,
            processingOrders: 0,
            completedOrders: 0,
            cancelledOrders: 0,
            totalAmount: 0,
            paidAmount: 0,
            pendingAmount: 0,
            cancelledAmount: 0,
            paidOrders: 0,
            pendingOrders: 0
        });
    }

    function updateCharts() {
        // Update Order Status Chart
        orderStatusChartOptions.series[0].data = [
            ['Created', statistics.createdOrders],
            ['Processing', statistics.processingOrders],
            ['Completed', statistics.completedOrders],
            ['Cancelled', statistics.cancelledOrders]
        ];

        // Update Payment Chart
        paymentChartOptions.series[0].data = [
            statistics.totalAmount,
            statistics.paidAmount,
            statistics.pendingAmount,
            statistics.cancelledAmount
        ];

        // Update Daily Orders Trend
        const dailyOrders = orders.reduce((acc, order) => {
            const date = new Date(order.createdAt).setHours(0,0,0,0);
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        dailyOrdersChartOptions.series[0].data = Object.entries(dailyOrders)
            .map(([date, count]) => [parseInt(date), count]);

        updateSalesChart();
    }

    function formatCurrency(amount) {
        return `Rs. ${amount.toFixed(2)}`;
    }

    function handleFilterChange() {
        if (new Date(startDate) > new Date(endDate)) {
            alert('Start date cannot be after end date');
            return;
        }
        fetchOrders();
    }

    function updateSalesChart() {
        const salesData = {};
        const orderCounts = {};
        
        orders.forEach(order => {
            let dateKey;
            const orderDate = new Date(order.createdAt);
            
            if (salesViewMode === 'daily') {
                dateKey = orderDate.setHours(0,0,0,0);
            } else {
                dateKey = new Date(orderDate.getFullYear(), orderDate.getMonth(), 1).getTime();
            }

            salesData[dateKey] = (salesData[dateKey] || 0) + order.totalPrice;
            orderCounts[dateKey] = (orderCounts[dateKey] || 0) + 1;
        });

        // Format data for chart
        const sortedDates = Object.keys(salesData).sort();
        const salesSeriesData = sortedDates.map(date => [parseInt(date), salesData[date]]);
        const orderSeriesData = sortedDates.map(date => [parseInt(date), orderCounts[date]]);

        // Update chart options
        salesChartOptions.xAxis.labels.format = salesViewMode === 'daily' ? '{value:%Y-%m-%d}' : '{value:%Y-%m}';
        salesChartOptions.title.text = `${salesViewMode === 'daily' ? 'Daily' : 'Monthly'} Sales Overview`;
        salesChartOptions.series[0].data = salesSeriesData;
        salesChartOptions.series[1].data = orderSeriesData;
    }

    function toggleSalesView() {
        salesViewMode = salesViewMode === 'daily' ? 'monthly' : 'daily';
        updateSalesChart();
    }

    function calculateDateDifference(start, end, mode) {
        const diffInDays = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
        return mode === 'daily' ? diffInDays : Math.ceil(diffInDays / 30);
    }

    function calculateAverage(total, start, end, mode) {
        const timePeriod = calculateDateDifference(start, end, mode);
        return timePeriod > 0 ? total / timePeriod : 0;
    }
</script>

<div class="container mx-auto p-4 max-w-7xl">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Dashboard Overview</h1>
        
        <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
                <label for="startDate" class="text-sm text-gray-600">From:</label>
                <input
                    type="date"
                    id="startDate"
                    bind:value={startDate}
                    on:change={handleFilterChange}
                    class="border rounded px-2 py-1 text-sm"
                />
            </div>
            <div class="flex items-center gap-2">
                <label for="endDate" class="text-sm text-gray-600">To:</label>
                <input
                    type="date"
                    id="endDate"
                    bind:value={endDate}
                    on:change={handleFilterChange}
                    class="border rounded px-2 py-1 text-sm"
                />
            </div>
        </div>
    </div>

    <div class="max-h-[calc(100vh-10rem)] overflow-y-auto pr-4">
        {#if isLoading}
            <div class="text-center py-8">
                <p class="text-gray-500">Loading ...</p>
            </div>
        {:else}
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <!-- Total Orders -->
                <div class="bg-white rounded-lg shadow p-4">
                    <h3 class="text-gray-500 text-sm">Total Orders</h3>
                    <p class="text-2xl font-bold">{statistics.totalOrders}</p>
                    <p class="text-sm text-gray-600 mt-1">Value: {formatCurrency(statistics.totalAmount)}</p>
                </div>

                <!-- Completed Orders -->
                <!-- <div class="bg-green-50 rounded-lg shadow p-4">
                    <h3 class="text-green-700 text-sm">Completed Orders</h3>
                    <p class="text-2xl font-bold text-green-700">{statistics.completedOrders}</p>
                    <p class="text-sm text-green-600 mt-1">Success Rate: {((statistics.completedOrders / statistics.totalOrders) * 100).toFixed(1)}%</p>
                </div> -->

                <!-- Payment Success -->
                <div class="bg-blue-50 rounded-lg shadow p-4">
                    <h3 class="text-blue-700 text-sm">Payment Success</h3>
                    <p class="text-2xl font-bold text-blue-700">{statistics.paidOrders}</p>
                    <p class="text-sm text-blue-600 mt-1">Amount: {formatCurrency(statistics.paidAmount)}</p>
                </div>

                <!-- Pending Payments -->
                <div class="bg-yellow-50 rounded-lg shadow p-4">
                    <h3 class="text-yellow-700 text-sm">Pending Payments</h3>
                    <p class="text-2xl font-bold text-yellow-700">{statistics.pendingOrders}</p>
                    <p class="text-sm text-yellow-600 mt-1">Amount: {formatCurrency(statistics.pendingAmount)}</p>
                </div>

                <!-- Cancelled Orders -->
                <div class="bg-red-50 rounded-lg shadow p-4">
                    <h3 class="text-red-700 text-sm">Cancelled Orders</h3>
                    <p class="text-2xl font-bold text-red-700">{statistics.cancelledOrders}</p>
                    <p class="text-sm text-red-600 mt-1">
                        Rate: {((statistics.cancelledOrders / statistics.totalOrders) * 100).toFixed(1)}%
                        • Loss: {formatCurrency(statistics.cancelledAmount)}
                    </p>
                </div>
            </div>

            <!-- Grid Container for Stats and Chart -->
            <div class="grid grid-cols-4 gap-4 mb-6">
                <!-- Left Column: Statistics -->
                <div class="space-y-4">
                    <!-- Average Daily Sales -->
                    <div class="bg-purple-50 rounded-lg shadow p-4 h-[calc(33.33%-0.67rem)]">
                        <h3 class="text-purple-700 text-sm">Average {salesViewMode === 'daily' ? 'Daily' : 'Monthly'} Sales</h3>
                        <p class="text-2xl font-bold text-purple-700">
                            {formatCurrency(calculateAverage(statistics.totalAmount, startDate, endDate, salesViewMode))}
                        </p>
                    </div>

                    <!-- Average Orders per Day -->
                    <div class="bg-indigo-50 rounded-lg shadow p-4 h-[calc(33.33%-0.67rem)]">
                        <h3 class="text-indigo-700 text-sm">Average Orders per {salesViewMode === 'daily' ? 'Day' : 'Month'}</h3>
                        <p class="text-2xl font-bold text-indigo-700">
                            {(statistics.totalOrders / (salesViewMode === 'daily'
                                ? Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
                                : Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24 * 30))
                            )).toFixed(1)}
                        </p>
                    </div>

                    <!-- Average Order Value -->
                    <div class="bg-pink-50 rounded-lg shadow p-4 h-[calc(33.33%-0.67rem)]">
                        <h3 class="text-pink-700 text-sm">Average Order Value</h3>
                        <p class="text-2xl font-bold text-pink-700">
                            {formatCurrency(statistics.totalAmount / statistics.totalOrders)}
                        </p>
                    </div>
                </div>

                <!-- Right Column: Sales Chart -->
                <div class="col-span-3 bg-white rounded-lg shadow p-4">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xl font-semibold">Sales Overview</h2>
                        <div class="flex items-center space-x-2">
                            <button 
                                class="px-4 py-2 rounded-lg transition-colors duration-200 {salesViewMode === 'daily' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}"
                                on:click={toggleSalesView}
                            >
                                Daily
                            </button>
                            <button 
                                class="px-4 py-2 rounded-lg transition-colors duration-200 {salesViewMode === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}"
                                on:click={toggleSalesView}
                            >
                                Monthly
                            </button>
                        </div>
                    </div>
                    <div class="h-[calc(100%-3.5rem)]"> <!-- Adjust height to account for header -->
                        <Chart options={salesChartOptions} />
                    </div>
                </div>
            </div>

            <!-- Charts -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <!-- Order Status Distribution -->
                <div class="bg-white rounded-lg shadow p-4">
                    <Chart options={orderStatusChartOptions} />
                </div>

                <!-- Payment Overview -->
                <div class="bg-white rounded-lg shadow p-4">
                    <Chart options={paymentChartOptions} />
                </div>
            </div>

            <!-- Daily Orders Trend -->
            <div class="bg-white rounded-lg shadow p-4">
                <Chart options={dailyOrdersChartOptions} />
            </div>

            

            
        {/if}
    </div>
</div> 
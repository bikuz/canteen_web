<script>
    import { onMount } from 'svelte';
    import { getItems, createItem, patchItem, deleteItem } from '../services/apiHandler';
    import { fade } from 'svelte/transition';

    let roles = [];
    let isLoading = true;
    let isEditing = false;
    let showPermissionModal = false;
    
    // Form data
    let currentRole = {
        name: '',
        permissions: {},
        createdAt: new Date()
    };

    // Available controllers and actions (you might want to fetch these from your backend)
    let availableControllers = [];

    let filterText = '';
    let availablePermissions = [];

    let selectedLeftItems = new Set();
    let selectedRightItems = new Set();

    // Add these variables to track last selected items for shift+click
    let lastSelectedLeftIndex = -1;
    let lastSelectedRightIndex = -1;

    function generateAvailablePermissions() {
        let permissions = [];
        availableControllers.forEach(controller => {
            controller.actions.forEach(action => {
                permissions.push({
                    id: `${controller.controller}/${action}`,
                    controller: controller.controller,
                    action: action
                });
            });
        });
        return permissions;
    }

    $: availablePermissions = availableControllers.flatMap(controller => 
        controller.actions.map(action => ({
            id: `${controller.controller}/${action}`,
            controller: controller.controller,
            action: action
        }))
    );

    $: filteredPermissions = availablePermissions.filter(permission => 
        !hasPermission(permission.controller, permission.action) &&
        permission.id.toLowerCase().includes(filterText.toLowerCase())
    );

    onMount(async () => {
        await fetchRoles();
        await fetchControllers();
    });

    async function fetchControllers() {
        try {
            await getItems({
                 endPoint: 'controller-scanner',
                onSuccess: (response) => {
                   availableControllers = [...response];
                    console.log(response);
                }
            });
            
        } catch (error) {
            console.error('Failed to fetch controllers:', error);
        }
    }

    async function fetchRoles() {
        isLoading = true;
        try {
            await getItems({
                endPoint: 'roles',
                onSuccess: (response) => {
                    roles = response;
                }
            });
        } catch (error) {
            console.error('Failed to fetch roles:', error);
        } finally {
            isLoading = false;
        }
    }

    function resetForm() {
        currentRole = {
            name: '',
            permissions: {},
            createdAt: new Date()
        };
        availablePermissions = generateAvailablePermissions();
        isEditing = false;
        showPermissionModal = false;
        filterText = '';
    }

    async function handleSubmit() {
        try {
            if (isEditing) {
                const hasPermissions = Object.keys(currentRole.permissions).some(controller => 
                    Object.values(currentRole.permissions[controller]).some(value => value)
                );
                
                if (!hasPermissions) {
                    alert('Permissions are required when updating a role');
                    return;
                }
                
                await patchItem(
                    currentRole,
                    {
                        endPoint: `roles/${currentRole._id}`,
                        onSuccess: () => {
                            fetchRoles();
                            resetForm();
                        }
                    }
                );
            } else {
                await createItem(
                    currentRole,
                    {
                        endPoint: 'roles',
                        onSuccess: () => {
                            fetchRoles();
                            resetForm();
                        }
                    }
                );
            }
        } catch (error) {
            console.error('Failed to save role:', error);
        }
    }

    async function handleDelete(roleId) {
        if (confirm('Are you sure you want to delete this role?')) {
            try {
                await deleteItem(
                    roleId,
                    {
                        endPoint: `roles`,
                        onSuccess: (response) => {
                            if(response.success){
                                fetchRoles();
                            }
                            else{
                                alert(response.message);
                            }
                    }
                });
            } catch (error) {
                console.error('Failed to delete role:', error);
            }
        }
    }

    function editRole(role) {
        currentRole = { ...role };
        isEditing = true;
        showPermissionModal = true;
    }

    function togglePermission(controller, action) {
        if (!currentRole.permissions[controller]) {
            currentRole.permissions[controller] = {};
        }
        currentRole.permissions[controller][action] = !currentRole.permissions[controller][action];
        currentRole = { ...currentRole };
        availablePermissions = [...availablePermissions];
    }

    function hasPermission(controller, action) {
        return currentRole.permissions[controller]?.[action] || false;
    }

    function selectAllPermissions() {
        filteredPermissions.forEach(permission => {
            togglePermission(permission.controller, permission.action);
        });
    }

    function removeAllPermissions() {
        Object.keys(currentRole.permissions).forEach(controller => {
            Object.keys(currentRole.permissions[controller]).forEach(action => {
                if (currentRole.permissions[controller][action]) {
                    togglePermission(controller, action);
                }
            });
        });
    }

    $: selectedPermissions = Object.entries(currentRole.permissions).flatMap(([controller, actions]) => 
        Object.entries(actions)
            .filter(([action, value]) => value)
            .map(([action]) => ({
                id: `${controller}/${action}`,
                controller,
                action
            }))
    );

    function moveToRight() {
        selectedLeftItems.forEach(permissionId => {
            const permission = filteredPermissions.find(p => p.id === permissionId);
            if (permission) {
                togglePermission(permission.controller, permission.action);
            }
        });
        selectedLeftItems.clear();
        lastSelectedLeftIndex = -1;
    }

    function moveToLeft() {
        selectedRightItems.forEach(permissionId => {
            const permission = selectedPermissions.find(p => p.id === permissionId);
            if (permission) {
                togglePermission(permission.controller, permission.action);
            }
        });
        selectedRightItems.clear();
        lastSelectedRightIndex = -1;
    }

    function toggleLeftSelection(permissionId, event, index) {
        if (event.shiftKey && lastSelectedLeftIndex !== -1) {
            // Handle shift+click range selection
            const start = Math.min(lastSelectedLeftIndex, index);
            const end = Math.max(lastSelectedLeftIndex, index);
            
            filteredPermissions.slice(start, end + 1).forEach(permission => {
                selectedLeftItems.add(permission.id);
            });
        } else if (event.ctrlKey || event.metaKey) {
            // Handle ctrl/cmd+click for individual toggle
            if (selectedLeftItems.has(permissionId)) {
                selectedLeftItems.delete(permissionId);
            } else {
                selectedLeftItems.add(permissionId);
                lastSelectedLeftIndex = index;
            }
        } else {
            // Single click selects only one item
            selectedLeftItems.clear();
            selectedLeftItems.add(permissionId);
            lastSelectedLeftIndex = index;
        }
        selectedLeftItems = selectedLeftItems; // Trigger reactivity
    }

    function toggleRightSelection(permissionId, event, index) {
        if (event.shiftKey && lastSelectedRightIndex !== -1) {
            // Handle shift+click range selection
            const start = Math.min(lastSelectedRightIndex, index);
            const end = Math.max(lastSelectedRightIndex, index);
            
            selectedPermissions.slice(start, end + 1).forEach(permission => {
                selectedRightItems.add(permission.id);
            });
        } else if (event.ctrlKey || event.metaKey) {
            // Handle ctrl/cmd+click for individual toggle
            if (selectedRightItems.has(permissionId)) {
                selectedRightItems.delete(permissionId);
            } else {
                selectedRightItems.add(permissionId);
                lastSelectedRightIndex = index;
            }
        } else {
            // Single click selects only one item
            selectedRightItems.clear();
            selectedRightItems.add(permissionId);
            lastSelectedRightIndex = index;
        }
        selectedRightItems = selectedRightItems; // Trigger reactivity
    }
</script>

<style>
    .no-select {
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
    }
</style>

<div class="container mx-auto p-4 max-w-7xl">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Role Management</h1>
        <button
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            on:click={() => showPermissionModal = true}
        >
            Create New Role
        </button>
    </div>

    {#if isLoading}
        <div class="text-center py-8">
            <p class="text-gray-500">Loading...</p>
        </div>
    {:else}
        <!-- Roles Table -->
        <div class="bg-white rounded-lg shadow max-h-[calc(100vh-11rem)] overflow-y-auto">
            <table class="min-w-full">
                <thead class="bg-gray-50 sticky top-0">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#each roles as role}
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap">{role.name}</td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                {new Date(role.createdAt).toLocaleDateString()}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <button
                                    class="text-sm px-3 py-1 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors mr-3"
                                    on:click={() => editRole(role)}
                                >
                                    Edit
                                </button>
                                <button
                                    class="text-sm px-3 py-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                    on:click={() => handleDelete(role._id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}

    <!-- Role Modal -->
    {#if showPermissionModal}
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" transition:fade>
            <div class="bg-white rounded-lg w-[60%] max-h-[90vh] ">
                <div class="p-6">
                    <h2 class="text-xl font-bold mb-4">{isEditing ? 'Edit Role' : 'Create New Role'}</h2>
                    
                    <form on:submit|preventDefault={handleSubmit}>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                                Role Name
                            </label>
                            <input
                                type="text"
                                bind:value={currentRole.name}
                                required
                                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div class="mb-4">
                            <h3 class="text-lg font-medium mb-2">Permissions</h3>
                            <div class="flex gap-4 items-stretch">
                                <!-- Available Permissions (Left Side) -->
                                <div class="flex-1 border rounded-lg p-4">
                                    <div class="flex flex-col h-full">
                                        <div class="mb-2">
                                            <input
                                                type="text"
                                                bind:value={filterText}
                                                placeholder="Filter permissions..."
                                                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div class="flex justify-between mb-2 ">
                                            <h4 class="font-medium">Available Permissions</h4>
                                            <button
                                                type="button"
                                                class="text-sm px-3 py-1 rounded-full text-white bg-blue-500 hover:bg-blue-600 transition-colors ml-2"
                                                on:click={selectAllPermissions}
                                            >
                                                Choose All
                                            </button>
                                        </div>
                                        <div class="flex-1 border rounded max-h-[calc(100vh-28rem)] overflow-y-auto no-select">
                                            {#each filteredPermissions as permission, index}
                                                <div
                                                    class="p-2 pt-1 pb-1 text-sm hover:bg-blue-200 cursor-pointer flex items-center {selectedLeftItems.has(permission.id) ? 'bg-blue-200' : ''}"
                                                    on:click={(e) => toggleLeftSelection(permission.id, e, index)}
                                                >
                                                    <span class="flex-1">{permission.id}</span>
                                                </div>
                                            {/each}
                                        </div>
                                    </div>
                                </div>

                                <!-- Movement Controls -->
                                <div class="flex flex-col justify-center gap-4">
                                    <button
                                        type="button"
                                        class="px-2 py-1 text-xl text-bold bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50"
                                        on:click={moveToRight}
                                        disabled={selectedLeftItems.size === 0}
                                    >
                                        →
                                    </button>
                                    <button
                                        type="button"
                                        class="px-2 py-1 text-xl text-bold bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50"
                                        on:click={moveToLeft}
                                        disabled={selectedRightItems.size === 0}
                                    >
                                        ←
                                    </button>
                                </div>

                                <!-- Selected Permissions (Right Side) -->
                                <div class="flex-1 border rounded-lg p-4">
                                    <div class="flex flex-col h-full">
                                        <div class="flex justify-between mb-2">
                                            <h4 class="font-medium">Selected Permissions</h4>
                                            <button
                                                type="button"
                                                class="text-sm px-3 py-1 rounded-full text-white bg-red-500 hover:bg-red-600 transition-colors ml-2"
                                                on:click={removeAllPermissions}
                                            >
                                                Remove All
                                            </button>
                                        </div>
                                        <div class="flex-1 border rounded max-h-[calc(100vh-25rem)] overflow-y-auto no-select">
                                            {#each selectedPermissions as permission, index}
                                                <div
                                                    class="p-2 pt-1 pb-1 text-sm hover:bg-blue-200 cursor-pointer flex items-center {selectedRightItems.has(permission.id) ? 'bg-blue-200' : ''}"
                                                    on:click={(e) => toggleRightSelection(permission.id, e, index)}
                                                >
                                                    <span class="flex-1">{permission.id}</span>
                                                </div>
                                            {/each}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="flex justify-end space-x-3">
                            <button
                                type="button"
                                class="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                on:click={resetForm}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                {isEditing ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    {/if}
</div> 
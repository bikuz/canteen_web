<script>
    import { onMount } from 'svelte';
    import { getItems, createItem, patchItem, deleteItem } from '../services/apiHandler';
    import { fade } from 'svelte/transition';

    let users = [];
    let roles = [];
    let isLoading = true;
    let isEditing = false;
    let showUserModal = false;

    // Form data
    let currentUser = {
        username: '',
        profile: {
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: ''
        },
        roles: [],
        createdAt: new Date()
    };

    let selectedRoleIds = new Set();
    let assignedRoleIds = new Set();

    // Add these variables for tracking selections
    let lastSelectedLeftIndex = -1;
    let lastSelectedRightIndex = -1;

    // Add these variables at the top with other declarations
    let filterText = '';
    let availableRoles = [];

    // Add this reactive statement
    $: filteredRoles = roles ? roles.filter(role => 
        !currentUser.roles.some(r => r._id === role._id) &&
        role.name.toLowerCase().includes(filterText.toLowerCase())
    ) : [];

    // Add this reactive statement at the top with other reactive declarations
    $: selectedRoles = currentUser.roles || [];

    // Helper functions for role selection
    function getAvailableRoles() {
        return roles.filter(role => !currentUser.roles.some(r => r._id === role._id));
    }

    function getSelectedRoles() {
        return selectedRoles;
    }

    function toggleLeftSelection(roleId, event, index) {
        event.preventDefault();
        const role = filteredRoles[index];
        
        if (!role) return;

        if (event.shiftKey && lastSelectedLeftIndex !== -1) {
            const start = Math.min(lastSelectedLeftIndex, index);
            const end = Math.max(lastSelectedLeftIndex, index);
            
            for (let i = start; i <= end; i++) {
                const roleToSelect = filteredRoles[i];
                if (roleToSelect) {
                    selectedRoleIds.add(roleToSelect._id);
                }
            }
        } else if (event.ctrlKey || event.metaKey) {
            if (selectedRoleIds.has(role._id)) {
                selectedRoleIds.delete(role._id);
            } else {
                selectedRoleIds.add(role._id);
                lastSelectedLeftIndex = index;
            }
        } else {
            selectedRoleIds.clear();
            selectedRoleIds.add(role._id);
            lastSelectedLeftIndex = index;
        }
        
        selectedRoleIds = new Set(selectedRoleIds);
    }

    function toggleRightSelection(roleId, event, index) {
        const selectedRoles = getSelectedRoles();
        if (event.shiftKey && lastSelectedRightIndex !== -1) {
            const start = Math.min(lastSelectedRightIndex, index);
            const end = Math.max(lastSelectedRightIndex, index);
            
            for (let i = start; i <= end; i++) {
                if (i < selectedRoles.length) {
                    assignedRoleIds.add(selectedRoles[i]._id);
                }
            }
        } else if (event.ctrlKey || event.metaKey) {
            if (assignedRoleIds.has(roleId)) {
                assignedRoleIds.delete(roleId);
            } else {
                if (index < selectedRoles.length) {
                    assignedRoleIds.add(roleId);
                    lastSelectedRightIndex = index;
                }
            }
        } else {
            assignedRoleIds.clear();
            if (index < selectedRoles.length) {
                assignedRoleIds.add(roleId);
                lastSelectedRightIndex = index;
            }
        }
        assignedRoleIds = new Set(assignedRoleIds); // Trigger reactivity
    }

    function moveRolesToRight() {
        const rolesToAdd = [];
        selectedRoleIds.forEach(roleId => {
            const role = filteredRoles.find(r => r._id === roleId);
            if (role && !currentUser.roles.some(r => r._id === role._id)) {
                rolesToAdd.push(role);
            }
        });
        
        if (rolesToAdd.length > 0) {
            currentUser = {
                ...currentUser,
                roles: [...currentUser.roles, ...rolesToAdd]
            };
            selectedRoleIds.clear();
            lastSelectedLeftIndex = -1;
            selectedRoleIds = new Set();
            filteredRoles = roles.filter(role => 
                !currentUser.roles.some(r => r._id === role._id) &&
                role.name.toLowerCase().includes(filterText.toLowerCase())
            );
        }
    }

    function moveRolesToLeft() {
        const roleIdsToRemove = Array.from(assignedRoleIds);
        if (roleIdsToRemove.length > 0) {
            currentUser = {
                ...currentUser,
                roles: currentUser.roles.filter(role => !assignedRoleIds.has(role._id))
            };
            assignedRoleIds.clear();
            lastSelectedRightIndex = -1;
            assignedRoleIds = new Set();
            filteredRoles = roles.filter(role => 
                !currentUser.roles.some(r => r._id === role._id) &&
                role.name.toLowerCase().includes(filterText.toLowerCase())
            );
        }
    }

    onMount(async () => {
        await Promise.all([fetchUsers(), fetchRoles()]);
    });

    async function fetchUsers() {
        isLoading = true;
        try {
            await getItems({
                endPoint: 'users',
                onSuccess: (response) => {
                    users = Array.isArray(response) ? response : [];
                }
            });
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            isLoading = false;
        }
    }

    async function fetchRoles() {
        try {
            await getItems({
                endPoint: 'roles',
                onSuccess: (response) => {
                    roles = Array.isArray(response) ? response : [];
                }
            });
        } catch (error) {
            console.error('Failed to fetch roles:', error);
        }
    }

    function resetForm() {
        currentUser = {
            username: '',
            profile: {
                firstName: '',
                lastName: '',
                email: '',
                phoneNumber: ''
            },
            roles: [],
            password: '',
            createdAt: new Date()
        };
        selectedRoleIds.clear();
        assignedRoleIds.clear();
        isEditing = false;
        showUserModal = false;
    }

    async function handleSubmit() {
        try {
            // Create a copy of currentUser with only role IDs
            const userToSubmit = {
                ...currentUser,
                roles: currentUser.roles.map(role => role._id)
            };

            if (isEditing) {
                await patchItem(
                    userToSubmit,
                    {
                        endPoint: `users/${currentUser._id}`,
                        onSuccess: () => {
                            fetchUsers();
                            resetForm();
                        }
                    }
                );
            } else {
                await createItem(
                    userToSubmit,
                    {
                        endPoint: 'users',
                        onSuccess: () => {
                            fetchUsers();
                            resetForm();
                        }
                    }
                );
            }
        } catch (error) {
            console.error('Failed to save user:', error);
        }
    }

    async function handleDelete(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteItem(
                    userId,
                    {
                        endPoint: 'users',
                        onSuccess: (response) => {
                            if(response.success) {
                                fetchUsers();
                            } else {
                                alert(response.message);
                            }
                        }
                    }
                );
            } catch (error) {
                console.error('Failed to delete user:', error);
            }
        }
    }

    function editUser(user) {
        currentUser = {
            ...user,
            password: '',
            profile: { ...user.profile },
            roles: Array.isArray(user.roles) ? [...user.roles] : []
        };
        isEditing = true;
        showUserModal = true;
    }
</script>

<style>
    .no-select {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
</style>

<div class="container mx-auto p-4 max-w-7xl">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">User Management</h1>
        <button
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            on:click={() => showUserModal = true}
        >
            Create New User
        </button>
    </div>

    {#if isLoading}
        <div class="text-center py-8">
            <p class="text-gray-500">Loading...</p>
        </div>
    {:else}
        <!-- Users Table -->
        <div class="bg-white rounded-lg shadow max-h-[calc(100vh-11rem)] overflow-y-auto">
            <table class="min-w-full">
                <thead class="bg-gray-50 sticky top-0">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#each users as user}
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap">{user.username}</td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                {user.profile.firstName} {user.profile.lastName}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">{user.profile.email}</td>
                            <td class="px-6 py-4 whitespace-nowrap">{user.profile.phoneNumber}</td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                {#each user.roles || [] as role}
                                    <div>{role.name}</div>
                                {/each}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <button
                                    class="text-sm px-3 py-1 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors mr-3"
                                    on:click={() => editUser(user)}
                                >
                                    Edit
                                </button>
                                <button
                                    class="text-sm px-3 py-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                    on:click={() => handleDelete(user._id)}
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

    <!-- User Modal -->
    {#if showUserModal}
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" transition:fade>
            <div class="bg-white rounded-lg w-[60%] ">
                <div class="p-6">
                    <h2 class="text-xl font-bold mb-4">{isEditing ? 'Edit User' : 'Create New User'}</h2>
                    
                    <form on:submit|preventDefault={handleSubmit}>
                        <div class="border rounded-lg p-4 mb-4 max-h-[calc(100vh-11rem)] overflow-y-auto">
                            <div class="mb-4 ">
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    bind:value={currentUser.username}
                                    required
                                    class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
    
                            {#if !isEditing}
                                <div class="mb-6">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        bind:value={currentUser.password}
                                        required
                                        class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            {/if}
                            <div class="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        bind:value={currentUser.profile.firstName}
                                        required
                                        class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
    
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        bind:value={currentUser.profile.lastName}
                                        required
                                        class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
    
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    bind:value={currentUser.profile.email}
                                    required
                                    class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
    
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    bind:value={currentUser.profile.phoneNumber}
                                    required
                                    class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
    
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-1">Roles</label>
                                <div class="flex gap-4 items-stretch">
                                    <!-- Available Roles -->
                                    <div class="flex-1 border rounded-lg p-4">
                                        <div class="flex flex-col h-full">
                                            <!-- <div class="mb-2">
                                                <input
                                                    type="text"
                                                    bind:value={filterText}
                                                    placeholder="Filter roles..."
                                                    class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div> -->
                                            <div class="flex justify-between mb-2">
                                                <h4 class="font-medium">Available Roles</h4>
                                            </div>
                                            <div class="border rounded h-full overflow-y-auto no-select">
                                                {#each filteredRoles || [] as role, index}
                                                    <div
                                                        class="p-2 hover:bg-blue-200 cursor-pointer {selectedRoleIds.has(role._id) ? 'bg-blue-200' : ''}"
                                                        on:click={(e) => toggleLeftSelection(role._id, e, index)}
                                                    >
                                                        {role.name}
                                                    </div>
                                                {/each}
                                            </div>
                                        </div>
                                    </div>
    
                                    <!-- Movement Controls -->
                                    <div class="flex flex-col justify-center gap-4">
                                        <button
                                            type="button"
                                            class="px-2 py-1 text-xl bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50"
                                            on:click={moveRolesToRight}
                                            disabled={selectedRoleIds.size === 0}
                                        >
                                            →
                                        </button>
                                        <button
                                            type="button"
                                            class="px-2 py-1 text-xl bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50"
                                            on:click={moveRolesToLeft}
                                            disabled={assignedRoleIds.size === 0}
                                        >
                                            ←
                                        </button>
                                    </div>
    
                                    <!-- Selected Roles -->
                                    <div class="flex-1 border rounded-lg p-4">
                                        <div class="flex flex-col h-full">
                                            <div class="flex justify-between mb-2">
                                                <h4 class="font-medium">Selected Roles</h4>
                                            </div>
                                            <div class="border rounded h-full overflow-y-auto no-select">
                                                {#each selectedRoles || [] as role, index}
                                                    <div
                                                        class="p-2 hover:bg-blue-200 cursor-pointer {assignedRoleIds.has(role._id) ? 'bg-blue-200' : ''}"
                                                        on:click={(e) => toggleRightSelection(role._id, e, index)}
                                                    >
                                                        {role.name}
                                                    </div>
                                                {/each}
                                            </div>
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
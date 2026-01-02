// Configuration
const API_URL = 'http://localhost:5000/api';

// State Management
let currentUser = null;
let services = [];
let clients = [];
let bookings = [];

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    checkAuthStatus();
    loadData();
});

function initializeApp() {
    // Set minimum date for booking to today
    const today = new Date().toISOString().split('T')[0];
    const bookingDateInput = document.getElementById('bookingDate');
    if (bookingDateInput) {
        bookingDateInput.setAttribute('min', today);
    }
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.dataset.page;
            navigateToPage(page);
        });
    });

    // Auth buttons
    document.getElementById('loginBtn')?.addEventListener('click', () => openModal('loginModal'));
    document.getElementById('registerBtn')?.addEventListener('click', () => openModal('registerModal'));
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);

    // Add buttons
    document.getElementById('addServiceBtn')?.addEventListener('click', () => openServiceModal());
    document.getElementById('addClientBtn')?.addEventListener('click', () => openClientModal());
    document.getElementById('addBookingBtn')?.addEventListener('click', () => openBookingModal());

    // Quick actions
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.currentTarget.dataset.action;
            handleQuickAction(action);
        });
    });

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal.id);
        });
    });

    // Click outside modal to close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    // Forms
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
    document.getElementById('serviceForm')?.addEventListener('submit', handleServiceSubmit);
    document.getElementById('clientForm')?.addEventListener('submit', handleClientSubmit);
    document.getElementById('bookingForm')?.addEventListener('submit', handleBookingSubmit);
}

// Navigation
function navigateToPage(pageName) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

    document.getElementById(`${pageName}-page`).classList.add('active');
    document.querySelector(`[data-page="${pageName}"]`).classList.add('active');
}

function handleQuickAction(action) {
    switch(action) {
        case 'add-client':
            navigateToPage('clients');
            openClientModal();
            break;
        case 'add-service':
            navigateToPage('services');
            openServiceModal();
            break;
        case 'new-booking':
            navigateToPage('bookings');
            openBookingModal();
            break;
    }
}

// Modal Management
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    // Reset form if exists
    const modal = document.getElementById(modalId);
    const form = modal.querySelector('form');
    if (form) form.reset();
}

// Authentication
function checkAuthStatus() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        updateAuthUI(true);
    }
}

function updateAuthUI(loggedIn) {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userMenu = document.getElementById('userMenu');
    const username = document.getElementById('username');

    if (loggedIn) {
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        userMenu.style.display = 'flex';
        username.textContent = currentUser.name;
    } else {
        loginBtn.style.display = 'block';
        registerBtn.style.display = 'block';
        userMenu.style.display = 'none';
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('token', data.token);
            updateAuthUI(true);
            closeModal('loginModal');
            showNotification('Login successful!', 'success');
            loadData();
        } else {
            showNotification(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please try again.', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            showNotification('Registration successful! Please login.', 'success');
            closeModal('registerModal');
            openModal('loginModal');
        } else {
            showNotification(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Registration failed. Please try again.', 'error');
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    updateAuthUI(false);
    showNotification('Logged out successfully', 'success');
    loadData();
}

// Data Loading
async function loadData() {
    try {
        await Promise.all([
            loadServices(),
            loadClients(),
            loadBookings()
        ]);
        updateDashboard();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

async function loadServices() {
    try {
        const response = await fetch(`${API_URL}/services`);
        if (response.ok) {
            services = await response.json();
            renderServices();
            updateServiceDropdown();
        } else {
            // Use demo data if API not available
            services = getDemoServices();
            renderServices();
            updateServiceDropdown();
        }
    } catch (error) {
        services = getDemoServices();
        renderServices();
        updateServiceDropdown();
    }
}

async function loadClients() {
    try {
        const response = await fetch(`${API_URL}/clients`);
        if (response.ok) {
            clients = await response.json();
            renderClients();
            updateClientDropdown();
        } else {
            clients = getDemoClients();
            renderClients();
            updateClientDropdown();
        }
    } catch (error) {
        clients = getDemoClients();
        renderClients();
        updateClientDropdown();
    }
}

async function loadBookings() {
    try {
        const response = await fetch(`${API_URL}/bookings`);
        if (response.ok) {
            bookings = await response.json();
            renderBookings();
        } else {
            bookings = getDemoBookings();
            renderBookings();
        }
    } catch (error) {
        bookings = getDemoBookings();
        renderBookings();
    }
}

// Service Management
function openServiceModal(service = null) {
    const modal = document.getElementById('serviceModal');
    const form = document.getElementById('serviceForm');
    const title = document.getElementById('serviceModalTitle');

    form.reset();

    if (service) {
        title.textContent = 'Edit Service';
        document.getElementById('serviceId').value = service.id;
        document.getElementById('serviceName').value = service.name;
        document.getElementById('serviceCategory').value = service.category;
        document.getElementById('servicePrice').value = service.price;
        document.getElementById('serviceDuration').value = service.duration;
        document.getElementById('serviceDescription').value = service.description || '';
        document.getElementById('serviceStatus').value = service.status;
    } else {
        title.textContent = 'Add Service';
    }

    openModal('serviceModal');
}

async function handleServiceSubmit(e) {
    e.preventDefault();

    const serviceData = {
        id: document.getElementById('serviceId').value || Date.now().toString(),
        name: document.getElementById('serviceName').value,
        category: document.getElementById('serviceCategory').value,
        price: parseFloat(document.getElementById('servicePrice').value),
        duration: parseFloat(document.getElementById('serviceDuration').value),
        description: document.getElementById('serviceDescription').value,
        status: document.getElementById('serviceStatus').value
    };

    try {
        const method = serviceData.id && services.find(s => s.id === serviceData.id) ? 'PUT' : 'POST';
        const url = method === 'PUT' ? `${API_URL}/services/${serviceData.id}` : `${API_URL}/services`;

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(serviceData)
        });

        if (response.ok) {
            await loadServices();
            closeModal('serviceModal');
            showNotification('Service saved successfully!', 'success');
        } else {
            throw new Error('Failed to save service');
        }
    } catch (error) {
        // Fallback to local storage
        const index = services.findIndex(s => s.id === serviceData.id);
        if (index !== -1) {
            services[index] = serviceData;
        } else {
            services.push(serviceData);
        }
        saveToLocalStorage('services', services);
        renderServices();
        updateServiceDropdown();
        updateDashboard();
        closeModal('serviceModal');
        showNotification('Service saved successfully!', 'success');
    }
}

function renderServices() {
    const tbody = document.getElementById('servicesTableBody');

    if (services.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No services available. Add your first service!</td></tr>';
        return;
    }

    tbody.innerHTML = services.map(service => `
        <tr>
            <td>${service.name}</td>
            <td>${service.category}</td>
            <td>$${service.price.toFixed(2)}</td>
            <td>${service.duration} hours</td>
            <td><span class="status-badge status-${service.status.toLowerCase()}">${service.status}</span></td>
            <td class="table-actions">
                <button class="btn-small btn-edit" onclick="editService('${service.id}')">Edit</button>
                <button class="btn-small btn-delete" onclick="deleteService('${service.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

function editService(id) {
    const service = services.find(s => s.id === id);
    if (service) openServiceModal(service);
}

async function deleteService(id) {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
        const response = await fetch(`${API_URL}/services/${id}`, { method: 'DELETE' });
        if (response.ok) {
            await loadServices();
            showNotification('Service deleted successfully!', 'success');
        } else {
            throw new Error('Failed to delete service');
        }
    } catch (error) {
        services = services.filter(s => s.id !== id);
        saveToLocalStorage('services', services);
        renderServices();
        updateServiceDropdown();
        updateDashboard();
        showNotification('Service deleted successfully!', 'success');
    }
}

// Client Management
function openClientModal(client = null) {
    const modal = document.getElementById('clientModal');
    const form = document.getElementById('clientForm');
    const title = document.getElementById('clientModalTitle');

    form.reset();

    if (client) {
        title.textContent = 'Edit Client';
        document.getElementById('clientId').value = client.id;
        document.getElementById('companyName').value = client.companyName;
        document.getElementById('contactPerson').value = client.contactPerson;
        document.getElementById('clientEmail').value = client.email;
        document.getElementById('clientPhone').value = client.phone;
        document.getElementById('clientType').value = client.type;
        document.getElementById('clientAddress').value = client.address || '';
    } else {
        title.textContent = 'Add Client';
    }

    openModal('clientModal');
}

async function handleClientSubmit(e) {
    e.preventDefault();

    const clientData = {
        id: document.getElementById('clientId').value || Date.now().toString(),
        companyName: document.getElementById('companyName').value,
        contactPerson: document.getElementById('contactPerson').value,
        email: document.getElementById('clientEmail').value,
        phone: document.getElementById('clientPhone').value,
        type: document.getElementById('clientType').value,
        address: document.getElementById('clientAddress').value
    };

    try {
        const method = clientData.id && clients.find(c => c.id === clientData.id) ? 'PUT' : 'POST';
        const url = method === 'PUT' ? `${API_URL}/clients/${clientData.id}` : `${API_URL}/clients`;

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clientData)
        });

        if (response.ok) {
            await loadClients();
            closeModal('clientModal');
            showNotification('Client saved successfully!', 'success');
        } else {
            throw new Error('Failed to save client');
        }
    } catch (error) {
        const index = clients.findIndex(c => c.id === clientData.id);
        if (index !== -1) {
            clients[index] = clientData;
        } else {
            clients.push(clientData);
        }
        saveToLocalStorage('clients', clients);
        renderClients();
        updateClientDropdown();
        updateDashboard();
        closeModal('clientModal');
        showNotification('Client saved successfully!', 'success');
    }
}

function renderClients() {
    const tbody = document.getElementById('clientsTableBody');

    if (clients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No clients available. Add your first client!</td></tr>';
        return;
    }

    tbody.innerHTML = clients.map(client => `
        <tr>
            <td>${client.companyName}</td>
            <td>${client.contactPerson}</td>
            <td>${client.email}</td>
            <td>${client.phone}</td>
            <td>${client.type}</td>
            <td class="table-actions">
                <button class="btn-small btn-edit" onclick="editClient('${client.id}')">Edit</button>
                <button class="btn-small btn-delete" onclick="deleteClient('${client.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

function editClient(id) {
    const client = clients.find(c => c.id === id);
    if (client) openClientModal(client);
}

async function deleteClient(id) {
    if (!confirm('Are you sure you want to delete this client?')) return;

    try {
        const response = await fetch(`${API_URL}/clients/${id}`, { method: 'DELETE' });
        if (response.ok) {
            await loadClients();
            showNotification('Client deleted successfully!', 'success');
        } else {
            throw new Error('Failed to delete client');
        }
    } catch (error) {
        clients = clients.filter(c => c.id !== id);
        saveToLocalStorage('clients', clients);
        renderClients();
        updateClientDropdown();
        updateDashboard();
        showNotification('Client deleted successfully!', 'success');
    }
}

// Booking Management
function openBookingModal(booking = null) {
    const modal = document.getElementById('bookingModal');
    const form = document.getElementById('bookingForm');
    const title = document.getElementById('bookingModalTitle');

    form.reset();

    if (booking) {
        title.textContent = 'Edit Booking';
        document.getElementById('bookingId').value = booking.id;
        document.getElementById('bookingClient').value = booking.clientId;
        document.getElementById('bookingService').value = booking.serviceId;
        document.getElementById('bookingDate').value = booking.date;
        document.getElementById('bookingTime').value = booking.time;
        document.getElementById('bookingStatus').value = booking.status;
        document.getElementById('bookingNotes').value = booking.notes || '';
    } else {
        title.textContent = 'New Booking';
        document.getElementById('bookingStatus').value = 'Pending';
    }

    openModal('bookingModal');
}

async function handleBookingSubmit(e) {
    e.preventDefault();

    const bookingData = {
        id: document.getElementById('bookingId').value || Date.now().toString(),
        clientId: document.getElementById('bookingClient').value,
        serviceId: document.getElementById('bookingService').value,
        date: document.getElementById('bookingDate').value,
        time: document.getElementById('bookingTime').value,
        status: document.getElementById('bookingStatus').value,
        notes: document.getElementById('bookingNotes').value
    };

    try {
        const method = bookingData.id && bookings.find(b => b.id === bookingData.id) ? 'PUT' : 'POST';
        const url = method === 'PUT' ? `${API_URL}/bookings/${bookingData.id}` : `${API_URL}/bookings`;

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });

        if (response.ok) {
            await loadBookings();
            closeModal('bookingModal');
            showNotification('Booking saved successfully!', 'success');
        } else {
            throw new Error('Failed to save booking');
        }
    } catch (error) {
        const index = bookings.findIndex(b => b.id === bookingData.id);
        if (index !== -1) {
            bookings[index] = bookingData;
        } else {
            bookings.push(bookingData);
        }
        saveToLocalStorage('bookings', bookings);
        renderBookings();
        updateDashboard();
        closeModal('bookingModal');
        showNotification('Booking saved successfully!', 'success');
    }
}

function renderBookings() {
    const tbody = document.getElementById('bookingsTableBody');

    if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No bookings scheduled. Create your first booking!</td></tr>';
        return;
    }

    tbody.innerHTML = bookings.map(booking => {
        const client = clients.find(c => c.id === booking.clientId);
        const service = services.find(s => s.id === booking.serviceId);

        return `
            <tr>
                <td>${client ? client.companyName : 'Unknown'}</td>
                <td>${service ? service.name : 'Unknown'}</td>
                <td>${formatDate(booking.date)}</td>
                <td>${booking.time}</td>
                <td><span class="status-badge status-${booking.status.toLowerCase()}">${booking.status}</span></td>
                <td class="table-actions">
                    <button class="btn-small btn-edit" onclick="editBooking('${booking.id}')">Edit</button>
                    <button class="btn-small btn-delete" onclick="deleteBooking('${booking.id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function editBooking(id) {
    const booking = bookings.find(b => b.id === id);
    if (booking) openBookingModal(booking);
}

async function deleteBooking(id) {
    if (!confirm('Are you sure you want to delete this booking?')) return;

    try {
        const response = await fetch(`${API_URL}/bookings/${id}`, { method: 'DELETE' });
        if (response.ok) {
            await loadBookings();
            showNotification('Booking deleted successfully!', 'success');
        } else {
            throw new Error('Failed to delete booking');
        }
    } catch (error) {
        bookings = bookings.filter(b => b.id !== id);
        saveToLocalStorage('bookings', bookings);
        renderBookings();
        updateDashboard();
        showNotification('Booking deleted successfully!', 'success');
    }
}

// Dashboard Updates
function updateDashboard() {
    document.getElementById('totalClients').textContent = clients.length;
    document.getElementById('activeServices').textContent = services.filter(s => s.status === 'Active').length;
    document.getElementById('pendingBookings').textContent = bookings.filter(b => b.status === 'Pending').length;

    const totalRevenue = bookings
        .filter(b => b.status === 'Completed')
        .reduce((sum, booking) => {
            const service = services.find(s => s.id === booking.serviceId);
            return sum + (service ? service.price : 0);
        }, 0);

    document.getElementById('monthlyRevenue').textContent = `$${totalRevenue.toFixed(2)}`;

    // Update reports
    document.getElementById('clientsThisMonth').textContent = clients.length;
    document.getElementById('clientsLastMonth').textContent = Math.max(0, clients.length - 2);
    const growth = clients.length > 0 ? ((2 / Math.max(1, clients.length - 2)) * 100).toFixed(1) : 0;
    document.getElementById('clientGrowth').textContent = `+${growth}%`;
}

function updateServiceDropdown() {
    const select = document.getElementById('bookingService');
    select.innerHTML = '<option value="">Select Service</option>' +
        services.filter(s => s.status === 'Active')
            .map(s => `<option value="${s.id}">${s.name} - $${s.price}</option>`)
            .join('');
}

function updateClientDropdown() {
    const select = document.getElementById('bookingClient');
    select.innerHTML = '<option value="">Select Client</option>' +
        clients.map(c => `<option value="${c.id}">${c.companyName}</option>`)
            .join('');
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function showNotification(message, type = 'info') {
    // Simple alert for now - can be enhanced with a toast library
    alert(message);
}

function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function loadFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

// Demo Data
function getDemoServices() {
    const stored = loadFromLocalStorage('services');
    if (stored) return stored;

    return [
        { id: '1', name: 'Network Infrastructure Setup', category: 'Network Support', price: 2500, duration: 8, status: 'Active', description: 'Complete network infrastructure setup and configuration' },
        { id: '2', name: 'Cloud Migration', category: 'Cloud Services', price: 5000, duration: 40, status: 'Active', description: 'Migrate your infrastructure to cloud platforms' },
        { id: '3', name: 'Cybersecurity Audit', category: 'Security', price: 3000, duration: 16, status: 'Active', description: 'Comprehensive security assessment and recommendations' }
    ];
}

function getDemoClients() {
    const stored = loadFromLocalStorage('clients');
    if (stored) return stored;

    return [
        { id: '1', companyName: 'Tech Startup Inc', contactPerson: 'John Doe', email: 'john@techstartup.com', phone: '555-0100', type: 'Startup', address: '123 Tech St, San Francisco, CA' },
        { id: '2', companyName: 'Enterprise Corp', contactPerson: 'Jane Smith', email: 'jane@enterprise.com', phone: '555-0200', type: 'Enterprise', address: '456 Business Ave, New York, NY' }
    ];
}

function getDemoBookings() {
    const stored = loadFromLocalStorage('bookings');
    if (stored) return stored;

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return [
        { id: '1', clientId: '1', serviceId: '1', date: tomorrow.toISOString().split('T')[0], time: '09:00', status: 'Pending', notes: 'Initial consultation' },
        { id: '2', clientId: '2', serviceId: '3', date: today.toISOString().split('T')[0], time: '14:00', status: 'Confirmed', notes: 'Security assessment' }
    ];
}

// Make functions globally accessible
window.editService = editService;
window.deleteService = deleteService;
window.editClient = editClient;
window.deleteClient = deleteClient;
window.editBooking = editBooking;
window.deleteBooking = deleteBooking;

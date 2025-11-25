// ===== FUTURISTIC EXPENSE TRACKER - ENHANCED VERSION =====
// Configuration
const API_BASE = window.location.origin;
let authToken = localStorage.getItem('auth_token') || null;
let currentUser = null;
let currentView = 'dashboard';

// Data stores
let groceries = [];
let expenses = [];
let userProfile = {
    name: 'User',
    email: '',
    avatar: '',
    memberSince: 'January 2024'
};

// Settings
let settings = {
    theme: localStorage.getItem('theme') || 'dark',
    colorScheme: localStorage.getItem('colorScheme') || 'purple',
    enable3D: localStorage.getItem('enable3D') !== 'false',
    enableParticles: localStorage.getItem('enableParticles') !== 'false'
};

// ===== 3D BACKGROUND SETUP =====
let scene, camera, renderer, particles3D = [];

function init3DBackground() {
    if (!settings.enable3D) return;
    
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.z = 50;
    
    // Create geometric shapes
    const geometries = [
        new THREE.BoxGeometry(5, 5, 5),
        new THREE.SphereGeometry(3, 32, 32),
        new THREE.TetrahedronGeometry(4),
        new THREE.OctahedronGeometry(3),
        new THREE.TorusGeometry(3, 1, 16, 100)
    ];
    
    const material = new THREE.MeshPhongMaterial({
        color: 0x667eea,
        transparent: true,
        opacity: 0.3,
        wireframe: true
    });
    
    // Add multiple shapes
    for (let i = 0; i < 15; i++) {
        const geometry = geometries[Math.floor(Math.random() * geometries.length)];
        const mesh = new THREE.Mesh(geometry, material.clone());
        
        mesh.position.x = (Math.random() - 0.5) * 100;
        mesh.position.y = (Math.random() - 0.5) * 100;
        mesh.position.z = (Math.random() - 0.5) * 100;
        
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;
        
        mesh.userData = {
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            }
        };
        
        scene.add(mesh);
        particles3D.push(mesh);
    }
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x667eea, 1, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);
    
    animate3D();
}

function animate3D() {
    if (!settings.enable3D) return;
    
    requestAnimationFrame(animate3D);
    
    particles3D.forEach(particle => {
        particle.rotation.x += particle.userData.rotationSpeed.x;
        particle.rotation.y += particle.userData.rotationSpeed.y;
        particle.rotation.z += particle.userData.rotationSpeed.z;
    });
    
    renderer.render(scene, camera);
}

// ===== PARTICLE SYSTEM =====
function initParticles() {
    if (!settings.enableParticles) return;
    
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particlesContainer.appendChild(particle);
    }
}

// ===== UTILITY FUNCTIONS =====
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function showLoading() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
    }
}

function hideLoading() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                document.getElementById('app').style.display = 'block';
            }, 500);
        }, 1000);
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).format(date);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== API FUNCTIONS =====
async function apiCall(endpoint, options = {}) {
    try {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ===== AUTHENTICATION =====
async function login(username, password) {
    try {
        const data = await apiCall('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        authToken = data.token;
        currentUser = { id: data.id, username: data.username };
        localStorage.setItem('auth_token', authToken);
        
        userProfile.email = data.username;
        userProfile.name = data.username.split('@')[0];
        
        showToast('Login successful!', 'success');
        showDashboard();
        loadDashboardData();
    } catch (error) {
        showToast(error.message || 'Login failed', 'error');
    }
}

async function signup(username, password) {
    try {
        const data = await apiCall('/api/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        authToken = data.token;
        currentUser = { id: data.id, username: data.username };
        localStorage.setItem('auth_token', authToken);
        
        userProfile.email = data.username;
        userProfile.name = data.username.split('@')[0];
        
        showToast('Account created successfully!', 'success');
        showDashboard();
        loadDashboardData();
    } catch (error) {
        showToast(error.message || 'Signup failed', 'error');
    }
}

async function checkAuth() {
    if (!authToken) {
        showAuthScreen();
        hideLoading();
        return;
    }
    
    try {
        const data = await apiCall('/api/auth/me');
        if (data.authenticated && data.user) {
            currentUser = data.user;
            userProfile.email = data.user.username;
            userProfile.name = data.user.username.split('@')[0];
            showDashboard();
            loadDashboardData();
        } else {
            throw new Error('Not authenticated');
        }
    } catch (error) {
        authToken = null;
        localStorage.removeItem('auth_token');
        showAuthScreen();
    } finally {
        hideLoading();
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('auth_token');
    showToast('Logged out successfully', 'info');
    showAuthScreen();
}

function showAuthScreen() {
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('dashboard-screen').style.display = 'none';
}

function showDashboard() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('dashboard-screen').style.display = 'flex';
    updateUserDisplay();
}

function updateUserDisplay() {
    const elements = {
        'user-name-display': userProfile.name,
        'welcome-user': userProfile.name,
        'profile-name': userProfile.name,
        'profile-email': userProfile.email
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    });
    
    // Update avatars
    const avatarUrl = userProfile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name)}&background=667eea&color=fff`;
    document.querySelectorAll('#user-avatar-mini, #profile-avatar').forEach(img => {
        if (img) img.src = avatarUrl;
    });
}

// ===== NAVIGATION =====
function switchView(viewName) {
    currentView = viewName;
    
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.view === viewName) {
            item.classList.add('active');
        }
    });
    
    // Update views
    document.querySelectorAll('.view-content').forEach(view => {
        view.classList.remove('active');
    });
    
    const activeView = document.getElementById(`view-${viewName}`);
    if (activeView) {
        activeView.classList.add('active');
    }
    
    // Load view-specific data
    if (viewName === 'groceries') {
        renderGroceriesFull();
    } else if (viewName === 'expenses') {
        renderExpensesFull();
    } else if (viewName === 'analytics') {
        renderAnalytics();
    } else if (viewName === 'profile') {
        updateProfileStats();
    }
}

// ===== GROCERY FUNCTIONS =====
async function loadGroceries() {
    try {
        const data = await apiCall('/api/groceries');
        groceries = Array.isArray(data) ? data : [];
        renderGroceries();
        updateStats();
    } catch (error) {
        console.error('Failed to load groceries:', error);
    }
}

async function addGrocery(name, quantity) {
    try {
        const data = await apiCall('/api/groceries', {
            method: 'POST',
            body: JSON.stringify({ name, quantity })
        });
        
        groceries.push(data);
        renderGroceries();
        renderGroceriesFull();
        updateStats();
        closeModal('grocery-modal');
        showToast('Grocery item added!', 'success');
    } catch (error) {
        showToast(error.message || 'Failed to add grocery', 'error');
    }
}

async function toggleGrocery(id) {
    try {
        const grocery = groceries.find(g => g.id === id);
        if (!grocery) return;
        
        const data = await apiCall(`/api/groceries/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ ...grocery, completed: !grocery.completed })
        });
        
        const index = groceries.findIndex(g => g.id === id);
        if (index !== -1) {
            groceries[index] = data;
        }
        
        renderGroceries();
        renderGroceriesFull();
        updateStats();
        showToast('Grocery updated!', 'success');
    } catch (error) {
        showToast(error.message || 'Failed to update grocery', 'error');
    }
}

async function deleteGrocery(id) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
        await apiCall(`/api/groceries/${id}`, {
            method: 'DELETE'
        });
        
        groceries = groceries.filter(g => g.id !== id);
        renderGroceries();
        renderGroceriesFull();
        updateStats();
        showToast('Grocery deleted!', 'success');
    } catch (error) {
        showToast(error.message || 'Failed to delete grocery', 'error');
    }
}

function renderGroceries() {
    const container = document.getElementById('grocery-list-container');
    if (!container) return;
    
    if (groceries.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-basket"></i>
                <p>No groceries yet. Add your first item!</p>
            </div>
        `;
        return;
    }
    
    const recentGroceries = groceries.slice(-5).reverse();
    container.innerHTML = `
        <div class="item-list">
            ${recentGroceries.map(grocery => `
                <div class="item ${grocery.completed ? 'completed' : ''}">
                    <div class="item-info">
                        <div class="item-name">${escapeHtml(grocery.name)}</div>
                        <div class="item-details">${escapeHtml(grocery.quantity)}</div>
                    </div>
                    <div class="item-actions">
                        <button class="btn-icon btn-toggle" onclick="toggleGrocery('${grocery.id}')" title="Toggle">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteGrocery('${grocery.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderGroceriesFull() {
    const container = document.getElementById('groceries-full-list');
    if (!container) return;
    
    if (groceries.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-basket"></i>
                <p>No groceries yet. Start adding items!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="item-list">
            ${groceries.map(grocery => `
                <div class="item ${grocery.completed ? 'completed' : ''}">
                    <div class="item-info">
                        <div class="item-name">${escapeHtml(grocery.name)}</div>
                        <div class="item-details">${escapeHtml(grocery.quantity)} • Added ${formatDate(grocery.createdAt)}</div>
                    </div>
                    <div class="item-actions">
                        <button class="btn-icon btn-toggle" onclick="toggleGrocery('${grocery.id}')" title="Toggle">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteGrocery('${grocery.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ===== EXPENSE FUNCTIONS =====
async function loadExpenses() {
    try {
        const data = await apiCall('/api/expenses');
        expenses = Array.isArray(data) ? data : [];
        renderExpenses();
        updateStats();
        renderChart();
    } catch (error) {
        console.error('Failed to load expenses:', error);
    }
}

async function addExpense(description, amount, category) {
    try {
        const data = await apiCall('/api/expenses', {
            method: 'POST',
            body: JSON.stringify({ description, amount, category })
        });
        
        expenses.push(data);
        renderExpenses();
        renderExpensesFull();
        updateStats();
        renderChart();
        closeModal('expense-modal');
        showToast('Expense added!', 'success');
    } catch (error) {
        showToast(error.message || 'Failed to add expense', 'error');
    }
}

async function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
        await apiCall(`/api/expenses/${id}`, {
            method: 'DELETE'
        });
        
        expenses = expenses.filter(e => e.id !== id);
        renderExpenses();
        renderExpensesFull();
        updateStats();
        renderChart();
        showToast('Expense deleted!', 'success');
    } catch (error) {
        showToast(error.message || 'Failed to delete expense', 'error');
    }
}

function renderExpenses() {
    const container = document.getElementById('expense-list-container');
    if (!container) return;
    
    if (expenses.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-wallet"></i>
                <p>No expenses yet. Add your first expense!</p>
            </div>
        `;
        return;
    }
    
    const recentExpenses = expenses.slice(-5).reverse();
    container.innerHTML = `
        <div class="item-list">
            ${recentExpenses.map(expense => `
                <div class="item">
                    <div class="item-info">
                        <div class="item-name">${escapeHtml(expense.description)}</div>
                        <div class="item-details">${expense.category} • ${formatDate(expense.createdAt)}</div>
                    </div>
                    <div class="item-info" style="text-align: right;">
                        <div class="item-name">${formatCurrency(expense.amount)}</div>
                        <button class="btn-icon btn-delete" onclick="deleteExpense('${expense.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderExpensesFull() {
    const container = document.getElementById('expenses-full-list');
    if (!container) return;
    
    if (expenses.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-wallet"></i>
                <p>No expenses yet. Start tracking!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="item-list">
            ${expenses.map(expense => `
                <div class="item">
                    <div class="item-info">
                        <div class="item-name">${escapeHtml(expense.description)}</div>
                        <div class="item-details">${expense.category} • ${formatDate(expense.createdAt)}</div>
                    </div>
                    <div class="item-info" style="text-align: right;">
                        <div class="item-name">${formatCurrency(expense.amount)}</div>
                        <button class="btn-icon btn-delete" onclick="deleteExpense('${expense.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ===== STATS & CHARTS =====
function updateStats() {
    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const completedItems = groceries.filter(g => g.completed).length;
    
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthExpenses = expenses
        .filter(e => new Date(e.createdAt) >= monthStart)
        .reduce((sum, e) => sum + parseFloat(e.amount), 0);
    
    document.getElementById('total-groceries').textContent = groceries.length;
    document.getElementById('total-expenses').textContent = formatCurrency(totalExpenses);
    document.getElementById('month-expenses').textContent = formatCurrency(monthExpenses);
    document.getElementById('completed-items').textContent = completedItems;
}

let expenseChart = null;

function renderChart() {
    const canvas = document.getElementById('expense-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (expenseChart) {
        expenseChart.destroy();
    }
    
    // Get last 7 days
    const days = [];
    const amounts = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        
        const dayExpenses = expenses
            .filter(e => e.createdAt.startsWith(dateStr))
            .reduce((sum, e) => sum + parseFloat(e.amount), 0);
        
        amounts.push(dayExpenses);
    }
    
    expenseChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: 'Daily Expenses',
                data: amounts,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(21, 25, 50, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#a0aec0',
                    borderColor: '#667eea',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: (context) => formatCurrency(context.parsed.y)
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(102, 126, 234, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#a0aec0',
                        callback: (value) => '$' + value
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#a0aec0'
                    }
                }
            }
        }
    });
}

// ===== ANALYTICS =====
function renderAnalytics() {
    renderCategoryChart();
    renderTrendChart();
}

function renderCategoryChart() {
    const canvas = document.getElementById('category-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const categories = {};
    expenses.forEach(expense => {
        categories[expense.category] = (categories[expense.category] || 0) + parseFloat(expense.amount);
    });
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: [
                    '#667eea',
                    '#f093fb',
                    '#4facfe',
                    '#43e97b',
                    '#feca57',
                    '#f5576c'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#a0aec0',
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

function renderTrendChart() {
    const canvas = document.getElementById('trend-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Get last 30 days
    const days = [];
    const amounts = [];
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        days.push(date.getDate());
        
        const dayExpenses = expenses
            .filter(e => e.createdAt.startsWith(dateStr))
            .reduce((sum, e) => sum + parseFloat(e.amount), 0);
        
        amounts.push(dayExpenses);
    }
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [{
                label: 'Daily Spending',
                data: amounts,
                backgroundColor: 'rgba(102, 126, 234, 0.6)',
                borderColor: '#667eea',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(102, 126, 234, 0.1)'
                    },
                    ticks: {
                        color: '#a0aec0'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#a0aec0'
                    }
                }
            }
        }
    });
}

// ===== PROFILE =====
function updateProfileStats() {
    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    document.getElementById('profile-total-groceries').textContent = groceries.length;
    document.getElementById('profile-total-expenses').textContent = formatCurrency(totalExpenses);
}

// ===== MODALS =====
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        // Reset form if exists
        const form = modal.querySelector('form');
        if (form) form.reset();
    }
}

// ===== THEME & SETTINGS =====
function toggleTheme() {
    settings.theme = settings.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', settings.theme);
    applyTheme();
}

function applyTheme() {
    const root = document.documentElement;
    if (settings.theme === 'light') {
        root.style.setProperty('--bg-primary', '#f7fafc');
        root.style.setProperty('--bg-secondary', '#edf2f7');
        root.style.setProperty('--bg-card', '#ffffff');
        root.style.setProperty('--text-primary', '#2d3748');
        root.style.setProperty('--text-secondary', '#718096');
        root.style.setProperty('--border', 'rgba(0, 0, 0, 0.1)');
        root.style.setProperty('--shadow-glow', '0 0 20px rgba(102, 126, 234, 0.2)');
    } else {
        root.style.setProperty('--bg-primary', '#0f0f23');
        root.style.setProperty('--bg-secondary', '#1a1a2e');
        root.style.setProperty('--bg-card', '#16213e');
        root.style.setProperty('--text-primary', '#ffffff');
        root.style.setProperty('--text-secondary', '#a0aec0');
        root.style.setProperty('--border', 'rgba(255, 255, 255, 0.1)');
        root.style.setProperty('--shadow-glow', '0 0 20px rgba(102, 126, 234, 0.4)');
    }
}

function setColorScheme(color) {
    settings.colorScheme = color;
    localStorage.setItem('colorScheme', color);
    
    const root = document.documentElement;
    let primary, primaryDark, secondary, shadowGlow;
    
    switch (color) {
        case 'purple': // Default
            primary = '#667eea';
            primaryDark = '#5568d3';
            secondary = '#764ba2';
            break;
        case 'blue':
            primary = '#4facfe';
            primaryDark = '#00f2fe';
            secondary = '#00c6fb';
            break;
        case 'green':
            primary = '#43e97b';
            primaryDark = '#38f9d7';
            secondary = '#2af598';
            break;
        case 'pink':
            primary = '#f093fb';
            primaryDark = '#f5576c';
            secondary = '#c471ed';
            break;
        default:
            return;
    }
    
    root.style.setProperty('--primary', primary);
    root.style.setProperty('--primary-dark', primaryDark);
    root.style.setProperty('--secondary', secondary);
    root.style.setProperty('--shadow-glow', `0 0 20px ${primary}66`);
}

// ===== DATA LOADING =====
async function loadDashboardData() {
    await Promise.all([
        loadGroceries(),
        loadExpenses()
    ]);
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize settings
    applyTheme();
    setColorScheme(settings.colorScheme);
    
    // Initialize visuals
    init3DBackground();
    initParticles();
    
    // Set initial state of toggles
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle && settings.theme === 'light') {
        // Update icon if needed
    }
    
    const threeDToggle = document.getElementById('3d-toggle');
    if (threeDToggle) threeDToggle.checked = settings.enable3D;
    
    const particlesToggle = document.getElementById('particles-toggle');
    if (particlesToggle) particlesToggle.checked = settings.enableParticles;
    
    // Set active color option
    document.querySelectorAll('.color-option').forEach(btn => {
        if (btn.dataset.color === settings.colorScheme) {
            btn.classList.add('active');
        }
    });
    
    // Auth form toggles
    document.getElementById('show-signup')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('signup-form').style.display = 'block';
    });
    
    document.getElementById('show-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('signup-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    });
    
    // Login form
    document.getElementById('login-form-element')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        await login(username, password);
    });
    
    // Signup form
    document.getElementById('signup-form-element')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('signup-username').value;
        const password = document.getElementById('signup-password').value;
        await signup(username, password);
    });
    
    // Logout
    document.getElementById('logout-btn')?.addEventListener('click', logout);
    
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.dataset.view;
            if (view) switchView(view);
        });
    });
    
    // Add grocery buttons
    ['add-grocery-btn', 'add-grocery-btn-2', 'quick-add-grocery'].forEach(id => {
        document.getElementById(id)?.addEventListener('click', () => {
            openModal('grocery-modal');
        });
    });
    
    // Add expense buttons
    ['add-expense-btn', 'add-expense-btn-2', 'quick-add-expense'].forEach(id => {
        document.getElementById(id)?.addEventListener('click', () => {
            openModal('expense-modal');
        });
    });
    
    // Grocery form
    document.getElementById('grocery-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('grocery-name').value;
        const quantity = document.getElementById('grocery-quantity').value;
        await addGrocery(name, quantity);
        e.target.reset();
    });
    
    // Expense form
    document.getElementById('expense-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const description = document.getElementById('expense-description').value;
        const amount = document.getElementById('expense-amount').value;
        const category = document.getElementById('expense-category').value;
        await addExpense(description, amount, category);
        e.target.reset();
    });
    
    // Edit profile
    document.getElementById('edit-profile-btn')?.addEventListener('click', () => {
        openModal('edit-profile-modal');
        document.getElementById('edit-name').value = userProfile.name;
        document.getElementById('edit-email').value = userProfile.email;
        document.getElementById('edit-avatar').value = userProfile.avatar;
    });
    
    document.getElementById('edit-profile-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        userProfile.name = document.getElementById('edit-name').value;
        userProfile.email = document.getElementById('edit-email').value;
        userProfile.avatar = document.getElementById('edit-avatar').value;
        updateUserDisplay();
        closeModal('edit-profile-modal');
        showToast('Profile updated!', 'success');
    });
    
    // Theme toggle
    document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
    
    // Voice command (placeholder)
    document.getElementById('voice-command')?.addEventListener('click', () => {
        showToast('Voice command feature coming soon!', 'info');
    });
    
    // Color scheme
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.color-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            setColorScheme(btn.dataset.color);
        });
    });
    
    // 3D toggle
    document.getElementById('3d-toggle')?.addEventListener('change', (e) => {
        settings.enable3D = e.target.checked;
        localStorage.setItem('enable3D', settings.enable3D);
        if (settings.enable3D) {
            init3DBackground();
        }
    });
    
    // Particles toggle
    document.getElementById('particles-toggle')?.addEventListener('change', (e) => {
        settings.enableParticles = e.target.checked;
        localStorage.setItem('enableParticles', settings.enableParticles);
        const particlesContainer = document.getElementById('particles');
        if (particlesContainer) {
            particlesContainer.innerHTML = '';
            if (settings.enableParticles) {
                initParticles();
            }
        }
    });
    
    // Modal close buttons
    document.querySelectorAll('.modal-close, [data-modal]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = btn.getAttribute('data-modal');
            if (modalId) {
                closeModal(modalId);
            }
        });
    });
    
    // Close modal on background click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Window resize for 3D
    window.addEventListener('resize', () => {
        if (renderer && camera) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
    });
    
    // Check authentication
    checkAuth();
});

// Make functions globally available
window.toggleGrocery = toggleGrocery;
window.deleteGrocery = deleteGrocery;
window.deleteExpense = deleteExpense;
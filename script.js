// ===== CONFIGURATION =====
const API_BASE = window.location.origin; // Use current domain for API calls
let authToken = localStorage.getItem('auth_token') || null;
let currentUser = null;

// ===== UTILITY FUNCTIONS =====
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function showLoading() {
    document.getElementById('loading-screen').style.display = 'flex';
}

function hideLoading() {
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('app').style.display = 'block';
    }, 1500);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount || 0);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// ===== API FUNCTIONS =====
async function apiCall(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });
        
        if (!response.ok && response.status === 401) {
            logout();
            throw new Error('Session expired. Please login again.');
        }
        
        if (response.status === 204) {
            return null;
        }
        
        return await response.json();
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
        
        if (data.token) {
            authToken = data.token;
            localStorage.setItem('auth_token', authToken);
        }
        
        currentUser = {
            id: data.id,
            username: data.username
        };
        
        showToast('Login successful!', 'success');
        showDashboard();
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
        
        if (data.token) {
            authToken = data.token;
            localStorage.setItem('auth_token', authToken);
        }
        
        currentUser = {
            id: data.id,
            username: data.username
        };
        
        showToast('Account created successfully!', 'success');
        showDashboard();
    } catch (error) {
        showToast(error.message || 'Signup failed', 'error');
    }
}

async function checkAuth() {
    if (!authToken) {
        showAuthScreen();
        hideLoading();
        return false;
    }
    
    try {
        const data = await apiCall('/api/auth/me');
        
        if (data.authenticated && data.user) {
            currentUser = data.user;
            showDashboard();
            hideLoading();
            return true;
        } else {
            showAuthScreen();
            hideLoading();
            return false;
        }
    } catch (error) {
        showAuthScreen();
        hideLoading();
        return false;
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('auth_token');
    
    apiCall('/api/auth/logout', { method: 'POST' }).catch(() => {});
    
    showAuthScreen();
    showToast('Logged out successfully', 'info');
}

function showAuthScreen() {
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('dashboard-screen').style.display = 'none';
}

function showDashboard() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('dashboard-screen').style.display = 'block';
    
    if (currentUser) {
        document.getElementById('user-name').textContent = currentUser.username || 'User';
    }
    
    loadDashboardData();
}

// ===== GROCERY FUNCTIONS =====
let groceries = [];

async function loadGroceries() {
    try {
        groceries = await apiCall('/api/groceries');
        renderGroceries();
        updateStats();
    } catch (error) {
        showToast('Failed to load groceries', 'error');
    }
}

async function addGrocery(name, quantity) {
    try {
        const newGrocery = await apiCall('/api/groceries', {
            method: 'POST',
            body: JSON.stringify({
                name,
                quantity: parseInt(quantity) || 1,
                completed: false
            })
        });
        
        groceries.push(newGrocery);
        renderGroceries();
        updateStats();
        closeModal('grocery-modal');
        showToast('Grocery item added!', 'success');
    } catch (error) {
        showToast('Failed to add grocery item', 'error');
    }
}

async function toggleGrocery(id) {
    try {
        const grocery = groceries.find(g => g.id === id);
        if (!grocery) return;
        
        const updated = await apiCall(`/api/groceries/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                ...grocery,
                completed: !grocery.completed
            })
        });
        
        groceries = groceries.map(g => g.id === id ? updated : g);
        renderGroceries();
        updateStats();
        showToast('Item updated!', 'success');
    } catch (error) {
        showToast('Failed to update item', 'error');
    }
}

async function deleteGrocery(id) {
    try {
        await apiCall(`/api/groceries/${id}`, { method: 'DELETE' });
        groceries = groceries.filter(g => g.id !== id);
        renderGroceries();
        updateStats();
        showToast('Item deleted!', 'success');
    } catch (error) {
        showToast('Failed to delete item', 'error');
    }
}

function renderGroceries() {
    const container = document.getElementById('grocery-list');
    
    if (groceries.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-basket"></i>
                <p>No grocery items yet</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = groceries.map(item => `
        <div class="item ${item.completed ? 'completed' : ''}">
            <div class="item-info">
                <div class="item-name">${escapeHtml(item.name)}</div>
                <div class="item-details">Quantity: ${item.quantity || 1}</div>
            </div>
            <div class="item-actions">
                <button class="item-btn btn-complete" onclick="toggleGrocery('${item.id}')" title="Toggle Complete">
                    <i class="fas ${item.completed ? 'fa-undo' : 'fa-check'}"></i>
                </button>
                <button class="item-btn btn-delete" onclick="deleteGrocery('${item.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// ===== EXPENSE FUNCTIONS =====
let expenses = [];

async function loadExpenses() {
    try {
        expenses = await apiCall('/api/expenses');
        renderExpenses();
        updateStats();
        renderChart();
    } catch (error) {
        showToast('Failed to load expenses', 'error');
    }
}

async function addExpense(description, amount, category) {
    try {
        const newExpense = await apiCall('/api/expenses', {
            method: 'POST',
            body: JSON.stringify({
                description,
                amount: parseFloat(amount),
                category
            })
        });
        
        expenses.push(newExpense);
        renderExpenses();
        updateStats();
        renderChart();
        closeModal('expense-modal');
        showToast('Expense added!', 'success');
    } catch (error) {
        showToast('Failed to add expense', 'error');
    }
}

async function deleteExpense(id) {
    try {
        await apiCall(`/api/expenses/${id}`, { method: 'DELETE' });
        expenses = expenses.filter(e => e.id !== id);
        renderExpenses();
        updateStats();
        renderChart();
        showToast('Expense deleted!', 'success');
    } catch (error) {
        showToast('Failed to delete expense', 'error');
    }
}

function renderExpenses() {
    const container = document.getElementById('expense-list');
    
    if (expenses.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-wallet"></i>
                <p>No expenses yet</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = expenses.map(item => `
        <div class="item">
            <div class="item-info">
                <div class="item-name">${escapeHtml(item.description || 'Expense')}</div>
                <div class="item-details">
                    ${item.category || 'Uncategorized'} • ${formatDate(item.createdAt)}
                </div>
            </div>
            <div class="item-info" style="text-align: right;">
                <div class="item-name">${formatCurrency(item.amount)}</div>
                <button class="item-btn btn-delete" onclick="deleteExpense('${item.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// ===== STATS & CHART =====
function updateStats() {
    // Total groceries
    document.getElementById('total-groceries').textContent = groceries.length;
    
    // Total expenses
    const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    document.getElementById('total-expenses').textContent = formatCurrency(totalExpenses);
    
    // This month expenses
    const now = new Date();
    const thisMonth = expenses.filter(e => {
        const expenseDate = new Date(e.createdAt);
        return expenseDate.getMonth() === now.getMonth() && 
               expenseDate.getFullYear() === now.getFullYear();
    });
    const monthTotal = thisMonth.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    document.getElementById('month-expenses').textContent = formatCurrency(monthTotal);
    
    // Completed items
    const completed = groceries.filter(g => g.completed).length;
    document.getElementById('completed-items').textContent = completed;
}

let expenseChart = null;

function renderChart() {
    const canvas = document.getElementById('expense-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart
    if (expenseChart) {
        expenseChart.destroy();
    }
    
    // Group expenses by category
    const categoryData = {};
    expenses.forEach(expense => {
        const category = expense.category || 'Other';
        categoryData[category] = (categoryData[category] || 0) + parseFloat(expense.amount || 0);
    });
    
    const categories = Object.keys(categoryData);
    const amounts = Object.values(categoryData);
    
    if (categories.length === 0) {
        categories.push('No Data');
        amounts.push(0);
    }
    
    const colors = [
        'rgba(102, 126, 234, 0.8)',
        'rgba(118, 75, 162, 0.8)',
        'rgba(240, 147, 251, 0.8)',
        'rgba(245, 87, 108, 0.8)',
        'rgba(67, 233, 123, 0.8)',
        'rgba(74, 172, 254, 0.8)',
        'rgba(254, 202, 87, 0.8)'
    ];
    
    expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: amounts,
                backgroundColor: colors,
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
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${formatCurrency(context.parsed)}`;
                        }
                    }
                }
            }
        }
    });
}

// ===== MODAL FUNCTIONS =====
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
        // Reset forms
        const form = modal.querySelector('form');
        if (form) form.reset();
    }
}

// ===== UTILITY =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== DASHBOARD DATA =====
async function loadDashboardData() {
    await Promise.all([
        loadGroceries(),
        loadExpenses()
    ]);
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
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
    
    // Logout button
    document.getElementById('logout-btn')?.addEventListener('click', logout);
    
    // Add grocery button
    document.getElementById('add-grocery-btn')?.addEventListener('click', () => {
        openModal('grocery-modal');
    });
    
    // Add expense button
    document.getElementById('add-expense-btn')?.addEventListener('click', () => {
        openModal('expense-modal');
    });
    
    // Grocery form
    document.getElementById('grocery-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('grocery-name').value;
        const quantity = document.getElementById('grocery-quantity').value;
        await addGrocery(name, quantity);
    });
    
    // Expense form
    document.getElementById('expense-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const description = document.getElementById('expense-description').value;
        const amount = document.getElementById('expense-amount').value;
        const category = document.getElementById('expense-category').value;
        await addExpense(description, amount, category);
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
    
    // Check authentication on load
    checkAuth();
});

// Make functions globally available
window.toggleGrocery = toggleGrocery;
window.deleteGrocery = deleteGrocery;
window.deleteExpense = deleteExpense;
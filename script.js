const { useState, useEffect } = React;
const { jsPDF } = window.jspdf;
const API_BASE = window.API_BASE_URL || 'http://localhost:8080';

// Simple JWT storage helpers
function getToken() {
    try { return localStorage.getItem('jwt_token') || null; } catch { return null; }
}
function setToken(token) {
    try { if (token) localStorage.setItem('jwt_token', token); } catch {}
}
function clearToken() {
    try { localStorage.removeItem('jwt_token'); } catch {}
}
function authHeaders(extra = {}) {
    const token = getToken();
    return token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };
}

// Main App Component
function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [user, setUser] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/api/auth/me`, { headers: authHeaders() });
                if (res.ok) {
                    const data = await res.json();
                    if (data.authenticated) {
                        const username = data.user?.username || data.user?.id || 'user';
                        setUser({
                            name: username,
                            email: username,
                            avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
                        });
                        setIsAuthenticated(true);
                    } else {
                        setIsAuthenticated(false);
                    }
                } else {
                    setIsAuthenticated(false);
                }
            } catch (e) {
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const handleLogin = async (username, password, mode = 'login') => {
        try {
            const endpoint = mode === 'signup' ? `${API_BASE}/api/auth/signup` : `${API_BASE}/api/auth/login`;
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: authHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ username, password })
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: 'Authentication failed' }));
                throw new Error(err.error || 'Authentication failed');
            }
            const data = await res.json();
            if (data.token) setToken(data.token);
            const uname = data.username || data.id || username;
            setUser({
                name: uname,
                email: uname,
                avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
            });
            setIsAuthenticated(true);
        } catch (ex) {
            alert(ex.message || 'Authentication failed');
            setIsAuthenticated(false);
        }
    };

    const handleLogout = async () => {
        try { await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', headers: authHeaders() }); } catch {}
        clearToken();
        setIsAuthenticated(false);
        setUser(null);
    };

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const toggleMobileSidebar = () => {
        setMobileSidebarOpen(!mobileSidebarOpen);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <LoginPage onLogin={handleLogin} />;
    }

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <Sidebar 
                collapsed={sidebarCollapsed} 
                mobileOpen={mobileSidebarOpen}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={handleLogout}
                toggleSidebar={toggleSidebar}
                user={user}
                toggleMobileSidebar={toggleMobileSidebar}
            />
            
            {/* Main Content */}
            <div className={`main-content flex-1 overflow-auto ${sidebarCollapsed ? 'expanded' : ''}`}>
                {/* Top Navigation */}
                <TopNav 
                    toggleSidebar={toggleSidebar} 
                    toggleMobileSidebar={toggleMobileSidebar}
                    user={user}
                    onLogout={handleLogout}
                />
                
                {/* Page Content */}
                <div className="p-4 md:p-6">
                    {activeTab === 'dashboard' && <Dashboard />}
                    {activeTab === 'grocery-list' && <GroceryList />}
                    {activeTab === 'expenses' && <ExpenseTracker />}
                    {activeTab === 'history' && <PurchaseHistory />}
                    {activeTab === 'settings' && <Settings />}
                </div>
            </div>
        </div>
    );
}

// Login Page Component
function LoginPage({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mode, setMode] = useState('login'); // 'login' | 'signup'

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div>
                    <img
                        className="mx-auto h-12 w-auto"
                        src="https://cdn.jsdelivr.net/npm/@mdi/svg/svg/cart-outline.svg"
                        alt="Smart Grocery"
                        onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src='https://cdn.jsdelivr.net/npm/@mdi/svg/svg/cart-heart.svg'; }}
                    />
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={(e)=>{ e.preventDefault(); onLogin(email, password, mode); }}>
                    <input type="hidden" name="remember" value="true" />
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Username</label>
                            <input
                                id="email-address"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Username"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <span className="text-gray-400 text-sm">&nbsp;</span>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {mode === 'login' ? 'Sign in' : 'Sign up'}
                        </button>
                    </div>
                </form>
                <div className="text-center text-sm text-gray-600">
                    {mode === 'login' ? (
                        <>
                            Don't have an account?{' '}
                            <button onClick={()=>setMode('signup')} className="font-medium text-indigo-600 hover:text-indigo-500">Sign up</button>
                        </>
                    ) : (
                        <>
                            Already have an account?{' '}
                            <button onClick={()=>setMode('login')} className="font-medium text-indigo-600 hover:text-indigo-500">Sign in</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// Sidebar Component
function Sidebar({ collapsed, mobileOpen, activeTab, setActiveTab, onLogout, toggleSidebar, user, toggleMobileSidebar }) {
    return (
        <div className={`sidebar bg-indigo-800 text-white ${collapsed ? 'collapsed' : 'w-64'} ${mobileOpen ? 'open' : ''} md:relative fixed h-full z-40`}>
            <div className="p-4 flex items-center justify-between border-b border-indigo-700">
                {!collapsed && (
                    <div className="flex items-center">
                        <i className="fas fa-shopping-basket text-2xl mr-2"></i>
                        <span className="logo-text text-xl font-bold">Smart Grocery</span>
                    </div>
                )}
                {collapsed && (
                    <div className="flex items-center justify-center w-full">
                        <i className="fas fa-shopping-basket text-2xl"></i>
                    </div>
                )}
                <button 
                    onClick={toggleSidebar}
                    className="md:block hidden text-gray-300 hover:text-white focus:outline-none"
                >
                    <i className={`fas ${collapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
                </button>
            </div>
            
            {user && (
                <div className="p-4 border-b border-indigo-700">
                    <div className="flex items-center">
                        <img 
                            src={user.avatar} 
                            alt="User" 
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        {!collapsed && (
                            <div className="ml-3">
                                <p className="text-sm font-medium">{user.name}</p>
                                <p className="text-xs text-indigo-200">{user.email}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            <nav className="p-2">
                <ul className="space-y-1">
                    <li>
                        <button
                            onClick={() => { setActiveTab('dashboard'); toggleMobileSidebar(); }}
                            className={`nav-item flex items-center w-full p-3 rounded-lg ${activeTab === 'dashboard' ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
                        >
                            <i className="fas fa-home text-lg"></i>
                            <span className="sidebar-text ml-3">Dashboard</span>
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => { setActiveTab('grocery-list'); toggleMobileSidebar(); }}
                            className={`nav-item flex items-center w-full p-3 rounded-lg ${activeTab === 'grocery-list' ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
                        >
                            <i className="fas fa-list text-lg"></i>
                            <span className="sidebar-text ml-3">Grocery List</span>
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => { setActiveTab('expenses'); toggleMobileSidebar(); }}
                            className={`nav-item flex items-center w-full p-3 rounded-lg ${activeTab === 'expenses' ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
                        >
                            <i className="fas fa-chart-pie text-lg"></i>
                            <span className="sidebar-text ml-3">Expense Tracker</span>
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => { setActiveTab('history'); toggleMobileSidebar(); }}
                            className={`nav-item flex items-center w-full p-3 rounded-lg ${activeTab === 'history' ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
                        >
                            <i className="fas fa-history text-lg"></i>
                            <span className="sidebar-text ml-3">Purchase History</span>
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => { setActiveTab('settings'); toggleMobileSidebar(); }}
                            className={`nav-item flex items-center w-full p-3 rounded-lg ${activeTab === 'settings' ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
                        >
                            <i className="fas fa-cog text-lg"></i>
                            <span className="sidebar-text ml-3">Settings</span>
                        </button>
                    </li>
                </ul>
            </nav>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-indigo-700">
                <button
                    onClick={onLogout}
                    className="nav-item flex items-center w-full p-3 rounded-lg hover:bg-indigo-700"
                >
                    <i className="fas fa-sign-out-alt text-lg"></i>
                    <span className="sidebar-text ml-3">Logout</span>
                </button>
            </div>
        </div>
    );
}

// Top Navigation Component
function TopNav({ toggleSidebar, toggleMobileSidebar, user, onLogout }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <div className="bg-white shadow-sm sticky top-0 z-10">
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center">
                    <button 
                        onClick={toggleMobileSidebar}
                        className="md:hidden text-gray-500 hover:text-gray-600 focus:outline-none"
                    >
                        <i className="fas fa-bars text-xl"></i>
                    </button>
                    <button 
                        onClick={toggleSidebar}
                        className="hidden md:block text-gray-500 hover:text-gray-600 focus:outline-none ml-2"
                    >
                        <i className="fas fa-bars text-xl"></i>
                    </button>
                </div>
                
                <div className="flex items-center space-x-4">
                    <button className="text-gray-500 hover:text-gray-600 focus:outline-none">
                        <i className="fas fa-bell text-xl"></i>
                    </button>
                    <div className="relative">
                        <button 
                            className="flex items-center space-x-2 focus:outline-none"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                            <img 
                                src={user.avatar} 
                                alt="User" 
                                className="w-8 h-8 rounded-full object-cover"
                            />
                            <span className="hidden md:block text-sm font-medium">{user.name}</span>
                            <i className={`fas fa-chevron-down hidden md:block text-xs transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}></i>
                        </button>
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                                <button 
                                    onClick={onLogout}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Dashboard Component
function Dashboard() {
    const [stats, setStats] = useState([
        { title: 'Monthly Budget', value: '$0', change: '0%', trend: 'up', icon: 'fa-wallet' },
        { title: 'Spent This Month', value: '$0', change: '0%', trend: 'down', icon: 'fa-money-bill-wave' },
        { title: 'Items Purchased', value: '0', change: '0%', trend: 'up', icon: 'fa-shopping-cart' },
        { title: 'Savings', value: '$0', change: '0%', trend: 'up', icon: 'fa-piggy-bank' }
    ]);

    const [recentItems, setRecentItems] = useState([]);

    useEffect(() => {
        const setupChart = () => {
            const ctx = document.getElementById('expenseChart');
            if (ctx) {
                const chart = new Chart(ctx.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        datasets: [{
                            label: 'Grocery Expenses',
                            data: [320, 290, 350, 410, 380, 420],
                            backgroundColor: 'rgba(79, 70, 229, 0.7)',
                            borderColor: 'rgba(79, 70, 229, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
                return () => chart.destroy();
            }
        };
        return setupChart();
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                <p className="text-2xl font-semibold text-gray-800">{stat.value}</p>
                                <p className={`text-sm ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                    {stat.change} from last month
                                </p>
                            </div>
                            <div className={`p-3 rounded-full ${stat.trend === 'up' ? 'bg-green-100' : 'bg-red-100'}`}>
                                <i className={`fas ${stat.icon} ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}></i>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Charts and Recent Items */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Monthly Expenses</h2>
                        <select className="bg-gray-100 border border-gray-300 text-gray-700 py-1 px-3 rounded-md text-sm">
                            <option>Last 6 Months</option>
                            <option>Last Year</option>
                            <option>All Time</option>
                        </select>
                    </div>
                    <div className="chart-container">
                        <canvas id="expenseChart"></canvas>
                    </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Purchases</h2>
                    <div className="space-y-3">
                        {recentItems.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                <div>
                                    <p className="font-medium text-gray-800">{item.name}</p>
                                    <p className="text-sm text-gray-500">{item.category}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-gray-800">${item.price.toFixed(2)}</p>
                                    <p className="text-sm text-gray-500">{item.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="mt-4 w-full py-2 bg-indigo-50 text-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-100">
                        View All Purchases
                    </button>
                </div>
            </div>
            
            {/* Categories Breakdown */}
            <div className="mt-6 bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Spending by Category</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {['Produce', 'Dairy', 'Meat', 'Bakery', 'Frozen', 'Snacks'].map((category, index) => (
                        <div key={index} className="text-center">
                            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <i className="fas fa-utensils text-indigo-600 text-xl"></i>
                            </div>
                            <p className="font-medium text-gray-800">{category}</p>
                            <p className="text-sm text-gray-500">${Math.floor(Math.random() * 100) + 50}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Grocery List Component
function GroceryList() {
    const [items, setItems] = useState([]);
    
    const [newItem, setNewItem] = useState({
        name: '',
        category: 'Produce',
        price: '',
        quantity: 1
    });
    
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [categories] = useState(['Produce', 'Dairy', 'Meat', 'Bakery', 'Frozen', 'Snacks', 'Beverages', 'Canned Goods']);
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewItem(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Show suggestions when typing in name field
        if (name === 'name' && value.length > 1) {
            const filtered = ['Milk', 'Bread', 'Eggs', 'Apples', 'Chicken', 'Rice', 'Pasta', 'Cheese']
                .filter(item => item.toLowerCase().includes(value.toLowerCase()));
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else if (name !== 'name') {
            setShowSuggestions(false);
        }
    };
    
    const handleSuggestionClick = (suggestion) => {
        setNewItem(prev => ({
            ...prev,
            name: suggestion
        }));
        setShowSuggestions(false);
    };
    
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/api/groceries`, { headers: authHeaders() });
                if (res.ok) {
                    const data = await res.json();
                    setItems(Array.isArray(data) ? data : []);
                }
            } catch {}
        })();
    }, []);

    const addItem = async (e) => {
        e.preventDefault();
        if (!newItem.name) return;
        const payload = {
            name: newItem.name,
            category: newItem.category,
            price: parseFloat(newItem.price) || 0,
            quantity: parseInt(newItem.quantity) || 1,
            purchased: false
        };
        try {
            const res = await fetch(`${API_BASE}/api/groceries`, {
                method: 'POST',
                headers: authHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const saved = await res.json();
                setItems([...items, saved]);
                setNewItem({ name: '', category: 'Produce', price: '', quantity: 1 });
            }
        } catch {}
    };
    
    const togglePurchased = async (id) => {
        const target = items.find(i => i.id === id);
        if (!target) return;
        const updated = { ...target, purchased: !target.purchased };
        try {
            const res = await fetch(`${API_BASE}/api/groceries/${id}`, {
                method: 'PUT',
                headers: authHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify(updated)
            });
            if (res.ok) {
                const saved = await res.json();
                setItems(items.map(it => it.id === id ? saved : it));
            }
        } catch {}
    };
    
    const removeItem = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/api/groceries/${id}`, { method: 'DELETE', headers: authHeaders() });
            if (res.status === 204) setItems(items.filter(item => item.id !== id));
        } catch {}
    };
    
    const exportToPDF = () => {
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 40;
        let y = margin;

        const currency = (n) => `$${Number(n || 0).toFixed(2)}`;

        // Header
        const drawHeader = () => {
            doc.setFillColor(79, 70, 229);
            doc.rect(0, 0, pageWidth, 80, 'F');
            doc.setFontSize(20);
            doc.setTextColor(255, 255, 255);
            doc.text('Grocery List', margin, 50);
            doc.setFontSize(10);
            const dateStr = new Date().toLocaleString();
            doc.text(dateStr, pageWidth - margin - 150, 50);
        };

        const drawFooter = () => {
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(10);
                doc.setTextColor(120, 120, 120);
                doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 80, pageHeight - 20);
            }
        };

        // Table helpers
        const wrapText = (text, maxWidth) => {
            const words = String(text || '').split(/\s+/);
            const lines = [];
            let line = '';
            words.forEach((w) => {
                const test = line ? `${line} ${w}` : w;
                if (doc.getTextWidth(test) > maxWidth) {
                    if (line) lines.push(line);
                    line = w;
                } else {
                    line = test;
                }
            });
            if (line) lines.push(line);
            return lines;
        };

        const ensureSpace = (needed) => {
            if (y + needed > pageHeight - 60) {
                doc.addPage();
                drawHeader();
                y = 100;
            }
        };

        drawHeader();
        y = 100;
        doc.setTextColor(33, 37, 41);
        doc.setFontSize(12);

        const drawSection = (title, rows) => {
            if (rows.length === 0) return;
            // Section title with bar
            ensureSpace(40);
            doc.setFillColor(229, 231, 235);
            doc.rect(margin, y, pageWidth - margin * 2, 28, 'F');
            doc.setTextColor(79, 70, 229);
            doc.setFontSize(14);
            doc.text(title, margin + 10, y + 19);
            y += 36;

            // Columns: Name (flex), Qty (60), Unit (80), Total (80)
            const qtyW = 60, unitW = 80, totalW = 80;
            const tableW = pageWidth - margin * 2;
            const nameW = tableW - (qtyW + unitW + totalW);
            const xName = margin, xQty = xName + nameW, xUnit = xQty + qtyW, xTotal = xUnit + unitW;

            // Header row
            ensureSpace(28);
            doc.setFillColor(249, 250, 251);
            doc.setDrawColor(229, 231, 235);
            doc.rect(margin, y, tableW, 24, 'F');
            doc.setTextColor(55, 65, 81);
            doc.setFontSize(11);
            doc.text('Item', xName + 8, y + 16);
            doc.text('Qty', xQty + 8, y + 16);
            doc.text('Unit', xUnit + 8, y + 16);
            doc.text('Total', xTotal + 8, y + 16);
            y += 24;

            // Rows
            doc.setTextColor(17, 24, 39);
            let sectionTotal = 0;
            rows.forEach((it, idx) => {
                const total = (it.price * it.quantity) || 0;
                sectionTotal += total;
                const nameLines = wrapText(it.name || '', nameW - 16);
                const rowH = Math.max(22, nameLines.length * 14 + 8);
                ensureSpace(rowH);
                // Alternate background
                if (idx % 2 === 0) doc.setFillColor(255, 255, 255); else doc.setFillColor(250, 250, 250);
                doc.rect(margin, y, tableW, rowH, 'F');
                // Name
                let ly = y + 16;
                nameLines.forEach(line => { doc.text(line, xName + 8, ly); ly += 14; });
                // Qty, Unit, Total (right-aligned within their cells)
                const textY = y + 16;
                const alignRight = (text, xRight) => {
                    const w = doc.getTextWidth(text);
                    doc.text(text, xRight - 8 - w, textY);
                };
                alignRight(String(it.quantity || 0), xQty + qtyW);
                alignRight(currency(it.price), xUnit + unitW);
                alignRight(currency(total), xTotal + totalW);
                y += rowH;
            });

            // Section subtotal
            ensureSpace(26);
            doc.setFontSize(12);
            doc.setTextColor(55, 65, 81);
            const label = 'Subtotal:';
            const value = currency(sectionTotal);
            const lw = doc.getTextWidth(label);
            const vw = doc.getTextWidth(value);
            doc.text(label, xTotal + totalW - 8 - (lw + vw + 8), y + 16);
            doc.text(value, xTotal + totalW - 8 - vw, y + 16);
            y += 28;
        };

        const pendingItems = items.filter(item => !item.purchased);
        const purchasedItems = items.filter(item => item.purchased);

        if (pendingItems.length === 0 && purchasedItems.length === 0) {
            ensureSpace(60);
            doc.setTextColor(120, 120, 120);
            doc.text('No items to show. Add items to your grocery list to export.', margin, y + 12);
        } else {
            drawSection('To Buy', pendingItems);
            drawSection('Purchased', purchasedItems);
        }

        // Summary card (invoice-style)
        const grandTotal = items.reduce((s, it) => s + (it.price * it.quantity || 0), 0);
        const toBuyTotal = pendingItems.reduce((s, it) => s + (it.price * it.quantity || 0), 0);
        const purchasedTotal = purchasedItems.reduce((s, it) => s + (it.price * it.quantity || 0), 0);

        const cardW = pageWidth - margin * 2;
        const cardH = 120;
        ensureSpace(cardH + 20);

        // Card background
        doc.setDrawColor(221, 221, 221);
        doc.setFillColor(255, 255, 255);
        doc.rect(margin, y, cardW, cardH, 'F');

        // Title bar
        doc.setFillColor(240, 240, 255);
        doc.rect(margin, y, cardW, 30, 'F');
        doc.setTextColor(79, 70, 229);
        doc.setFontSize(13);
        doc.text('Summary', margin + 12, y + 20);

        // Two-column layout inside card
        const pad = 14;
        const innerY = y + 30;
        const innerH = cardH - 30;
        const colGap = 16;
        const colW = (cardW - pad * 2 - colGap) / 2;

        // Left column entries
        const leftX = margin + pad;
        const rightX = leftX + colW + colGap;
        const lineH = 20;
        let ly = innerY + 18;
        let ry = innerY + 18;

        const drawRow = (label, value, xLabel, xValue, baseY) => {
            doc.setFontSize(11);
            doc.setTextColor(107, 114, 128);
            doc.text(label, xLabel, baseY);
            doc.setTextColor(17, 24, 39);
            const v = String(value);
            const vw = doc.getTextWidth(v);
            doc.text(v, xValue + colW - vw, baseY);
        };

        // Left col
        drawRow('Items to buy', String(pendingItems.length), leftX, leftX, ly); ly += lineH;
        drawRow('Purchased items', String(purchasedItems.length), leftX, leftX, ly); ly += lineH;

        // Right col
        drawRow('To buy subtotal', currency(toBuyTotal), rightX, rightX, ry); ry += lineH;
        drawRow('Purchased subtotal', currency(purchasedTotal), rightX, rightX, ry); ry += lineH;

        // Divider line above grand total
        const gtY = y + cardH - 24;
        doc.setDrawColor(229, 231, 235);
        doc.line(margin + pad, gtY - 12, margin + cardW - pad, gtY - 12);

        // Grand total (bold, right aligned)
        doc.setFontSize(12);
        doc.setTextColor(75, 85, 99);
        const gtLabel = 'Grand total';
        const gtValue = currency(grandTotal);
        const gtLabelW = doc.getTextWidth(gtLabel);
        const gtValueW = doc.getTextWidth(gtValue);
        const gtRight = margin + cardW - pad;
        doc.text(gtLabel, gtRight - (gtLabelW + gtValueW + 12), gtY);
        doc.setFontSize(14);
        doc.setTextColor(17, 24, 39);
        doc.text(gtValue, gtRight - gtValueW, gtY);

        y += cardH + 20;

        drawFooter();
        doc.save('grocery-list.pdf');
    };
    
    const totalCost = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const purchasedItems = items.filter(item => item.purchased);
    const pendingItems = items.filter(item => !item.purchased);

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Grocery List</h1>
                <button 
                    onClick={exportToPDF}
                    className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                    <i className="fas fa-file-pdf mr-2"></i>
                    Export as PDF
                </button>
            </div>
            
            {/* Add Item Form */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Item</h2>
                <form onSubmit={addItem} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={newItem.name}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter item name"
                            required
                        />
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="autocomplete-dropdown absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                                {suggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => handleSuggestionClick(suggestion)}
                                    >
                                        {suggestion}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            id="category"
                            name="category"
                            value={newItem.category}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {categories.map((category, index) => (
                                <option key={index} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={newItem.price}
                                onChange={handleInputChange}
                                className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input
                            type="number"
                            id="quantity"
                            name="quantity"
                            value={newItem.quantity}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            min="1"
                        />
                    </div>
                    
                    <div className="md:col-span-4">
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Add to List
                        </button>
                    </div>
                </form>
            </div>
            
            {/* Grocery List */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Your Grocery List</h2>
                    <div className="text-lg font-medium text-gray-800">
                        Total: <span className="text-indigo-600">${totalCost.toFixed(2)}</span>
                    </div>
                </div>
                
                {items.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <i className="fas fa-shopping-basket text-4xl mb-2"></i>
                        <p>Your grocery list is empty</p>
                        <p className="text-sm">Add items to get started</p>
                    </div>
                ) : (
                    <div>
                        {/* Pending Items */}
                        {pendingItems.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-md font-medium text-gray-700 mb-2">To Buy ({pendingItems.length})</h3>
                                <div className="divide-y divide-gray-200">
                                    {pendingItems.map(item => (
                                        <div key={item.id} className="py-3 flex items-center justify-between">
                                            <div className="flex items-center">
                                                <button
                                                    onClick={() => togglePurchased(item.id)}
                                                    className="w-5 h-5 border border-gray-300 rounded mr-3 flex items-center justify-center hover:border-indigo-500"
                                                >
                                                    {item.purchased && <i className="fas fa-check text-indigo-600 text-xs"></i>}
                                                </button>
                                                <div>
                                                    <p className="font-medium text-gray-800">{item.name}</p>
                                                    <p className="text-sm text-gray-500">{item.category}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-gray-800 mr-4">
                                                    {item.quantity} × ${item.price.toFixed(2)} = ${(item.quantity * item.price).toFixed(2)}
                                                </span>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Purchased Items */}
                        {purchasedItems.length > 0 && (
                            <div>
                                <h3 className="text-md font-medium text-gray-700 mb-2">Purchased ({purchasedItems.length})</h3>
                                <div className="divide-y divide-gray-200">
                                    {purchasedItems.map(item => (
                                        <div key={item.id} className="py-3 flex items-center justify-between opacity-70">
                                            <div className="flex items-center">
                                                <button
                                                    onClick={() => togglePurchased(item.id)}
                                                    className="w-5 h-5 border border-indigo-500 bg-indigo-100 rounded mr-3 flex items-center justify-center"
                                                >
                                                    <i className="fas fa-check text-indigo-600 text-xs"></i>
                                                </button>
                                                <div>
                                                    <p className="font-medium text-gray-800 line-through">{item.name}</p>
                                                    <p className="text-sm text-gray-500">{item.category}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-gray-800 mr-4">
                                                    {item.quantity} × ${item.price.toFixed(2)} = ${(item.quantity * item.price).toFixed(2)}
                                                </span>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// Expense Tracker Component
function ExpenseTracker() {
    const [timeRange, setTimeRange] = useState('month');
    const [expenses, setExpenses] = useState([]);
    
    const [budget, setBudget] = useState(500);
    const [newExpense, setNewExpense] = useState({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        store: '',
        items: ''
    });

    const [editBudgetItem, setEditBudgetItem] = useState(false);
    const [tempBudget, setTempBudget] = useState(budget);
    
    useEffect(() => {
        const setupChart = () => {
            const ctx = document.getElementById('categoryChart');
            if (ctx) {
                const chart = new Chart(ctx.getContext('2d'), {
                    type: 'pie',
                    data: {
                        labels: ['Produce', 'Dairy', 'Meat', 'Bakery', 'Frozen', 'Snacks'],
                        datasets: [{
                            data: [85, 65, 45, 30, 25, 40],
                            backgroundColor: [
                                'rgba(79, 70, 229, 0.7)',
                                'rgba(99, 102, 241, 0.7)',
                                'rgba(129, 140, 248, 0.7)',
                                'rgba(167, 139, 250, 0.7)',
                                'rgba(196, 181, 253, 0.7)',
                                'rgba(224, 231, 255, 0.7)'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                });
                return () => chart.destroy();
            }
        };
        return setupChart();
    }, []);
    
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/api/expenses`, { headers: authHeaders() });
                if (res.ok) {
                    const data = await res.json();
                    setExpenses(Array.isArray(data) ? data : []);
                }
            } catch {}
        })();
    }, []);

    const addExpense = async (e) => {
        e.preventDefault();
        if (!newExpense.amount || !newExpense.store) return;
        const payload = {
            date: newExpense.date,
            amount: parseFloat(newExpense.amount),
            store: newExpense.store,
            items: parseInt(newExpense.items) || 0
        };
        try {
            const res = await fetch(`${API_BASE}/api/expenses`, {
                method: 'POST',
                headers: authHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const saved = await res.json();
                setExpenses([saved, ...expenses]);
                setNewExpense({ date: new Date().toISOString().split('T')[0], amount: '', store: '', items: '' });
            }
        } catch {}
    };
    
    const removeExpense = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/api/expenses/${id}`, { method: 'DELETE', headers: authHeaders() });
            if (res.status === 204) setExpenses(expenses.filter(expense => expense.id !== id));
        } catch {}
    };

    const handleBudgetChange = () => {
        setBudget(parseFloat(tempBudget) || 0);
        setEditBudgetItem(false);
    };
    
    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const remainingBudget = budget - totalSpent;
    const percentageSpent = (totalSpent / budget) * 100;

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Expense Tracker</h1>
            
            {/* Budget Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-4 rounded-lg shadow col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Monthly Budget</h2>
                        <div className="flex items-center space-x-2">
                            <select 
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className="bg-gray-100 border border-gray-300 text-gray-700 py-1 px-3 rounded-md text-sm"
                            >
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="year">This Year</option>
                            </select>
                            <button 
                                onClick={() => {
                                    setEditBudgetItem(!editBudgetItem);
                                    setTempBudget(budget);
                                }}
                                className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700"
                            >
                                <i className="fas fa-edit mr-1"></i> Edit
                            </button>
                        </div>
                    </div>
                    
                    {editBudgetItem ? (
                        <div className="flex space-x-2 mb-4">
                            <input 
                                type="number"
                                value={tempBudget}
                                onChange={(e) => setTempBudget(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <button onClick={handleBudgetChange} className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700">
                                Save
                            </button>
                        </div>
                    ) : (
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">Spent: ${totalSpent.toFixed(2)}</span>
                                <span className="text-sm font-medium text-gray-700">Remaining: ${remainingBudget.toFixed(2)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                    className="bg-indigo-600 h-2.5 rounded-full" 
                                    style={{ width: `${Math.min(percentageSpent, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-sm text-gray-500">Budget</p>
                            <p className="text-xl font-semibold text-gray-800">${budget.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Spent</p>
                            <p className="text-xl font-semibold text-red-500">${totalSpent.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Remaining</p>
                            <p className={`text-xl font-semibold ${remainingBudget >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                ${remainingBudget.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Spending by Category</h2>
                    <div className="chart-container">
                        <canvas id="categoryChart"></canvas>
                    </div>
                </div>
            </div>
            
            {/* Add Expense Form */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Expense</h2>
                <form onSubmit={addExpense} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={newExpense.date}
                            onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                                type="number"
                                id="amount"
                                name="amount"
                                value={newExpense.amount}
                                onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                                className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                required
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="store" className="block text-sm font-medium text-gray-700 mb-1">Store</label>
                        <input
                            type="text"
                            id="store"
                            name="store"
                            value={newExpense.store}
                            onChange={(e) => setNewExpense({...newExpense, store: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Store name"
                            required
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="items" className="block text-sm font-medium text-gray-700 mb-1">Items</label>
                        <input
                            type="number"
                            id="items"
                            name="items"
                            value={newExpense.items}
                            onChange={(e) => setNewExpense({...newExpense, items: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Number of items"
                            min="0"
                        />
                    </div>
                    
                    <div className="md:col-span-4">
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Add Expense
                        </button>
                    </div>
                </form>
            </div>
            
            {/* Expense List */}
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Recent Expenses</h2>
                    <div className="text-lg font-medium text-gray-800">
                        Total: <span className="text-indigo-600">${totalSpent.toFixed(2)}</span>
                    </div>
                </div>
                
                {expenses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <i className="fas fa-receipt text-4xl mb-2"></i>
                        <p>No expenses recorded yet</p>
                        <p className="text-sm">Add your grocery expenses to track spending</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {expenses.map(expense => (
                                    <tr key={expense.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.store}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.items}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-500">${expense.amount.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => removeExpense(expense.id)}
                                                className="text-red-600 hover:text-red-900 mr-3"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                            <button className="text-indigo-600 hover:text-indigo-900">
                                                <i className="fas fa-edit"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

// Purchase History Component
function PurchaseHistory() {
    const [purchases, setPurchases] = useState([]);
    
    const [timeRange, setTimeRange] = useState('month');
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    
    useEffect(() => {
        const setupChart = () => {
            const ctx = document.getElementById('trendChart');
            if (ctx) {
                const chart = new Chart(ctx.getContext('2d'), {
                    type: 'line',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                        datasets: [{
                            label: 'Monthly Spending',
                            data: [150, 210, 180, 250, 300],
                            borderColor: 'rgba(79, 70, 229, 1)',
                            backgroundColor: 'rgba(79, 70, 229, 0.2)',
                            fill: true,
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                });
                return () => chart.destroy();
            }
        };
        return setupChart();
    }, []);
    
    const totalSpent = purchases.reduce((sum, purchase) => sum + purchase.total, 0);
    const averagePurchase = purchases.length > 0 ? totalSpent / purchases.length : 0;

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Purchase History</h1>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-sm text-gray-500">Total Purchases</p>
                    <p className="text-2xl font-semibold text-gray-800">{purchases.length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-sm text-gray-500">Total Spent</p>
                    <p className="text-2xl font-semibold text-red-500">${totalSpent.toFixed(2)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-sm text-gray-500">Average Purchase</p>
                    <p className="text-2xl font-semibold text-indigo-500">${averagePurchase.toFixed(2)}</p>
                </div>
            </div>
            
            {/* Purchase List */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Your Purchases</h2>
                    <select 
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="bg-gray-100 border border-gray-300 text-gray-700 py-1 px-3 rounded-md text-sm"
                    >
                        <option value="week">Last Week</option>
                        <option value="month">Last Month</option>
                        <option value="3months">Last 3 Months</option>
                        <option value="year">Last Year</option>
                        <option value="all">All Time</option>
                    </select>
                </div>
                
                {purchases.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <i className="fas fa-history text-4xl mb-2"></i>
                        <p>No purchase history yet</p>
                        <p className="text-sm">Your grocery purchases will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {purchases.map(purchase => (
                            <div 
                                key={purchase.id} 
                                className={`border rounded-lg overflow-hidden ${selectedPurchase?.id === purchase.id ? 'border-indigo-500' : 'border-gray-200'}`}
                            >
                                <div 
                                    className="p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
                                    onClick={() => setSelectedPurchase(selectedPurchase?.id === purchase.id ? null : purchase)}
                                >
                                    <div>
                                        <p className="font-medium text-gray-800">{purchase.store}</p>
                                        <p className="text-sm text-gray-500">{purchase.date}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-red-500">${purchase.total.toFixed(2)}</p>
                                        <p className="text-sm text-gray-500">{purchase.items.length} items</p>
                                    </div>
                                </div>
                                
                                {selectedPurchase?.id === purchase.id && (
                                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                                        <h3 className="font-medium text-gray-800 mb-2">Purchased Items</h3>
                                        <div className="space-y-2">
                                            {purchase.items.map((item, index) => (
                                                <div key={index} className="flex justify-between">
                                                    <span className="text-gray-800">
                                                        {item.quantity} × {item.name}
                                                    </span>
                                                    <span className="text-gray-800">
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between font-medium">
                                            <span>Total:</span>
                                            <span className="text-red-500">${purchase.total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Spending Trends */}
            <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Spending Trends</h2>
                <div className="chart-container">
                    <canvas id="trendChart"></canvas>
                </div>
            </div>
        </div>
    );
}

// Settings Component
function Settings() {
    const [activeTab, setActiveTab] = useState('profile');
    const [profile, setProfile] = useState({
        name: 'Abudhahir',
        email: 'abudhahir@gmail.com',
        phone: '(123) 456-7890',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
    });
    
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        weeklyReport: true,
        budgetAlerts: true
    });
    
    const [categories, setCategories] = useState([
        'Produce', 'Dairy', 'Meat', 'Bakery', 'Frozen', 'Snacks', 'Beverages', 'Canned Goods'
    ]);
    const [newCategory, setNewCategory] = useState('');
    
    const addCategory = (e) => {
        e.preventDefault();
        if (!newCategory || categories.includes(newCategory)) return;
        setCategories([...categories, newCategory]);
        setNewCategory('');
    };
    
    const removeCategory = (category) => {
        setCategories(categories.filter(c => c !== category));
    };

    const handleProfileSave = (e) => {
        e.preventDefault();
        alert('Profile settings saved!');
    };
    
    const handleNotificationsSave = (e) => {
        e.preventDefault();
        alert('Notification settings saved!');
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
            
            <div className="flex flex-col md:flex-row gap-6">
                {/* Settings Sidebar */}
                <div className="w-full md:w-64 bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Settings</h2>
                    <nav>
                        <ul className="space-y-1">
                            <li>
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full text-left p-3 rounded-lg ${activeTab === 'profile' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'}`}
                                >
                                    <i className="fas fa-user mr-2"></i> Profile
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveTab('notifications')}
                                    className={`w-full text-left p-3 rounded-lg ${activeTab === 'notifications' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'}`}
                                >
                                    <i className="fas fa-bell mr-2"></i> Notifications
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveTab('categories')}
                                    className={`w-full text-left p-3 rounded-lg ${activeTab === 'categories' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'}`}
                                >
                                    <i className="fas fa-tags mr-2"></i> Categories
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveTab('privacy')}
                                    className={`w-full text-left p-3 rounded-lg ${activeTab === 'privacy' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'}`}
                                >
                                    <i className="fas fa-lock mr-2"></i> Privacy & Security
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
                
                {/* Settings Content */}
                <div className="flex-1 bg-white p-6 rounded-lg shadow">
                    {activeTab === 'profile' && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">Profile Settings</h2>
                            <div className="flex flex-col md:flex-row gap-6 mb-8">
                                <div className="flex flex-col items-center">
                                    <img 
                                        src={profile.avatar} 
                                        alt="Profile" 
                                        className="w-32 h-32 rounded-full object-cover mb-4"
                                    />
                                    <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                                        <i className="fas fa-camera mr-1"></i> Change Photo
                                    </button>
                                </div>
                                <div className="flex-1">
                                    <form className="space-y-4" onSubmit={handleProfileSave}>
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                id="name"
                                                value={profile.name}
                                                onChange={(e) => setProfile({...profile, name: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                            <input
                                                type="email"
                                                id="email"
                                                value={profile.email}
                                                onChange={(e) => setProfile({...profile, email: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                            <input
                                                type="tel"
                                                id="phone"
                                                value={profile.phone}
                                                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div className="flex justify-end">
                                            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                                                Save Changes
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'notifications' && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">Notification Preferences</h2>
                            <form onSubmit={handleNotificationsSave}>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-800">Email Notifications</p>
                                            <p className="text-sm text-gray-500">Receive notifications via email</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer" 
                                                checked={notifications.email}
                                                onChange={() => setNotifications({...notifications, email: !notifications.email})}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-800">Push Notifications</p>
                                            <p className="text-sm text-gray-500">Receive push notifications on your device</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer" 
                                                checked={notifications.push}
                                                onChange={() => setNotifications({...notifications, push: !notifications.push})}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-800">Weekly Reports</p>
                                            <p className="text-sm text-gray-500">Get a weekly summary of your spending</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer" 
                                                checked={notifications.weeklyReport}
                                                onChange={() => setNotifications({...notifications, weeklyReport: !notifications.weeklyReport})}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-800">Budget Alerts</p>
                                            <p className="text-sm text-gray-500">Get notified when approaching your budget limit</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer" 
                                                checked={notifications.budgetAlerts}
                                                onChange={() => setNotifications({...notifications, budgetAlerts: !notifications.budgetAlerts})}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                    </div>
                                </div>
                                <div className="flex justify-end mt-6">
                                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                                        Save Preferences
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                    
                    {activeTab === 'categories' && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">Item Categories</h2>
                            <p className="text-gray-600 mb-6">Manage the categories you use to organize your grocery items.</p>
                            
                            <form onSubmit={addCategory} className="mb-6">
                                <div className="flex">
                                    <input
                                        type="text"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Add new category"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Add
                                    </button>
                                </div>
                            </form>
                            
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {categories.map((category, index) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => removeCategory(category)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <i className="fas fa-trash"></i> Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'privacy' && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">Privacy & Security</h2>
                            <div className="space-y-6">
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="text-lg font-medium text-gray-800 mb-2">Change Password</h3>
                                    <form className="space-y-4">
                                        <div>
                                            <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                            <input
                                                type="password"
                                                id="current-password"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                            <input
                                                type="password"
                                                id="new-password"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                            <input
                                                type="password"
                                                id="confirm-password"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div className="flex justify-end">
                                            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                                                Update Password
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Final render call to mount the App component
ReactDOM.render(<App />, document.getElementById('root'));
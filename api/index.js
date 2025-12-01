import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_COOKIE = 'auth_token';

// Middleware
app.use(cors({ 
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use(cookieParser());

// Paths - use /tmp for Vercel serverless
const dataDir = path.join('/tmp', 'data');
const legacyExpensesFile = path.join(dataDir, 'expenses.json');
const legacyGroceriesFile = path.join(dataDir, 'groceries.json');

async function ensureDataFiles() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    await Promise.all([
      fs.stat(legacyExpensesFile).catch(() => fs.writeFile(legacyExpensesFile, JSON.stringify([], null, 2))),
      fs.stat(legacyGroceriesFile).catch(() => fs.writeFile(legacyGroceriesFile, JSON.stringify([], null, 2)))
    ]);
  } catch (err) {
    console.error('Failed to ensure data files', err);
  }
}

async function readJson(filePath) {
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data || '[]');
}

async function writeJson(filePath, data) {
  const tmpPath = `${filePath}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(data, null, 2));
  await fs.rename(tmpPath, filePath);
}

// Auth storage
const usersDir = path.join(dataDir, 'auth');
const usersFile = path.join(usersDir, 'users.json');

async function ensureUsersFile() {
  await fs.mkdir(usersDir, { recursive: true });
  await fs.stat(usersFile).catch(() => fs.writeFile(usersFile, JSON.stringify([], null, 2)));
}

async function findUserByUsername(username) {
  const users = await readJson(usersFile);
  return users.find(u => u.username === username);
}

async function saveUser(user) {
  const users = await readJson(usersFile);
  users.push(user);
  await writeJson(usersFile, users);
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function setAuthCookie(res, token) {
  res.cookie(JWT_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

function clearAuthCookie(res) {
  res.clearCookie(JWT_COOKIE);
}

function authRequired(req, res, next) {
  let token = req.cookies[JWT_COOKIE];
  
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }
  
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.auth = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function getUserId(req) {
  const headerId = req.header('x-user-id');
  const queryId = req.query.userId;
  return (headerId || queryId || 'default').toString().trim();
}

async function ensureUserFiles(userId) {
  const userDir = path.join(dataDir, 'users', userId);
  const expensesPath = path.join(userDir, 'expenses.json');
  const groceriesPath = path.join(userDir, 'groceries.json');
  await fs.mkdir(userDir, { recursive: true });
  await Promise.all([
    fs.stat(expensesPath).catch(() => fs.writeFile(expensesPath, JSON.stringify([], null, 2))),
    fs.stat(groceriesPath).catch(() => fs.writeFile(groceriesPath, JSON.stringify([], null, 2)))
  ]);
  return { userDir, expensesPath, groceriesPath };
}

async function migrateLegacyIfNeeded(userPaths) {
  try {
    const { expensesPath, groceriesPath } = userPaths;
    const [userExpensesExists, userGroceriesExists] = await Promise.all([
      fs.stat(expensesPath).then(() => true).catch(() => false),
      fs.stat(groceriesPath).then(() => true).catch(() => false)
    ]);

    if (!userExpensesExists) {
      const legacyExists = await fs.stat(legacyExpensesFile).then(() => true).catch(() => false);
      if (legacyExists) {
        const legacy = await readJson(legacyExpensesFile);
        if (Array.isArray(legacy) && legacy.length > 0) {
          await writeJson(expensesPath, legacy);
        }
      }
    }

    if (!userGroceriesExists) {
      const legacyExists = await fs.stat(legacyGroceriesFile).then(() => true).catch(() => false);
      if (legacyExists) {
        const legacy = await readJson(legacyGroceriesFile);
        if (Array.isArray(legacy) && legacy.length > 0) {
          await writeJson(groceriesPath, legacy);
        }
      }
    }
  } catch {
    // ignore migration errors
  }
}

// Initialize data files
await ensureDataFiles();

// Auth endpoints
app.post('/auth/signup', async (req, res) => {
  try {
    await ensureUsersFile();
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });
    const existing = await findUserByUsername(username);
    if (existing) return res.status(409).json({ error: 'username already exists' });
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = username;
    await saveUser({ id: userId, username, passwordHash });
    const token = signToken({ sub: userId, username });
    setAuthCookie(res, token);
    res.status(201).json({ id: userId, username, token });
  } catch (e) {
    console.error('Signup error:', e);
    res.status(500).json({ error: 'Failed to signup' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    await ensureUsersFile();
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });
    const user = await findUserByUsername(username);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken({ sub: user.id, username: user.username });
    setAuthCookie(res, token);
    res.json({ id: user.id, username: user.username, token });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'Failed to login' });
  }
});

app.post('/auth/logout', (req, res) => {
  clearAuthCookie(res);
  res.status(204).send();
});

app.get('/auth/me', (req, res) => {
  let token = req.cookies[JWT_COOKIE];
  
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }
  
  if (!token) return res.status(200).json({ authenticated: false });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ authenticated: true, user: { id: decoded.sub, username: decoded.username } });
  } catch {
    return res.status(200).json({ authenticated: false });
  }
});

// Per-user context middleware (only for protected routes)
const userContextMiddleware = async (req, res, next) => {
  try {
    const userId = req.auth?.sub || getUserId(req);
    const userPaths = await ensureUserFiles(userId);
    if (userId === 'default') {
      await migrateLegacyIfNeeded(userPaths);
    }
    req.userId = userId;
    req.userPaths = userPaths;
    next();
  } catch (e) {
    res.status(500).json({ error: 'Failed to initialize user storage' });
  }
};

// Expenses CRUD (protected routes)
app.get('/expenses', authRequired, userContextMiddleware, async (req, res) => {
  try {
    const items = await readJson(req.userPaths.expensesPath);
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: 'Failed to read expenses' });
  }
});

app.post('/expenses', authRequired, userContextMiddleware, async (req, res) => {
  try {
    const payload = req.body || {};
    const items = await readJson(req.userPaths.expensesPath);
    const newItem = { id: uuidv4(), createdAt: new Date().toISOString(), ...payload };
    items.push(newItem);
    await writeJson(req.userPaths.expensesPath, items);
    res.status(201).json(newItem);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

app.put('/expenses/:id', authRequired, userContextMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const items = await readJson(req.userPaths.expensesPath);
    const index = items.findIndex(x => x.id === id);
    if (index === -1) return res.status(404).json({ error: 'Expense not found' });
    const updated = { ...items[index], ...req.body, id };
    items[index] = updated;
    await writeJson(req.userPaths.expensesPath, items);
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

app.delete('/expenses/:id', authRequired, userContextMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const items = await readJson(req.userPaths.expensesPath);
    const next = items.filter(x => x.id !== id);
    if (next.length === items.length) return res.status(404).json({ error: 'Expense not found' });
    await writeJson(req.userPaths.expensesPath, next);
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// Groceries CRUD
app.get('/groceries', authRequired, userContextMiddleware, async (req, res) => {
  try {
    const items = await readJson(req.userPaths.groceriesPath);
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: 'Failed to read groceries' });
  }
});

app.post('/groceries', authRequired, userContextMiddleware, async (req, res) => {
  try {
    const payload = req.body || {};
    const items = await readJson(req.userPaths.groceriesPath);
    const newItem = { id: uuidv4(), createdAt: new Date().toISOString(), ...payload };
    items.push(newItem);
    await writeJson(req.userPaths.groceriesPath, items);
    res.status(201).json(newItem);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create grocery' });
  }
});

app.put('/groceries/:id', authRequired, userContextMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const items = await readJson(req.userPaths.groceriesPath);
    const index = items.findIndex(x => x.id === id);
    if (index === -1) return res.status(404).json({ error: 'Grocery not found' });
    const updated = { ...items[index], ...req.body, id };
    items[index] = updated;
    await writeJson(req.userPaths.groceriesPath, items);
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Failed to update grocery' });
  }
});

app.delete('/groceries/:id', authRequired, userContextMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const items = await readJson(req.userPaths.groceriesPath);
    const next = items.filter(x => x.id !== id);
    if (next.length === items.length) return res.status(404).json({ error: 'Grocery not found' });
    await writeJson(req.userPaths.groceriesPath, next);
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete grocery' });
  }
});

// Export for Vercel serverless
export default app;

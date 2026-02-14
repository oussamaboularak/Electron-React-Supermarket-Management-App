const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs');
const crypto = require('crypto');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

// Authentication handlers
function setupAuthHandlers() {
  // Load users from file
  const loadUsers = () => {
    try {
      const usersPath = path.join(__dirname, '../users.json');
      if (fs.existsSync(usersPath)) {
        const data = fs.readFileSync(usersPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
    return [];
  };

  // Save users to file
  const saveUsers = (users) => {
    try {
      const usersPath = path.join(__dirname, '../users.json');
      fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving users:', error);
      return false;
    }
  };

  // Login handler
  ipcMain.handle('auth-login', async (event, credentials) => {
    try {
      const users = loadUsers();
      const user = users.find(u => 
        (u.username === credentials.username || u.email === credentials.username)
      );

      if (!user) {
        return { success: false, error: 'Invalid username or password' };
      }

      if (!user.isActive) {
        return { success: false, error: 'Account is deactivated' };
      }

      // Check password - handle both plain password and hashed password scenarios
      let passwordValid = false;
      if (user.passwordHash && user.passwordSalt) {
        // For existing users with hashed passwords, use plain password comparison for now
        // In production, you'd want to implement proper password verification
        const crypto = require('crypto');
        const hash = crypto.pbkdf2Sync(credentials.password, user.passwordSalt, 10000, 512, 'sha512').toString('hex');
        passwordValid = hash === user.passwordHash;
      } else if (user.password) {
        // For users with plain passwords (web fallback)
        passwordValid = user.password === credentials.password;
      }

      if (!passwordValid) {
        return { success: false, error: 'Invalid username or password' };
      }

      // Update last login
      user.lastLogin = new Date().toISOString();
      saveUsers(users);

      // Remove sensitive data from response
      const { passwordHash, passwordSalt, password, ...safeUser } = user;
      const sessionToken = 'session-' + Math.random().toString(36).substr(2, 9);

      return {
        success: true,
        user: safeUser,
        sessionToken: sessionToken,
        message: 'Login successful'
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  });

  // Register handler
  ipcMain.handle('auth-register', async (event, userData) => {
    try {
      const users = loadUsers();
      
      // Check if user already exists
      const existingUser = users.find(u => 
        u.username === userData.username || u.email === userData.email
      );

      if (existingUser) {
        return { success: false, error: 'User already exists' };
      }

      // Generate salt and hash password
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.pbkdf2Sync(userData.password, salt, 10000, 512, 'sha512').toString('hex');

      // Create new user
      const newUser = {
        id: 'user-' + Date.now(),
        username: userData.username,
        email: userData.email,
        fullName: userData.fullName || userData.username,
        role: userData.role || 'user',
        isActive: true,
        passwordHash: hash,
        passwordSalt: salt,
        createdAt: new Date().toISOString(),
        lastLogin: null
      };

      users.push(newUser);
      saveUsers(users);

      return { success: true, message: 'User created successfully' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  });

  // Validate session handler
  ipcMain.handle('auth-validate-session', async (event, sessionToken) => {
    try {
      // For simplicity, just check if session token exists and is valid format
      if (sessionToken && sessionToken.startsWith('session-')) {
        // In a real app, you'd validate against stored sessions
        return { isValid: true, user: null };
      }
      return { isValid: false };
    } catch (error) {
      console.error('Session validation error:', error);
      return { isValid: false };
    }
  });

  // Logout handler
  ipcMain.handle('auth-logout', async (event, sessionToken) => {
    try {
      // In a real app, you'd invalidate the session
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false };
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  setupAuthHandlers();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');
const DB = require('./database.js');
const app = express();

const authCookieName = 'token';

// The service port - must use 4000 for backend
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// JSON body parsing using built-in middleware
app.use(express.json());

// Use the cookie parser middleware for tracking authentication tokens
app.use(cookieParser());

// Serve up the front-end static content hosting
app.use(express.static('public'));

// Trust first proxy (needed for production deployment)
app.set('trust proxy', true);

// Router for service endpoints
const apiRouter = express.Router();
app.use('/api', apiRouter);

// CreateAuth - register a new user
apiRouter.post('/auth/create', async (req, res) => {
  if (await DB.getUser(req.body.email)) {
    res.status(409).send({ msg: 'Existing user' });
  } else {
    const user = await createUser(req.body.email, req.body.password);
    console.log('User created, setting cookie with token:', user.token);
    setAuthCookie(res, user.token);
    res.send({ email: user.email });
  }
});

// GetAuth - login an existing user
apiRouter.post('/auth/login', async (req, res) => {
  const user = await DB.getUser(req.body.email);
  if (user) {
    if (await bcrypt.compare(req.body.password, user.password)) {
      user.token = uuid.v4();
      await DB.updateUser(user);
      console.log('Login successful, setting cookie with token:', user.token);
      setAuthCookie(res, user.token);
      res.send({ email: user.email });
      return;
    }
  }
  res.status(401).send({ msg: 'Unauthorized' });
});

// DeleteAuth - logout a user
apiRouter.delete('/auth/logout', async (req, res) => {
  const user = await DB.getUserByToken(req.cookies[authCookieName]);
  if (user) {
    delete user.token;
    await DB.updateUser(user);
  }
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// Middleware to verify that the user is authorized to call an endpoint
const verifyAuth = async (req, res, next) => {
  const authToken = req.cookies[authCookieName];
  console.log('Auth check - Cookie:', authToken);
  console.log('All cookies:', req.cookies);
  
  const user = await DB.getUserByToken(authToken);
  if (user) {
    console.log('User authenticated:', user.email);
    req.user = user; // Attach user to request
    next();
  } else {
    console.log('User NOT authenticated');
    res.status(401).send({ msg: 'Unauthorized' });
  }
};

// GetScores - retrieve all scores (requires authentication)
apiRouter.get('/scores', verifyAuth, async (_req, res) => {
  const scores = await DB.getHighScores();
  res.send(scores);
});

// SubmitScore - submit a new score (requires authentication)
apiRouter.post('/score', verifyAuth, async (req, res) => {
  const newScore = {
    email: req.user.email,
    score: req.body.score,
    game: req.body.game || 'puzzle',
    date: new Date().toISOString(),
  };
  await DB.addScore(newScore);
  const scores = await DB.getHighScores();
  res.send(scores);
});

// ExecutePython - execute Python code and return output (requires authentication)
apiRouter.post('/execute-python', verifyAuth, async (req, res) => {
  const { code, input } = req.body;
  
  if (!code) {
    return res.status(400).send({ error: 'No code provided' });
  }

  try {
    const result = await executePythonCode(code, input);
    res.send(result);
  } catch (error) {
    console.error('Python execution error:', error);
    res.status(500).send({ 
      error: 'Execution failed', 
      message: error.message 
    });
  }
});

// executePythonCode - safely execute Python code with timeout
async function executePythonCode(code, input = '') {
  const { spawn } = require('child_process');
  const path = require('path');
  const fs = require('fs').promises;
  const os = require('os');
  
  // Create a temporary file for the Python code
  const tempDir = os.tmpdir();
  const tempFile = path.join(tempDir, `python_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.py`);
  
  try {
    // Write code to temp file
    await fs.writeFile(tempFile, code, 'utf8');
    
    return new Promise((resolve, reject) => {
      const timeout = 5000; // 5 second timeout
      let stdout = '';
      let stderr = '';
      let timedOut = false;
      
      // Spawn Python process
      const pythonProcess = spawn('python', [tempFile], {
        timeout: timeout,
        killSignal: 'SIGTERM'
      });
      
      // Set up timeout
      const timeoutId = setTimeout(() => {
        timedOut = true;
        pythonProcess.kill('SIGTERM');
        reject(new Error('Execution timed out after 5 seconds'));
      }, timeout);
      
      // If input is provided, write it to stdin
      if (input) {
        pythonProcess.stdin.write(input);
        pythonProcess.stdin.end();
      }
      
      // Capture stdout
      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      // Capture stderr
      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      // Handle process completion
      pythonProcess.on('close', async (code) => {
        clearTimeout(timeoutId);
        
        // Clean up temp file
        try {
          await fs.unlink(tempFile);
        } catch (err) {
          console.error('Failed to delete temp file:', err);
        }
        
        if (timedOut) {
          return; // Already rejected
        }
        
        if (code !== 0 && stderr) {
          resolve({
            success: false,
            output: stdout,
            error: stderr,
            exitCode: code
          });
        } else {
          resolve({
            success: true,
            output: stdout,
            error: stderr || null,
            exitCode: code
          });
        }
      });
      
      // Handle process errors
      pythonProcess.on('error', async (err) => {
        clearTimeout(timeoutId);
        
        // Clean up temp file
        try {
          await fs.unlink(tempFile);
        } catch (unlinkErr) {
          console.error('Failed to delete temp file:', unlinkErr);
        }
        
        reject(new Error(`Failed to start Python: ${err.message}`));
      });
    });
  } catch (error) {
    // Clean up temp file if it exists
    try {
      await fs.unlink(tempFile);
    } catch (err) {
      // Ignore cleanup errors
    }
    throw error;
  }
}

// Default error handler
app.use(function (err, req, res, next) {
  res.status(500).send({ type: err.name, message: err.message });
});

// Return the application's default page if the path is unknown
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// createUser - creates a new user with hashed password
async function createUser(email, password) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    email: email,
    password: passwordHash,
    token: uuid.v4(),
  };
  await DB.addUser(user);
  return user;
}

// setAuthCookie - set the authentication cookie
function setAuthCookie(res, authToken) {
  res.cookie(authCookieName, authToken, {
    secure: false, // Set to false for development (HTTP), true for production (HTTPS)
    httpOnly: true,
    sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility in development
  });
}

// Start the server
app.listen(port, () => {
  console.log(`Pythings backend service listening on port ${port}`);
});
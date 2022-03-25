import express from 'express';
import session from 'express-session';
import { createClient } from 'redis';
import redis from 'connect-redis';
/* eslint no-console: ["error", { allow: ["log"] }] */

const app = express();
const RedisStore = redis(session);
const port = process.env.PORT || 3000;

// Initialise session https://github.com/tj/connect-redis
const sessionClient = createClient({
  url: process.env.URL,
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
  legacyMode: true,
});

try {
  await sessionClient.connect();

  const sessionOptions = {
    store: new RedisStore({ client: sessionClient }),
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: process.env.SESSION_SECRET,
    cookie: {},
    name: 'sessionId', // https://expressjs.com/en/advanced/best-practice-security.html
  };

  // https://github.com/expressjs/session
  if (app.get('env') === 'production') {
    app.set('trust proxy', 1); // trust first proxy
    sessionOptions.cookie.secure = true; // serve secure cookies
  }
  app.use(session(sessionOptions));
} catch (err) {
  console.log({ function: 'sessionClient.connect', message: err.toString() });
}

const saveSession = async (req) => new Promise((resolve, reject) => {
  req.session.save((err) => {
    if (err) reject(err); else resolve('saveSession succeeded');
  });
});

const loginRedis = async (req, pass) => {
  const userClient = createClient({
    url: process.env.URL_TEST,
    username: process.env.USERNAME_TEST,
    password: pass,
  });
  req.session.hits += 1;
  try {
    await userClient.connect();
    await userClient.set('testKey', 'testValue');
    delete req.session.error;
    await saveSession(req);
    return '/success';
  } catch (err) {
    req.session.error = err.toString();
    await saveSession(req);
    return '/fail';
  }
};

app.get('/login_success', async (req, res) => {
  res.redirect(await loginRedis(req, process.env.PASSWORD_TEST));
});

app.get('/login_fail', async (req, res) => {
  res.redirect(await loginRedis(req, 'wrongpassword'));
});

app.get('/success', (req, res) => {
  res.json({ route: 'GET /success', id: req.session.id, session: req.session });
});

app.get('/fail', (req, res) => {
  res.json({ route: 'GET /fail   ', id: req.session.id, session: req.session });
});

app.listen(port, () => {
  console.log({ message: 'Node.js HTTP server listening', script: import.meta.url, port });
});

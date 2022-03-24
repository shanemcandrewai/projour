import path from 'path';
import express from 'express';
import session from 'express-session';
import { createClient } from 'redis';
import redis from 'connect-redis';
/* eslint no-console: ["error", { allow: ["log"] }] */

const app = express();
const RedisStore = redis(session);
const port = process.env.PORT || 3000;

app.use(express.static('docs'));
app.use(express.json());

// Initialise session https://github.com/tj/connect-redis
const sessionClient = createClient({
  url: process.env.URL,
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
  legacyMode: true,
});

let redisStore;
try {
  await sessionClient.connect();

  redisStore = new RedisStore({ client: sessionClient });
  const sessionOptions = {
    store: redisStore,
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

  if (sessionOptions.secret) {
    app.use(session(sessionOptions));
  }
} catch (err) {
  console.log({ function: 'sessionClient.connect', message: err.toString() });
}

// Home
const restrict = (req, res, next) => {
  console.log({ message: 'login restrict', id: req.session.id, session: req.session });
  if ('user' in req.session) {
    console.log({ message: 'logged in', id: req.session.id, session: req.session });
    next();
  } else {
    console.log({ message: 'not logged in', id: req.session.id, session: req.session });
    req.session.from = 'ProJour';
    req.session.message = 'Please log in';
    req.session.save((err) => {
      if (err) {
        console.log({ message: err.toString(), function: 'restrict req.session.save' });
      } else {
        console.log({ message: 'session saved', id: req.session.id, session: req.session });
        res.redirect('/login');
      }
    });
  }
};

app.get('/', restrict, (req, res) => {
  console.log({ message: 'GET /', id: req.session.id, session: req.session });
  if ('shane' in req.session) { req.session.shane += 1; } else { req.session.shane = 1; }
  redisStore.get(req.session.id, (error, sess) => {
    if (error) { res.send(`failed to get session : ${error}`); } else {
      res.send(`${req.session.id} xxx ${JSON.stringify(sess)} <a href="/logout">logout</a>`);
    }
  });
});

// Login
app.get('/login', (req, res) => {
  console.log({
    message: 'GET /login',
    id: req.session.id,
    session: req.session,
    referer: req.get('Referer'),
  });
  res.sendFile(path.resolve('docs/login.html'));
});

// Get session messages
app.get('/messages', (req, res) => {
  console.log({ message: 'GET /messages', id: req.session.id, session: req.session });
  res.send({ from: req.session.from, message: req.session.message });
});

const saveSession = async (req) => new Promise((resolve, reject) => {
  req.session.save((err) => {
    if (err) {
      console.log({
        message: err.toString(), function: 'saveSession', id: req.session.id, session: req.session,
      });
      reject(err.toString());
    } else {
      console.log({
        message: 'session saved', function: 'saveSession', id: req.session.id, session: req.session,
      });
      resolve('saveSession succeeded');
    }
  });
});

// Login post
const loginRedis = async (req, res) => {
  console.log({ message: 'loginRedis', id: req.session.id, session: req.session });
  const userClient = createClient({
    url: process.env.URL_TEST,
    username: process.env.USERNAME_TEST,
    password: process.env.PASSWORD_TEST,
  });
  try {
    await userClient.connect();
    await userClient.set('testKey', 'testValue');
    req.session.user = req.body.user;
    delete req.session.from;
    delete req.session.message;
    await saveSession(req);
    console.log({ message: 'loginRedis saved2', id: req.session.id, session: req.session });
    res.redirect('/');
  } catch (err) {
    req.session.from = req.body.url;
    req.session.message = err.toString();
    console.log({
      message: 'err', function: 'loginRedis userClient', id: req.session.id, session: req.session,
    });
    try {
      await saveSession(req);
      res.redirect('/login');
    } catch (err2) {
      console.log({
        message: 'loginRedis err2', id: req.session.id, session: req.session,
      });
    }
  }
};

app.post('/login', async (req, res) => {
  await loginRedis(req, res);
  console.log({ message: 'login post', id: req.session.id, session: req.session });
});

app.get('/logout', (req, res) => {
  delete req.session.user;
  res.redirect('/login');
});

app.listen(port, () => {
  console.log({ message: 'Node.js HTTP server listening', script: import.meta.url, port });
});

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

  app.use(session(sessionOptions));
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
  if ('hits' in req.session) { req.session.hits += 1; } else { req.session.hits = 1; }
  redisStore.get(req.session.id, (error, sess) => {
    if (error) { res.send(`failed to get session : ${error}`); } else {
      res.send(`session ID ${req.session.id} session variables ${JSON.stringify(sess)} <a href="/logout">logout</a>`);
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
const loginRedis = async (req) => {
  console.log({ message: 'loginRedis', id: req.session.id, session: req.session });
  const userClient = createClient({
    url: process.env.URL_TEST,
    username: process.env.USERNAME_TEST,
    password: process.env.PASSWORD_TEST,
  });
  console.log({
    message: 'createClient', user: process.env.USERNAME_TEST, password: process.env.PASSWORD_TEST, session: req.session,
  });
  try {
    await userClient.connect();
    await userClient.set('testKey', 'testValue');
    req.session.user = process.env.USERNAME_TEST;
    delete req.session.from;
    delete req.session.message;
    await saveSession(req);
    console.log({ message: 'loginRedis userClient succussfully authenticated, session saved', id: req.session.id, session: req.session });
    return '/';
  } catch (err) {
    req.session.from = req.body.url;
    req.session.message = err.toString();
    console.log({
      message: err, function: 'loginRedis userClient failiure', id: req.session.id, session: req.session,
    });
    try {
      await saveSession(req);
      return '/login';
    } catch (err2) {
      console.log({
        message: 'loginRedis session save failiure', id: req.session.id, session: req.session,
      });
    }
  }
  return 'unreachable';
};

app.post('/login', async (req, res) => {
  const rd = await loginRedis(req, res);
  console.log({
    message: 'login post redirect', redirect: rd, id: req.session.id, session: req.session,
  });
  res.redirect(rd);
  console.log({ message: 'login post', id: req.session.id, session: req.session });
});

app.get('/logout', (req, res) => {
  delete req.session.user;
  console.log({ message: 'logout', id: req.session.id, session: req.session });
  res.redirect('/login');
});

app.listen(port, () => {
  console.log({ message: 'Node.js HTTP server listening', script: import.meta.url, port });
});

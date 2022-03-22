import helmet from 'helmet';
import path from 'path';
import express from 'express';
import session from 'express-session';
import { createClient } from 'redis';
import redis from 'connect-redis';
import { createLogger, format, transports } from 'winston';

const app = express();
const RedisStore = redis(session);
const port = process.env.PORT || 3000;

// https://github.com/winstonjs/winston/blob/master/examples/color-message.js

const logger = createLogger({
  format: format.combine(
    format.colorize(),
    format.prettyPrint(),
  ),
  transports: [
    new transports.Console(),
  ],
});

// middleware

// https://helmetjs.github.io/
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      scriptSrc: ["'self'",
        'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js'],
      connectSrc: ['http://localhost:3000/login', 'http://localhost:3000/messages'],
    },
  }),
);
app.use(express.static('docs'));
// app.use(express.json());

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
  logger.error({ function: 'sessionClient.connect', message: err.toString() });
}

// Home
const restrict = (req, res, next) => {
  logger.warn({ message: 'login restrict', id: req.session.id, session: req.session });
  if ('user' in req.session) {
    logger.warn({ message: 'logged in', id: req.session.id, session: req.session });
    next();
  } else {
    logger.warn({ message: 'not logged in', id: req.session.id, session: req.session });
    req.session.from = 'ProJour';
    req.session.message = 'Please log in';
    req.session.save((err) => {
      if (err) {
        logger.error({ message: err.toString(), function: 'req.session.save' });
      } else {
        logger.warn({ message: 'session saved', id: req.session.id, session: req.session });
        res.redirect('/login');
      }
    });
  }
};

app.get('/', restrict, (req, res) => {
  logger.warn({ message: 'GET /', id: req.session.id, session: req.session });
  if ('shane' in req.session) { req.session.shane += 1; } else { req.session.shane = 1; }
  redisStore.get(req.session.id, (error, sess) => {
    if (error) { res.send(`failed to get session : ${error}`); } else {
      res.send(`${req.session.id} xxx ${JSON.stringify(sess)} <a href="/logout">logout</a>`);
    }
  });
});

// Login
app.get('/login', (req, res) => {
  logger.info({
    message: 'GET /login',
    id: req.session.id,
    session: req.session,
    referer: req.get('Referer'),
  });
  res.sendFile(path.resolve('docs/login.html'));
});

// Get session messages
app.get('/messages', (req, res) => {
  logger.info({ message: 'GET /messages', id: req.session.id, session: req.session });
  res.send({ from: req.session.from, message: req.session.message });
});

const loginRedis = async (req, res, next) => {
  logger.warn('xxx');
  const userClient = createClient({
    url: req.body.url,
    username: req.body.user,
    password: req.body.password,
  });
  try {
    await userClient.connect();
    await userClient.set('testKey', 'testValue');
    req.session.user = req.body.user;
    await req.session.save((err) => {
      if (err) { logger.error({ message: err.toString(), function: 'req.session.save' }); }
    });
    delete req.session.from;
    delete req.session.message;
  } catch (err) {
    logger.error({ message: err.toString(), function: 'loginRedis' });
    req.session.from = req.body.url;
    req.session.message = err.toString();
  }
  next();
};

app.post('/login', loginRedis, (req, res) => {
  logger.info({ message: 'login post', id: req.session.id, session: req.session });
  res.json(req.session);
});

app.get('/logout', (req, res) => {
  delete req.session.user;
  res.redirect('/login');
});

app.listen(port, () => {
  logger.info({ message: 'Node.js HTTP server listening', script: import.meta.url, port });
});

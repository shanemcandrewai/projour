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
    format.simple(),
  ),
  transports: [
    new transports.Console(),
  ],
});

// HTTP header security https://helmetjs.github.io/
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      scriptSrc: ["'self'",
        'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js'],
      connectSrc: ['http://localhost:3000/login', 'https://projour.herokuapp.com/login',
        'http://localhost:3000/message', 'https://projour.herokuapp.com/message'],
    },
  }),
);
app.use(express.static('docs'));
app.use(express.json());

// Initialise session https://github.com/tj/connect-redis
const sessionClient = createClient({
  url: process.env.URL,
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
  legacyMode: true,
});

try {
  await sessionClient.connect();
  await sessionClient.set('testKey', 'testValue');

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
} catch (error) {
  logger.error({ message: error.toString(), function: 'sessionClient.connect' });
}

// Home
const restrict = (req, res, next) => {
  try {
    if ('user' in req.session) next(); else {
      req.session.from = 'ProJour';
      req.session.message = 'Please log in';
      req.session.save((errorSave) => {
        if (errorSave) {
          logger.error({ from: 'ProJour', message: errorSave.toString() });
        }
      });
      res.redirect('/login');
    }
  } catch (error) {
    logger.error({ message: error, function: 'restrict', session: req.session });
  }
};

app.get('/', restrict, (req, res) => {
  res.json({ route: 'GET /', id: req.session.id, session: req.session });
});

app.get('/message', (req, res) => {
  try {
    res.json({ from: req.session.from, message: req.session.message });
  } catch (error) {
    logger.error({ message: error, route: 'GET /message', session: req.session });
  }
});

// Login
app.get('/login', (req, res) => {
  res.sendFile(path.resolve('docs/login.html'));
});

const saveSession = async (req) => new Promise((resolve, reject) => {
  req.session.save((error) => {
    if (error) reject(error.toString());
    else resolve('saveSession succeeded');
  });
});

// Login post
const loginRedis = async (req) => {
  const userClient = createClient({
    url: req.body.url,
    username: req.body.user,
    password: req.body.password,
  });
  try {
    await userClient.connect();
    await userClient.set('testKey', 'testValue');
    req.session.user = req.body.user;
    req.session.from = 'ProJour';
    req.session.message = `Currently logged in as ${req.body.user}`;
    await saveSession(req);
    return {};
  } catch (error) {
    try {
      await saveSession(req);
      return { from: req.body.url, message: error.toString() };
    } catch (errorSave) {
      return { from: 'Projour', message: errorSave.toString() };
    }
  }
};

app.post('/login', async (req, res) => {
  res.json(await loginRedis(req));
});

app.get('/logout', (req, res) => {
  try {
    delete req.session.user;
    delete req.session.from;
    delete req.session.message;
    res.redirect('/login');
  } catch (error) {
    logger.error({ message: error, route: 'GET /logout', session: req.session });
  }
});

app.listen(port, () => {
  logger.info({ message: 'Node.js HTTP server listening', script: import.meta.url, port });
});

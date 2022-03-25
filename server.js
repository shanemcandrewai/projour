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
/* app.use(
  helmet.contentSecurityPolicy({
    directives: {
      scriptSrc: ["'self'",
        'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js'],
      connectSrc: ['http://localhost:3000/login', 'http://localhost:3000/error'],
    },
  }),
); */
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
    if ('user' in req.session) {
      next();
    } else {
      req.session.from = 'ProJour';
      req.session.error = 'Please log in';
      req.session.save((error) => {
        if (error) {
          logger.error({ message: error.toString(), function: 'restrict req.session.save' });
        } else {
          res.redirect('/login');
        }
      });
    }
  } catch (error) {
    const errorMessage = { message: error.toString(), function: 'restrict' };
    logger.error(errorMessage);
    res.json(errorMessage);
  }
};

app.get('/', restrict, (req, res) => {
  res.json({ route: 'GET /', id: req.session.id, session: req.session });
});

// Login
app.get('/login', (req, res) => {
  logger.info({ message: 'GET /login', session: req.session });

  // delete req.session.from;
  // delete req.session.error;
  res.sendFile(path.resolve('docs/login.html'));
});

// Get session error
app.get('/error', (req, res) => {
  logger.info({ message: 'GET /error', session: req.session });
  res.send({ from: req.session.from, error: req.session.error });
});

const saveSession = async (req) => new Promise((resolve, reject) => {
  req.session.save((error) => {
    logger.info({ message: 'error', function: 'saveSession', session: req.session });
    if (error) reject(error); else resolve('saveSession succeeded');
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
    delete req.session.from;
    delete req.session.error;
    await saveSession(req);
    return '/';
  } catch (error) {
    req.session.from = req.body.url;
    req.session.error = error.toString();
    await saveSession(req);
    return '/login';
  }
};

app.post('/login', async (req, res) => {
  const redir = await loginRedis(req);
  logger.info({ message: 'POST /login', session: req.session, redir });
  res.redirect(redir);
});

app.get('/logout', (req, res) => {
  delete req.session.user;
  logger.info({ message: 'GET /logout', session: req.session });
  res.redirect('/login');
});

app.listen(port, () => {
  logger.info({ message: 'Node.js HTTP server listening', script: import.meta.url, port });
});

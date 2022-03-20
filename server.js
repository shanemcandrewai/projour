import helmet from 'helmet';
import express from 'express';
import session from 'express-session';
import { createClient } from 'redis';
import redis from 'connect-redis';
import { createLogger, format, transports } from 'winston';

const app = express();
const RedisStore = redis(session);
const port = process.env.PORT || 3000;
app.set('view engine', 'pug');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.simple(),
  ),
  defaultMeta: { service: 'projour' },
  transports: [
    new transports.File({ filename: 'projour-error.log', level: 'error' }),
    new transports.File({ filename: 'projour-start-combined.log' }),
  ],
});

// If we're not in production then **ALSO** log to the `console`
// with the colorized simple format.
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple(),
    ),
  }));
}

// middleware

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      scriptSrc: ["'self'",
        'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js'],
      connectSrc: ['http://localhost:3000/login'],
    },
  }),
);
app.use(express.static('docs'));
app.use(express.json());

// Initialise session
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
    name: 'sessionId',
  };

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

app.get('/login', (req, res) => {
  logger.warn({ message: 'GET /login', id: req.session.id, session: req.session });
  if (!req.get('Referer')) {
    logger.warn('deleting session fields');
    delete req.session.from;
    delete req.session.message;
  } else {
    logger.warn({ message: 'referer found', referer: req.get('Referer') });
  }
  res.render('login', {
    from: req.session.from,
    message: req.session.message,
  });
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
  logger.warn({ message: 'login post', id: req.session.id, session: req.session });
  res.json(req.session);
});

app.get('/logout', (req, res) => {
  logger.warn('xxxy');
  delete req.session.user;
  res.redirect('/login');
});

const restrict = async (req, res, next) => {
  logger.warn({ message: 'login restrict', id: req.session.id, session: req.session });
  if ('user' in req.session) {
    logger.warn({ message: 'logged in', id: req.session.id, session: req.session });
    next();
  } else {
    logger.warn({ message: 'not logged in', id: req.session.id, session: req.session });
    req.session.from = 'ProJour';
    req.session.message = 'Please log in';
    await req.session.save((err) => {
      if (err) { logger.error({ message: err.toString(), function: 'req.session.save' }); }
    });
    logger.warn({ message: 'session saved', id: req.session.id, session: req.session });
    res.redirect('/login');
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

app.listen(port, () => {
  logger.info({ message: 'Node.js HTTP server listening', script: import.meta.url, port });
});

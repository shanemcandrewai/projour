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

//
// If we're not in production then **ALSO** log to the `console`
// with the colorized simple format.
//
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
      scriptSrc: [
        'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js',
      ],
    },
  }),
);
app.use(express.static('docs'));
app.use(express.urlencoded({ extended: false }));

logger.info({ message: 'populating sessionClient', url: process.env.URL });
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
  logger.info({ function: 'sessionClient.connect', message: err.toString() });
}

app.get('/login', (req, res) => {
  res.render('login');
});

const loginRedis = async (req, res) => {
  logger.info('logging in');
  const userClient = createClient({
    url: req.body.url,
    username: req.body.user,
    password: req.body.password,
  });
  try {
    logger.warn('connecting');
    await userClient.connect();
    logger.warn('connected');
    await userClient.get('test');
    logger.warn('connection test');
    req.session.user = req.body.user;
    req.session.save((err) => {
      if (err) { logger.error({ message: err.toString(), function: 'req.session.save' }); }
    });
    logger.warn({ message: 'loginRedis', user: req.session });
    res.redirect('/');
  } catch (err) {
    logger.error({ message: err.toString(), function: 'loginRedis' });
    res.render('login', { from: req.body.url, message: err.toString() });
  }
};

app.post('/login', (req, res) => {
  logger.info('logging in');
  loginRedis(req, res);
});

app.get('/logout', (req, res) => {
  logger.warn({ message: 'logging out', session: req.session });
  delete req.session.user;
  res.redirect('/login');
});

const restrict = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    logger.warn({ message: 'restrict', session: req.session });
    logger.info({ message: 'not logged in' });
    res.render('login', { from: 'Please log in' });
  }
};

app.get('/', restrict, (req, res) => {
  if (req.sessionID) {
    logger.info({ message: 'session id detected', sessionID: req.sessionID });
    if ('shane' in req.session) { req.session.shane += 1; } else { req.session.shane = 1; }
    redisStore.get(req.sessionID, (error, sess) => {
      if (error) { res.send(`failed to get session : ${error}`); } else {
        res.send(`${req.sessionID} xxx ${JSON.stringify(sess)} <a href="/logout">logout</a>`);
      }
    });
  } else {
    res.send('no session');
  }
});

app.listen(port, () => {
  logger.info({ message: 'Node.js HTTP server listening', script: import.meta.url, port });
});

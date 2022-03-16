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
      connectSrc: [
        'https://www.dropbox.com/oauth2/authorize',
        'https://api.dropboxapi.com/oauth2/token',
        'https://content.dropboxapi.com/2/files/upload',
      ],
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
  logger.error({ function: 'sessionClient.connect', message: err.toString() });
}

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  logger.info('logging in');
  const loginRedis = async () => {
    const userClient = createClient({
      url: req.body.url,
      username: req.body.user,
      password: req.body.password,
    });
    logger.info({ message: 'url', url: userClient.url });
    logger.info({ message: 'user', user: userClient.user });
    logger.info({ message: 'password', password: userClient.password });    
    try {
      await userClient.connect();
      req.session.user = req.body.user;
      logger.info({ message: 'sucessfully logged in', user: req.session.user });
      res.redirect('/');
    } catch (err) {
      logger.error({ message: err.toString(), function: 'client.connect()' });
      res.render('login', { text: 'Message from ', from: 'req.body.url', message: err.toString() });
    }
  };
  loginRedis();
});

app.get('/', (req, res) => {
  if (req.sessionID) {
    logger.info({ message: 'session id detected', sessionID: req.sessionID });
    if (req.session.shane) { req.session.shane += 1; } else { req.session.shane = 1; }
    redisStore.get(req.sessionID, (error, sess) => {
      if (error) { res.send(`failed to get session : ${error}`); } else {
        res.send(`${req.sessionID} xxx ${JSON.stringify(sess)}`);
      }
    });
  } else {
    res.send('no session');
  }
});

app.listen(port, () => {
  logger.info({ message: 'Node.js HTTP server listening', script: import.meta.url, port });
});

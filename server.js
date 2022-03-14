import express from 'express';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import session from 'express-session';
import redis from 'connect-redis';
import helmet from 'helmet';
import { createClient } from 'redis';
import { createLogger, format, transports } from 'winston';

const app = express();
const RedisStore = redis(session);
const port = process.env.PORT || 3000;

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

// retrieve or create session secret
const getSec = async (secfile = 'sessSec.txt') => {
  try {
    return await readFile(secfile, 'utf8');
  } catch (errRead) {
    logger.error({ message: 'readFile', secfile, errRead });
    const sec = (Math.random() + 1).toString(36).substring(2);
    try {
      await writeFile(secfile, sec);
    } catch (errWrite) {
      logger.error({ message: 'writeFile', secfile, errWrite });
    }
    return sec;
  }
};

const redisClient = createClient({
  url: 'redis://redis-11092.c250.eu-central-1-1.ec2.cloud.redislabs.com:11092',
  username: 'admin',
  password: '[password]',
  legacyMode: true,
});

const sess = {
  store: new RedisStore({ client: redisClient }),
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: await getSec(),
  cookie: {},
  name: 'sessionId',
};

if (app.get('env') === 'production') {
  app.set('trust proxy', 1); // trust first proxy
  sess.cookie.secure = true; // serve secure cookies
}

app.use(session(sess));

// Session-persisted message middleware

app.use((req, res, next) => {
  const err = req.session.error;
  const msg = req.session.success;
  delete req.session.error;
  delete req.session.success;

  res.locals.message = '';
  if (err) res.locals.message = `<p class="msg error">${err}</p>`;
  if (msg) res.locals.message = `<p class="msg success">${msg}</p>`;
  next();
});

const restrict = (req, res, next) => {
  logger.error({ message: 'request restricted', originalUrl: req.originalUrl });
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/login');
  }
};

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/restricted', restrict, (req, res) => {
  res.send('Wahoo! restricted area, click to <a href="/logout">logout</a>');
});

app.get('/logout', (req, res) => {
  // destroy the user's session to log them out
  // will be re-created next request
  logger.info({ message: 'logging out', user: req.session.user });
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.get('/login', (req, res) => {
  res.sendFile(path.resolve('docs/login/login.html'));
});

app.post('/login', (req, res) => {
  logger.info('logging in');
  const loginRedis = async () => {
    logger.info({ message: 'url', url: req.body.url });
    logger.info({ message: 'user', user: req.body.user });
    logger.info({ message: 'password', password: req.body.password });
    const client = createClient({
      url: req.body.url,
      username: req.body.user,
      password: req.body.password,
    });
    try {
      await client.connect();
      req.session.user = req.body.user;
      res.send(req.body.user);
    } catch (err) {
      console.log('xxx error', err);
    }
  };
  loginRedis();
});

app.listen(port, () => {
  logger.info({ message: 'Node.js HTTP server listening', script: import.meta.url, port });
});

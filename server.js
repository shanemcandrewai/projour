import express from 'express';
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

app.get('/login', (res) => {
  res.sendFile(path.resolve('docs/login/login.html'));
});

app.post('/login', (req, res, next) => {
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
      let sessionKey = await client.get('sessionKey');
      if (sessionKey === null) {
        sessionKey = (Math.random() + 1).toString(36).substring(2);
        client.set('sessionKey', sessionKey);
      }
      const redisClient = createClient({
        url: req.body.url,
        username: req.body.user,
        password: req.body.password,
        legacyMode: true,
      });
      app.locals.sess = {
        store: new RedisStore({ client: redisClient }),
        resave: false, // don't save session if unmodified
        saveUninitialized: false, // don't create session until something stored
        secret: sessionKey,
        cookie: {},
        name: 'sessionId',
      };
    } catch (err) {
      console.log('xxx error', err);
    }
  };
  loginRedis();
  next();
});

if (!app.locals.sess && app.get('env') === 'production') {
  app.set('trust proxy', 1); // trust first proxy
  app.locals.sess.cookie.secure = true; // serve secure cookies
}

if (app.locals.sess) {
  logger.info({ message: 'sess', sess: app.locals.sess });
  app.use(session(app.locals.sess));
}

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

app.listen(port, () => {
  logger.info({ message: 'Node.js HTTP server listening', script: import.meta.url, port });
});

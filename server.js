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

// const useRedisSession = async () => {
const redisClient = createClient({
  url: app.locals.url,
  username: app.locals.user,
  password: app.locals.password,
  legacyMode: true,
});

const sessionOptions = {
  store: new RedisStore({ client: redisClient }),
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: app.locals.sessSecret,
  cookie: {},
  name: 'sessionId',
};

if (app.get('env') === 'production') {
  app.set('trust proxy', 1); // trust first proxy
  sessionOptions.cookie.secure = true; // serve secure cookies
}

logger.info({ message: 'sessionOptions.secret', secret: sessionOptions.secret });
if (sessionOptions.secret) {
  logger.info({ message: 'use session' });
  app.use(session(sessionOptions));
}
// };

app.get('/', (req, res) => {
  logger.info({ message: 'home', id: req.sessionId });
  if (app.locals.user) {
    res.sendFile(path.resolve('docs/dashboard/dashboard.html'));
  } else {
    res.render('login');
  }
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const loginRedis = async () => {
    const client = createClient({
      url: req.body.url,
      username: req.body.user,
      password: req.body.password,
    });
    try {
      await client.connect();
      app.locals.sessSecret = await client.get('sessSecret');
      if (app.locals.sessSecret === null) {
        app.locals.sessSecret = (Math.random() + 1).toString(36).substring(2);
        client.set('sessSecret', app.locals.sessSecret);
      }
      app.locals.url = req.body.url;
      app.locals.user = req.body.user;
      app.locals.password = req.body.password;
      // await useRedisSession();
      res.redirect('/');
    } catch (err) {
      logger.error({ message: err.toString(), function: 'redis client.connect' });
      res.render('login', { text: 'Message from: ', message: err.toString(), from: req.body.url });
    }
  };
  loginRedis();
});

const restrict = (req, res, next) => {
  if (app.locals.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

app.get('/restricted', restrict, (req, res) => {
  res.send('Wahoo! restricted area, click to <a href="/logout">logout</a>');
});

app.get('/logout', (req, res) => {
  // destroy the user's session to log them out
  // will be re-created next request
  logger.info({ message: 'logging out', user: app.locals.user });
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.listen(port, () => {
  logger.info({ message: 'Node.js HTTP server listening', script: import.meta.url, port });
});

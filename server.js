import express from 'express';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import session from 'express-session';
import helmet from 'helmet';
import { createClient } from 'redis';
import { createLogger, format, transports } from 'winston';

const app = express();
const port = process.env.PORT || 3000;

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  ),
  defaultMeta: { service: 'projour' },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' }),
  ],
});

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
    logger.error(errRead);
    const sec = (Math.random() + 1).toString(36).substring(2);
    try {
      await writeFile(secfile, sec);
    } catch (errWrite) {
      logger.error(errWrite);
    }
    return sec;
  }
};

const sess = {
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
  logger.error('request restricted', req.originalUrl);
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
  logger.info('logging out', req.session.user);
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.get('/login', (req, res) => {
  res.sendFile(path.resolve('docs/login/login.html'));
});

app.post('/login', (req) => {
  logger.info('logging in');
  const loginRedis = async () => {
    logger.info('url', req.body.url);
    console.log('xxx', req.body.url);
    logger.info('username', req.body.user);
    logger.info('password', req.body.password);
    const client = createClient({
      url: req.body.url,
      username: req.body.user,
      password: req.body.password,
    });
    client.on('error', (err) => logger.error('Redis Client Error', err));
    try {
      await client.connect();
      logger.info('connected');
      await client.set('key1', 'value2');
      logger.info(await client.get('key1'));
      await client.quit();
    } catch (e) {
      logger.info('xxx', 'failed');
    }
  };
  loginRedis();
});

app.listen(port, () => {
  logger.info(`Example app listening on port ${port}`);
});

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

const redisClientSecret = createClient({
  url: 'redis://redis-11092.c250.eu-central-1-1.ec2.cloud.redislabs.com:11092',
  username: 'sss',
  password: [password],
});

let sessSecret;
try {
  await redisClientSecret.connect();
  sessSecret = await redisClientSecret.get('sessSecret');
  if (!sessSecret) {
    sessSecret = (Math.random() + 1).toString(36).substring(2);
    await redisClientSecret.set('sessSecret', sessSecret);
  }
} catch (err) {
  logger.error({ function: 'redisClientSecret.connect', message: err.toString() });
}

const redisClientSession = createClient({
  url: app.locals.url,
  username: 'sss',
  password: [password],
  legacyMode: true,
});

let redisStore;
try {
  await redisClientSession.connect();
  redisStore = await new RedisStore({ client: redisClientSession });
} catch (err) {
  logger.error({ function: 'redisClientSession.connect', message: err.toString() });
}

const sessionOptions = {
  store: redisStore,
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: sessSecret,
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

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/', (req, res) => {
  req.session.shane = req.sessionID;
  redisStore.get(req.sessionID, (error, sess) => { res.send(`${req.sessionID} xxx ${JSON.stringify(sess)}`); });
});

app.post('/login', (req, res) => {
  app.locals.url = req.body.url;
  app.locals.user = req.body.user;
  app.locals.password = req.body.password;
  res.send('xxx out');
});

app.listen(port, () => {
  logger.info({ message: 'Node.js HTTP server listening', script: import.meta.url, port });
});

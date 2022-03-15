import express from 'express';
import session from 'express-session';
import { createClient } from 'redis';
import redis from 'connect-redis';

/* eslint no-console: ["error", { allow: ["log"] }] */

const app = express();
const RedisStore = redis(session);
const port = process.env.PORT || 3000;

const redisClientSecret = createClient({
  url: 'redis://redis-11092.c250.eu-central-1-1.ec2.cloud.redislabs.com:11092',
  username: 'sss',
  password: [password],
});

redisClientSecret.on('error', (err) => console.log('Redis Client Error', err));

let sessSecret;
try {
  await redisClientSecret.connect();
  sessSecret = await redisClientSecret.get('sessSecret');
  if (!sessSecret) {
    sessSecret = (Math.random() + 1).toString(36).substring(2);
    await redisClientSecret.set('sessSecret', sessSecret);
  }
} catch (err) {
  console.log('xxx redisClientSecret.connect', err.toString());
}

const redisClientSession = createClient({
  url: 'redis://redis-11092.c250.eu-central-1-1.ec2.cloud.redislabs.com:11092',
  username: 'sss',
  password: [password],
  legacyMode: true,
});

try {
  await redisClientSession.connect();
} catch (err) {
  console.log('xxx redisClientSession.connect', err.toString());
}

const redisStore = new RedisStore({ client: redisClientSession });

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
  console.log('xxx use session');
  app.use(session(sessionOptions));
}

// Access the session as req.session
app.get('/', (req, res) => {
  req.session.shane = 'req.sessionID';
  redisStore.get(req.sessionID, (error, sess) => { res.send(`${req.sessionID} xxx ${JSON.stringify(sess)}`); });
});

app.listen(port, () => {
  console.log('Node.js HTTP server listening', import.meta.url, port);
});

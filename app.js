import Debug from 'debug';
import express from 'express';
import { readFile, writeFile } from 'fs/promises';
import session from 'express-session';

const debug = Debug('app');
const app = express();
const port = 3000;

const getSec = async () => {
  let sec;
  try {
    debug('xxx reading');
    sec = await readFile('sessSec.txt', 'utf8');
  } catch (errRead) {
    debug(errRead);
    sec = (Math.random() + 1).toString(36).substring(3);
    try {
      writeFile('sessSec.txt', sec);
    } catch (errWrite) {
      debug(errWrite);
    }
  }
  return sec;
};

app.use(express.static('docs'));

const sess = {
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: await getSec(),
  cookie: {},
};

if (app.get('env') === 'production') {
  app.set('trust proxy', 1); // trust first proxy
  sess.cookie.secure = true; // serve secure cookies
}

app.use(session(sess));

app.use((req, res, next) => {
  if (!req.session.views) {
    req.session.views = 0;
  }
  req.session.views += 1;
  debug('xxx', req.session.views);
  debug('xxI', req.session.id);
  next();
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/foo', (req, res) => {
  res.send(`you viewed this page ${req.session.views} times`);
});

app.listen(port, () => {
  debug(`Example app listening on port ${port}`);
});

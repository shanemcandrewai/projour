import Debug from 'debug';
import express from 'express';
import { readFile, writeFile } from 'fs/promises';
import session from 'express-session';
import filestore from 'session-file-store';
import bkfd2Password from 'pbkdf2-password';
import path from 'path';

const FileStore = filestore(session);
const hasher = bkfd2Password();
const debug = Debug('app');
const app = express();
const port = 3000;

const getSec = async () => {
  let sec;
  try {
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

const getAuth = async () => {
  let sec;
  try {
    sec = await readFile('auth.json', 'utf8');
  } catch (errRead) {
    debug(errRead);
  }
  return JSON.parce(sec);
};

function authenticate(name, passw, fn) {
  const user = getAuth()[name];
  // query the db for the given username
  if (!user) return fn(null, null);
  // apply the same algorithm to the POSTed password, applying
  // the hash against the pass / salt, if there is a match we
  // found the user
  hasher({ password: passw, salt: user.salt }, (err, pass, salt, hash) => {
    if (err) return fn(err);
    if (hash === user.hash) return fn(null, user);
    fn(null, null);
    return 0;
  });
  return 0;
}

app.use(express.static('docs'));

const sess = {
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: await getSec(),
  cookie: {},
  store: new FileStore({}),
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
  next();
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/foo', (req, res) => {
  res.send(`you viewed this page ${req.session.views} times`);
});

app.get('/logout', (req, res) => {
  // destroy the user's session to log them out
  // will be re-created next request
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.get('/login', (req, res) => {
  const abs = path.resolve('docs/login.html');
  debug('xxx', abs);
  res.sendFile(path.join(abs));
});

app.post('/login', (req, res, next) => {
  authenticate(req.body.username, req.body.password, (err, user) => {
    if (err) return next(err);
    if (user) {
      // Regenerate session when signing in
      // to prevent fixation
      req.session.regenerate(() => {
        // Store the user's primary key
        // in the session store to be retrieved,
        // or in this case the entire user object
        req.session.user = user;
        req.session.success = `Authenticated as ${user.name
        } click to <a href="/logout">logout</a>. `
          + ' You may now access <a href="/restricted">/restricted</a>.';
        res.redirect('back');
      });
    } else {
      req.session.error = 'Authentication failed, please check your '
        + ' username and password.'
        + ' (use "tj" and "foobar")';
      res.redirect('/login');
    }
    return 0;
  });
});

app.listen(port, () => {
  debug(`Example app listening on port ${port}`);
});

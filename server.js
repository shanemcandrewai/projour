import db from 'debug';
import express from 'express';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import session from 'express-session';
import helmet from 'helmet';
import sfs from 'session-file-store';
import pbp from 'pbkdf2-password';

const debug = db('app');
const FileStore = sfs(session);
const hasher = pbp();
const app = express();
const port = process.env.PORT || 3000;

// middleware

app.use(helmet());
app.use(express.static('docs'));
app.use(express.urlencoded({ extended: false }));

// retrieve or create session secret
const getSec = async (secfile = 'sessSec.txt') => {
  try {
    return await readFile(secfile, 'utf8');
  } catch (errRead) {
    debug(errRead);
    const sec = (Math.random() + 1).toString(36).substring(3);
    try {
      await writeFile(secfile, sec);
    } catch (errWrite) {
      debug(errWrite);
    }
    return sec;
  }
};

const sess = {
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: await getSec(),
  cookie: {},
  store: new FileStore(),
  name: 'sessionId',
};

if (app.get('env') === 'production') {
  app.set('trust proxy', 1); // trust first proxy
  sess.cookie.secure = true; // serve secure cookies
}

app.use(session(sess));

// Session-persisted message middleware

app.use((req, res, next) => {
  debug('xxx Session-persisted message middleware');
  debug('xxx method', req.method);
  debug('xxx originalUrl', req.originalUrl);
  const err = req.session.error;
  const msg = req.session.success;
  delete req.session.error;
  delete req.session.success;

  res.locals.message = '';
  if (err) res.locals.message = `<p class="msg error">${err}</p>`;
  if (msg) res.locals.message = `<p class="msg success">${msg}</p>`;
  next();
});

// Authenticate using our user with server file
const authenticate = async (name, passw, fn, authfile = 'auth.json') => {
  try {
    // debug('authenticating %s:%s', name, passw);
    const user = JSON.parse(await readFile(authfile, 'utf8'))[name];
    // query the db for the given username
    if (!user) return fn(null, null);
    // apply the same algorithm to the POSTed password, applying
    // the hash against the pass / salt, if there is a match we
    // found the user
    hasher({ password: passw, salt: user.salt }, (err, pass, salt, hash) => {
      if (err) return fn(err);
      if (hash === user.hash) return fn(null, user);
      return fn(null, null);
    });
  } catch (errRead) {
    return errRead;
  }
  return fn(null, null);
};

const restrict = (req, res, next) => {
  debug('xxx restrict');
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
  debug('xxx destroy');
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.get('/login', (req, res) => {
  res.sendFile(path.resolve('docs/sign-in/index.html'));
});

app.post('/login', (req, res, next) => {
  authenticate(req.body.username, req.body.password, (err, user) => {
    if (err) return next(err);
    if (user) {
      // Regenerate session when signing in
      // to prevent fixation
      debug('xxx regenerate');
      req.session.regenerate(() => {
        // Store the user's primary key
        // in the session store to be retrieved,
        // or in this case the entire user object
        req.session.user = req.body.username;
        req.session.success = `Authenticated as ${req.body.username
        } click to <a href="/logout">logout</a>. `
          + ' You may now access <a href="/restricted">/restricted</a>.';
        res.redirect('back');
      });
      debug('xxx regenerate finished');
    } else {
      req.session.error = 'Authentication failed, please check your '
        + ' username and password.'
        + ' (use "tj" and "foobar")';
      // res.redirect('/login');
    }
    return 0;
  });
});

app.listen(port, () => {
  debug(`Example app listening on port ${port}`);
});

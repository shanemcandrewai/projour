const express = require('express');

const app = express();
const session = require('express-session');
const debug = require('debug')('app');
import { readFile } from 'fs/promises';

const port = 3000;

app.use(express.static('docs'));
app.use(express.urlencoded({ extended: false }));

readFile("./GFG_Test.txt")
.then(function(result) {
  console.log(""+result);
})
.catch(function(error) {
   console.log(error);
})


app.use(session({
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
}));

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

// dummy database

const users = {
  tj: { name: 'tj' },
};

function authenticate(name, pass, fn) {
  if (!module.parent) debug('authenticating %s:%s', name, pass);
  const user = users[name];
  // query the db for the given username
  if (!user) {
    return fn(null, null);
  }
  fn(null, null);

  if (pass === user.pass) return fn(null, user);
  fn(null, null);
}

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  debug(`Example app listening at http://localhost:${port}`);
});

import express from 'express';
import { createClient } from 'redis';
/* eslint no-console: ["error", { allow: ["log"] }] */

const app = express();
const port = process.env.PORT || 3000;

/* app.use(express.static('docs'));
app.use(express.json()); */

app.get('/success', (req, res) => {
  res.send('GET /success');
});

app.get('/fail', (req, res) => {
  res.send('GET /fail');
});

const loginRedis = async (pass) => {
  const userClient = createClient({
    url: process.env.URL_TEST,
    username: process.env.USERNAME_TEST,
    password: pass,
  });
  try {
    await userClient.connect();
    await userClient.set('testKey', 'testValue');
    return '/success';
  } catch (err) {
    console.log('err', err);
    return '/fail';
  }
};

app.get('/login_success', async (req, res) => {
  const redir = await loginRedis(process.env.PASSWORD_TEST);
  console.log('redirect', redir);
  res.redirect(redir);
});

app.get('/login_fail', async (req, res) => {
  const redir = await loginRedis('wrongpassword');
  console.log('redirect', redir);
  res.redirect(redir);
});


app.listen(port, () => {
  console.log({ message: 'Node.js HTTP server listening', script: import.meta.url, port });
});

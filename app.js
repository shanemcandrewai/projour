import express from 'express';
import Debug from 'debug';
import { readFile } from 'fs/promises';

const debug = Debug('app');
const app = express();
const port = 3000;

const sec = async () => {
  try {
    debug('xxx reading');
    return await readFile('sessionSecret.txt', 'utf8');
  } catch (err) {
    debug('xxx read failed');
    return err;
  }
};

app.use(express.static('docs'));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  debug(`Example app listening on port ${port}`);
});

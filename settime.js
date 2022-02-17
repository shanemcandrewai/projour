import { readFile, writeFile } from 'fs/promises';
import Debug from 'debug';

const debug = Debug('app');

try {
  debug('xxx reading');
  const cont = await readFile('settime.js', 'utf8');
  debug(cont);
  try {
    debug('xxx writing');
    const ret = await writeFile('settime2.js', cont);
    debug(ret);
  } catch (err) {
    debug('xxx write failed');
    debug(err);
  }
  debug('xxx finished');
} catch (err) {
  debug('xxx read failed');
  debug(err);
}

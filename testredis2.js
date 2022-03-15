import { createClient } from 'redis';
/* eslint-disable no-console */
const test = async () => {
  const client = createClient({
    url: 'redis://redis-11092.c250.eu-central-1-1.ec2.cloud.redislabs.com:11092',
    username: 'sss',
    password: 'Ls9giU2U;',
  });
  // client.on('error', (err) => console.log('Redis Client Error', err));

  try {
    await client.connect();
    console.log('xxx', 'connected');
    let sessionKey = await client.get('sessionKey');
    if (sessionKey === null) {
      sessionKey = (Math.random() + 1).toString(36).substring(2);
      client.set('sessionKey', sessionKey);
    }
    console.log('xxx sessionKey', sessionKey);
    await client.quit();
  } catch (err) {
    console.log('xxx client failed', err);
  }
};
test();

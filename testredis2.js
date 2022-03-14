import { createClient } from 'redis';
/* eslint-disable no-console */
const test = async () => {
  const client = createClient({
    url: 'redis://redis-11092.c250.eu-central-1-1.ec2.cloud.redislabs.com:11092',
    username: 'sss',
    password: 'Ls9giU2U;',
  });
  client.on('error', (err) => console.log('Redis Client Error', err));

  try {
    await client.connect();
    console.log('xxx', 'connected');
    await client.set('key1', 'value2');
    console.log(await client.get('key1'));
    await client.quit();
  } catch (e) {
    console.log('xxx', 'failed');
  }
};
await test();
